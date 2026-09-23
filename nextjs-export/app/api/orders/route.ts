/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function getDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading db in Next.js orders route', err);
  }
  return { orders: [], menuItems: [] };
}

function saveDatabase(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db in Next.js orders route', err);
  }
}

// GET /api/orders (Next.js App Router Handler)
export async function GET() {
  const db = getDatabase();
  return Response.json(db.orders || []);
}

// POST /api/orders (Next.js App Router Handler)
export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const db = getDatabase();
    if (!db.orders) db.orders = [];

    const orderId = orderData.id || `ORD-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      id: orderId,
      timestamp: new Date().toISOString(),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      orderType: orderData.orderType || 'station_pickup',
      trainDetails: orderData.trainDetails,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: 'Pending',
    };

    // Auto-decrement inventory stock counts on the server
    if (db.menuItems && Array.isArray(orderData.items)) {
      orderData.items.forEach((ordItem: { id: string; quantity: number }) => {
        const match = db.menuItems.find((m: any) => m.id === ordItem.id);
        if (match) {
          match.stockCount = Math.max(0, match.stockCount - ordItem.quantity);
          match.isAvailable = match.stockCount > 0;
        }
      });
    }

    db.orders.unshift(newOrder);
    saveDatabase(db);

    return Response.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to process order' }, { status: 500 });
  }
}

// PATCH /api/orders (Next.js App Router Handler)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const db = getDatabase();
    const order = db.orders?.find((o: any) => o.id === id);
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
    order.status = status;
    saveDatabase(db);
    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
