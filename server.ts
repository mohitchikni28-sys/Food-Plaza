/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_GALLERY,
  DEFAULT_MENU_ITEMS,
  DEFAULT_OFFERS,
  DEFAULT_RECENT_ORDERS,
  DEFAULT_RESTAURANT_INFO,
} from './src/data/defaultData.ts';
import { Category, GalleryItem, MenuItem, Offer, OrderRecord, RestaurantInfo } from './src/types/restaurant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'server-data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure server data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  restaurantInfo: RestaurantInfo;
  categories: Category[];
  menuItems: MenuItem[];
  offers: Offer[];
  galleryItems: GalleryItem[];
  orders: OrderRecord[];
  adminTokens: string[];
}

function getInitialDb(): DatabaseSchema {
  return {
    restaurantInfo: DEFAULT_RESTAURANT_INFO,
    categories: DEFAULT_CATEGORIES,
    menuItems: DEFAULT_MENU_ITEMS,
    offers: DEFAULT_OFFERS,
    galleryItems: DEFAULT_GALLERY,
    orders: DEFAULT_RECENT_ORDERS,
    adminTokens: [],
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
  }
  const initial = getInitialDb();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

let db = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '15mb' }));

  // API Router
  const api = express.Router();

  // 1. Health check & status
  api.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Neelam Food Plaza Full-Stack Backend',
      timestamp: new Date().toISOString(),
      ordersCount: db.orders.length,
      menuCount: db.menuItems.length,
    });
  });

  // 2. Authentication
  api.post('/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === 'neelam123') {
      const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      db.adminTokens.push(token);
      saveDatabase(db);
      res.json({ success: true, token, message: 'Authenticated successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password. Demo password is: neelam123' });
    }
  });

  // 3. Restaurant Information
  api.get('/info', (req, res) => {
    res.json(db.restaurantInfo);
  });

  api.put('/info', (req, res) => {
    db.restaurantInfo = { ...db.restaurantInfo, ...req.body };
    saveDatabase(db);
    res.json({ success: true, data: db.restaurantInfo });
  });

  // 4. Categories
  api.get('/categories', (req, res) => {
    res.json(db.categories);
  });

  api.post('/categories', (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      sortOrder: db.categories.length + 1,
    };
    db.categories.push(newCat);
    saveDatabase(db);
    res.status(201).json(newCat);
  });

  api.put('/categories/reorder', (req, res) => {
    const { categories } = req.body;
    if (Array.isArray(categories)) {
      db.categories = categories;
      saveDatabase(db);
      res.json({ success: true, categories: db.categories });
    } else {
      res.status(400).json({ error: 'Expected array of categories' });
    }
  });

  api.delete('/categories/:id', (req, res) => {
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 5. Menu Items
  api.get('/menu', (req, res) => {
    res.json(db.menuItems);
  });

  api.post('/menu', (req, res) => {
    const item = req.body;
    if (!item.name || item.price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const newItem: MenuItem = {
      id: item.id || `item-${Date.now()}`,
      name: item.name,
      hindiName: item.hindiName || '',
      description: item.description || '',
      price: Number(item.price),
      category: item.category || 'thali',
      imageUrl: item.imageUrl || '/src/assets/images/food_deluxe_thali_1790167666117.jpg',
      isAvailable: item.isAvailable ?? true,
      isFeatured: item.isFeatured ?? false,
      spiceLevel: item.spiceLevel || 'Medium',
      stockCount: Number(item.stockCount ?? 50),
      minThreshold: Number(item.minThreshold ?? 10),
      prepTimeMinutes: Number(item.prepTimeMinutes ?? 10),
    };
    db.menuItems.unshift(newItem);
    saveDatabase(db);
    res.status(201).json(newItem);
  });

  api.put('/menu/:id', (req, res) => {
    const id = req.params.id;
    const index = db.menuItems.findIndex((m) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    db.menuItems[index] = { ...db.menuItems[index], ...req.body };
    saveDatabase(db);
    res.json(db.menuItems[index]);
  });

  api.delete('/menu/:id', (req, res) => {
    db.menuItems = db.menuItems.filter((m) => m.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 6. Offers
  api.get('/offers', (req, res) => {
    res.json(db.offers);
  });

  api.post('/offers', (req, res) => {
    const offer = req.body;
    if (!offer.title || !offer.code) {
      return res.status(400).json({ error: 'Title and code are required' });
    }
    const newOffer: Offer = {
      id: offer.id || `off-${Date.now()}`,
      title: offer.title,
      code: offer.code.toUpperCase(),
      description: offer.description || '',
      discountPercent: offer.discountPercent ? Number(offer.discountPercent) : undefined,
      discountAmount: offer.discountAmount ? Number(offer.discountAmount) : undefined,
      minOrderValue: Number(offer.minOrderValue || 0),
      badgeText: offer.badgeText || 'Special Offer',
      isActive: offer.isActive ?? true,
    };
    db.offers.unshift(newOffer);
    saveDatabase(db);
    res.status(201).json(newOffer);
  });

  api.put('/offers/:id', (req, res) => {
    const id = req.params.id;
    const index = db.offers.findIndex((o) => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Offer not found' });
    db.offers[index] = { ...db.offers[index], ...req.body };
    saveDatabase(db);
    res.json(db.offers[index]);
  });

  api.delete('/offers/:id', (req, res) => {
    db.offers = db.offers.filter((o) => o.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 7. Gallery
  api.get('/gallery', (req, res) => {
    res.json(db.galleryItems);
  });

  api.post('/gallery', (req, res) => {
    const g = req.body;
    if (!g.title || !g.imageUrl) {
      return res.status(400).json({ error: 'Title and imageUrl are required' });
    }
    const newItem: GalleryItem = {
      id: g.id || `gal-${Date.now()}`,
      title: g.title,
      category: g.category || 'Food',
      imageUrl: g.imageUrl,
      caption: g.caption || '',
    };
    db.galleryItems.unshift(newItem);
    saveDatabase(db);
    res.status(201).json(newItem);
  });

  api.delete('/gallery/:id', (req, res) => {
    db.galleryItems = db.galleryItems.filter((g) => g.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 8. Real-Time Orders & Sales
  api.get('/orders', (req, res) => {
    res.json(db.orders);
  });

  api.post('/orders', (req, res) => {
    const orderData = req.body;
    if (!orderData.customerName || !orderData.customerPhone || !orderData.items) {
      return res.status(400).json({ error: 'Incomplete order payload' });
    }

    const orderId = orderData.id || `ORD-${Date.now().toString().slice(-4)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      timestamp: new Date().toISOString(),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      orderType: orderData.orderType || 'station_pickup',
      trainDetails: orderData.trainDetails,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items,
      totalAmount: orderData.totalAmount || 0,
      status: 'Pending',
    };

    // Auto-decrement inventory stock counts on the server
    orderData.items.forEach((ordItem: { id: string; quantity: number }) => {
      const match = db.menuItems.find((m) => m.id === ordItem.id);
      if (match) {
        match.stockCount = Math.max(0, match.stockCount - ordItem.quantity);
        match.isAvailable = match.stockCount > 0;
      }
    });

    db.orders.unshift(newOrder);
    saveDatabase(db);

    res.status(201).json({ success: true, order: newOrder });
  });

  api.patch('/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    saveDatabase(db);
    res.json({ success: true, order });
  });

  api.delete('/orders', (req, res) => {
    db.orders = [];
    saveDatabase(db);
    res.json({ success: true, message: 'All orders cleared' });
  });

  // 9. Inventory Endpoints
  api.get('/inventory', (req, res) => {
    const inventory = db.menuItems.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      price: m.price,
      stockCount: m.stockCount,
      minThreshold: m.minThreshold,
      isAvailable: m.isAvailable,
    }));
    res.json(inventory);
  });

  api.patch('/inventory/:id', (req, res) => {
    const { stockCount, isAvailable } = req.body;
    const item = db.menuItems.find((m) => m.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (stockCount !== undefined) {
      item.stockCount = Math.max(0, Number(stockCount));
      item.isAvailable = item.stockCount > 0;
    }
    if (isAvailable !== undefined) {
      item.isAvailable = Boolean(isAvailable);
    }

    saveDatabase(db);
    res.json({ success: true, item });
  });

  // 10. Reset to factory defaults
  api.post('/reset', (req, res) => {
    db = getInitialDb();
    saveDatabase(db);
    res.json({ success: true, message: 'Reset to factory defaults completed' });
  });

  // Mount API router
  app.use('/api', api);

  // Serve Frontend / Vite
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middleware for dev
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Neelam Food Plaza Server] Full-Stack server running on http://0.0.0.0:${PORT}`);
    console.log(`[Neelam Food Plaza Server] REST API available at http://0.0.0.0:${PORT}/api`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
  process.exit(1);
});
