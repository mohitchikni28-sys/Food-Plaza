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
    console.error('Error reading db in Next.js route', err);
  }
  return { menuItems: [] };
}

function saveDatabase(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db in Next.js route', err);
  }
}

// GET /api/menu (Next.js App Router Handler)
export async function GET() {
  const db = getDatabase();
  return Response.json(db.menuItems || []);
}

// POST /api/menu (Next.js App Router Handler)
export async function POST(request: Request) {
  try {
    const item = await request.json();
    const db = getDatabase();
    if (!db.menuItems) db.menuItems = [];
    
    const newItem = {
      id: item.id || `item-${Date.now()}`,
      name: item.name,
      hindiName: item.hindiName || '',
      description: item.description || '',
      price: Number(item.price),
      category: item.category || 'thali',
      imageUrl: item.imageUrl || '/images/food_deluxe_thali.jpg',
      isAvailable: item.isAvailable ?? true,
      isFeatured: item.isFeatured ?? false,
      spiceLevel: item.spiceLevel || 'Medium',
      stockCount: Number(item.stockCount ?? 50),
      minThreshold: Number(item.minThreshold ?? 10),
      prepTimeMinutes: Number(item.prepTimeMinutes ?? 10),
    };

    db.menuItems.unshift(newItem);
    saveDatabase(db);
    return Response.json(newItem, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}

// PUT /api/menu (Next.js App Router Handler)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const index = db.menuItems?.findIndex((m: any) => m.id === body.id);
    if (index === -1 || index === undefined) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    db.menuItems[index] = { ...db.menuItems[index], ...body };
    saveDatabase(db);
    return Response.json(db.menuItems[index]);
  } catch (error) {
    return Response.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

// DELETE /api/menu?id=... (Next.js App Router Handler)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

  const db = getDatabase();
  db.menuItems = db.menuItems?.filter((m: any) => m.id !== id) || [];
  saveDatabase(db);
  return Response.json({ success: true });
}
