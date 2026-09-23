/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SECURITY ARCHITECTURE NOTE:
 * This is a frontend-only demonstration & prototype admin system.
 * The password authentication implemented here is a client-side gate designed
 * to prevent accidental visitor access without requiring an external backend.
 * 
 * In a production deployment:
 * 1. Admin authentication should be moved to a secure JWT / session-based server backend (e.g. Firebase Auth / OAuth / NextAuth).
 * 2. Menu data, orders, inventory state, and images should be persisted in a secured database (e.g. Cloud SQL / Firestore)
 *    with server-side authorization checks and image object storage (e.g. Cloud Storage).
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  Utensils,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Building,
  Boxes,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  AlertTriangle,
  RotateCcw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Category,
  GalleryItem,
  MenuItem,
  Offer,
  OrderRecord,
  RestaurantInfo,
} from '../../types/restaurant';
import {
  clearOrderHistory,
  getStoredOrders,
  resetAllDataToDefault,
  saveStoredCategories,
  saveStoredGallery,
  saveStoredMenu,
  saveStoredOffers,
  saveStoredRestaurantInfo,
  updateOrderStatus,
} from '../../utils/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  menuItems: MenuItem[];
  offers: Offer[];
  galleryItems: GalleryItem[];
  restaurantInfo: RestaurantInfo;
  onRefreshData: () => void;
}

type AdminTab =
  | 'menu'
  | 'categories'
  | 'offers'
  | 'gallery'
  | 'info'
  | 'inventory'
  | 'sales';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  categories,
  menuItems,
  offers,
  galleryItems,
  restaurantInfo,
  onRefreshData,
}) => {
  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('menu');

  // Menu item edit/create form state
  const [editingMenuItem, setEditingMenuItem] = useState<Partial<MenuItem> | null>(null);
  const [menuImagePreview, setMenuImagePreview] = useState<string>('');

  // Category edit/create state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Offer edit/create state
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

  // Gallery edit/create state
  const [editingGalleryItem, setEditingGalleryItem] = useState<Partial<GalleryItem> | null>(null);

  // Restaurant info form state
  const [infoForm, setInfoForm] = useState<RestaurantInfo>(restaurantInfo);

  // Live orders state
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInfoForm(restaurantInfo);
      setOrders(getStoredOrders());
    }
  }, [isOpen, restaurantInfo]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default demo password is "neelam123"
    if (passwordInput.trim() === 'neelam123') {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Incorrect password. (Demo password: neelam123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    onClose();
  };

  // Image upload handler using browser FileReader
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image is larger than 2MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onComplete(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ----------------------------------------------------
  // MENU MANAGEMENT ACTIONS
  // ----------------------------------------------------
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem || !editingMenuItem.name || !editingMenuItem.price) return;

    let updatedList: MenuItem[];
    if (editingMenuItem.id) {
      // Update existing
      updatedList = menuItems.map((item) =>
        item.id === editingMenuItem.id ? ({ ...item, ...editingMenuItem } as MenuItem) : item
      );
    } else {
      // Add new
      const newItem: MenuItem = {
        id: `custom-${Date.now()}`,
        name: editingMenuItem.name,
        hindiName: editingMenuItem.hindiName || '',
        description: editingMenuItem.description || '',
        price: Number(editingMenuItem.price),
        category: editingMenuItem.category || categories[0]?.slug || 'thali',
        imageUrl: editingMenuItem.imageUrl || '/src/assets/images/food_deluxe_thali_1790167666117.jpg',
        isAvailable: editingMenuItem.isAvailable ?? true,
        isFeatured: editingMenuItem.isFeatured ?? false,
        spiceLevel: editingMenuItem.spiceLevel ?? 'Medium',
        stockCount: Number(editingMenuItem.stockCount ?? 50),
        minThreshold: Number(editingMenuItem.minThreshold ?? 10),
        prepTimeMinutes: Number(editingMenuItem.prepTimeMinutes ?? 10),
      };
      updatedList = [newItem, ...menuItems];
    }

    saveStoredMenu(updatedList);
    onRefreshData();
    setEditingMenuItem(null);
    setMenuImagePreview('');
    showToast('Menu item saved successfully!');
  };

  const handleDeleteMenuItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const updatedList = menuItems.filter((i) => i.id !== id);
      saveStoredMenu(updatedList);
      onRefreshData();
      showToast('Item deleted.');
    }
  };

  const handleToggleItemAvailability = (id: string, currentStatus: boolean) => {
    const updatedList = menuItems.map((item) =>
      item.id === id ? { ...item, isAvailable: !currentStatus } : item
    );
    saveStoredMenu(updatedList);
    onRefreshData();
  };

  // ----------------------------------------------------
  // CATEGORIES ACTIONS
  // ----------------------------------------------------
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      slug,
      sortOrder: categories.length + 1,
    };

    const updated = [...categories, newCat];
    saveStoredCategories(updated);
    onRefreshData();
    setNewCategoryName('');
    showToast('Category added!');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Delete category? Items in this category will still remain.')) {
      const updated = categories.filter((c) => c.id !== id);
      saveStoredCategories(updated);
      onRefreshData();
      showToast('Category removed.');
    }
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const copy = [...categories];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // reassign sort order
    const normalized = copy.map((c, idx) => ({ ...c, sortOrder: idx + 1 }));
    saveStoredCategories(normalized);
    onRefreshData();
  };

  // ----------------------------------------------------
  // OFFERS ACTIONS
  // ----------------------------------------------------
  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !editingOffer.title || !editingOffer.code) return;

    let updated: Offer[];
    if (editingOffer.id) {
      updated = offers.map((o) =>
        o.id === editingOffer.id ? ({ ...o, ...editingOffer } as Offer) : o
      );
    } else {
      const newOffer: Offer = {
        id: `off-${Date.now()}`,
        title: editingOffer.title,
        code: editingOffer.code.toUpperCase(),
        description: editingOffer.description || '',
        discountPercent: editingOffer.discountPercent ? Number(editingOffer.discountPercent) : undefined,
        discountAmount: editingOffer.discountAmount ? Number(editingOffer.discountAmount) : undefined,
        minOrderValue: Number(editingOffer.minOrderValue || 0),
        badgeText: editingOffer.badgeText || 'Special Offer',
        isActive: editingOffer.isActive ?? true,
      };
      updated = [newOffer, ...offers];
    }

    saveStoredOffers(updated);
    onRefreshData();
    setEditingOffer(null);
    showToast('Offer saved successfully!');
  };

  const handleDeleteOffer = (id: string) => {
    if (window.confirm('Delete this offer?')) {
      const updated = offers.filter((o) => o.id !== id);
      saveStoredOffers(updated);
      onRefreshData();
      showToast('Offer removed.');
    }
  };

  const handleToggleOffer = (id: string, active: boolean) => {
    const updated = offers.map((o) => (o.id === id ? { ...o, isActive: !active } : o));
    saveStoredOffers(updated);
    onRefreshData();
  };

  // ----------------------------------------------------
  // GALLERY ACTIONS
  // ----------------------------------------------------
  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem || !editingGalleryItem.title || !editingGalleryItem.imageUrl) return;

    let updated: GalleryItem[];
    if (editingGalleryItem.id) {
      updated = galleryItems.map((g) =>
        g.id === editingGalleryItem.id ? ({ ...g, ...editingGalleryItem } as GalleryItem) : g
      );
    } else {
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}`,
        title: editingGalleryItem.title,
        category: editingGalleryItem.category || 'Food',
        imageUrl: editingGalleryItem.imageUrl,
        caption: editingGalleryItem.caption || '',
      };
      updated = [newItem, ...galleryItems];
    }

    saveStoredGallery(updated);
    onRefreshData();
    setEditingGalleryItem(null);
    showToast('Gallery updated!');
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (window.confirm('Delete this gallery photo?')) {
      const updated = galleryItems.filter((g) => g.id !== id);
      saveStoredGallery(updated);
      onRefreshData();
      showToast('Photo removed.');
    }
  };

  // ----------------------------------------------------
  // RESTAURANT INFO ACTIONS
  // ----------------------------------------------------
  const handleSaveRestaurantInfo = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredRestaurantInfo(infoForm);
    onRefreshData();
    showToast('Restaurant information updated live!');
  };

  // ----------------------------------------------------
  // INVENTORY TRACKING ACTIONS
  // ----------------------------------------------------
  const handleUpdateStock = (itemId: string, newCount: number) => {
    const count = Math.max(0, newCount);
    const updated = menuItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            stockCount: count,
            isAvailable: count > 0,
          }
        : item
    );
    saveStoredMenu(updated);
    onRefreshData();
  };

  const handleQuickRestock = (itemId: string, addition: number) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (item) {
      handleUpdateStock(itemId, item.stockCount + addition);
    }
  };

  // ----------------------------------------------------
  // REAL-TIME SALES & REPORTING ACTIONS
  // ----------------------------------------------------
  const handleUpdateStatus = (orderId: string, status: OrderRecord['status']) => {
    updateOrderStatus(orderId, status);
    setOrders(getStoredOrders());
    showToast(`Order status set to ${status}`);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Timestamp', 'Customer Name', 'Phone', 'Order Type', 'Total (INR)', 'Status', 'Items'];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.timestamp).toLocaleString(),
      `"${o.customerName}"`,
      o.customerPhone,
      o.orderType,
      o.totalAmount,
      o.status,
      `"${o.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neelam_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm('Restore all restaurant data to factory defaults? Any custom items will be overwritten.')) {
      resetAllDataToDefault();
      onRefreshData();
      setOrders(getStoredOrders());
      showToast('All data reset to initial defaults.');
    }
  };

  // Sales aggregates
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Cancelled').length;
  const aov = activeOrdersCount > 0 ? Math.round(totalRevenue / activeOrdersCount) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#24211E]/15 h-[90vh] flex flex-col overflow-hidden">
        
        {/* Admin Top Bar */}
        <div className="px-5 py-3.5 bg-[#24211E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B45309] text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-sm tracking-wide">
                  Neelam Food Plaza · Management Console
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded font-mono">
                  Live Local Storage
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Platform 1, Jaipur Railway Station · No Backend Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-md transition-colors cursor-pointer"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-16 right-6 z-50 bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Security Warning Notice */}
        <div className="bg-[#FEF3C7] border-b border-[#F59E0B]/30 px-5 py-2 text-[11px] text-[#78350F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
            <span>
              <strong>Developer Prototype Mode:</strong> All updates persist locally in browser storage and reflect immediately on the customer interface. For production, migrate authentication, menu, and orders to a secured database backend.
            </span>
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleResetData}
              className="text-[10px] text-red-700 hover:text-red-900 font-semibold underline ml-2 whitespace-nowrap cursor-pointer"
            >
              Restore Defaults
            </button>
          )}
        </div>

        {/* Body Container */}
        {!isAuthenticated ? (
          /* Password Login Gate */
          <div className="flex-1 flex items-center justify-center p-6 bg-[#FAF7F2]">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#24211E]/10 shadow-lg text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#B45309] mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-[#24211E]">
                  Admin Gatekeeper
                </h3>
                <p className="text-xs text-[#24211E]/60 mt-1">
                  Enter the management password to edit menu items, prices, offers, and inventory.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[#24211E] mb-1">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full px-3.5 py-2 text-xs border border-[#24211E]/20 rounded-lg focus:outline-none focus:border-[#B45309]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#24211E]/50 hover:text-[#24211E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#B45309] mt-1.5">
                    Demo password: <code className="font-mono font-bold bg-[#FEF3C7] px-1.5 py-0.5 rounded">neelam123</code>
                  </p>
                </div>

                {authError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Unlock Admin Dashboard
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-[#FAF7F2] border-r border-[#24211E]/10 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('menu');
                  setEditingMenuItem(null);
                }}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'menu'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <Utensils className="w-4 h-4 shrink-0" />
                <span>Menu Items ({menuItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <FolderTree className="w-4 h-4 shrink-0" />
                <span>Categories ({categories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <Boxes className="w-4 h-4 shrink-0" />
                <span>Inventory & Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sales')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'sales'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Sales & Reports</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('offers')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'offers'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span>Offers ({offers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'gallery'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Gallery ({galleryItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#24211E]/80 hover:bg-[#F3EDE2]'
                }`}
              >
                <Building className="w-4 h-4 shrink-0" />
                <span>Restaurant Info</span>
              </button>
            </div>

            {/* Main Content Area for Active Tab */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              
              {/* ========================================================
                  TAB 1: MENU ITEMS
                 ======================================================== */}
              {activeTab === 'menu' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#24211E]/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#24211E]">
                        Food Menu Management
                      </h3>
                      <p className="text-xs text-[#24211E]/60">
                        Create, modify prices, update photos, and toggle availability.
                      </p>
                    </div>

                    {!editingMenuItem && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingMenuItem({
                            name: '',
                            hindiName: '',
                            description: '',
                            price: 150,
                            category: categories[0]?.slug || 'thali',
                            imageUrl: '/src/assets/images/food_deluxe_thali_1790167666117.jpg',
                            isAvailable: true,
                            isFeatured: false,
                            spiceLevel: 'Medium',
                            stockCount: 50,
                            minThreshold: 10,
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Food Item</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Form Modal inside Tab */}
                  {editingMenuItem ? (
                    <form onSubmit={handleSaveMenuItem} className="p-5 bg-[#FAF7F2] rounded-xl border border-[#24211E]/15 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#24211E]">
                          {editingMenuItem.id ? 'Edit Menu Item' : 'Create New Menu Item'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingMenuItem(null)}
                          className="text-xs text-[#24211E]/60 hover:text-[#24211E]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">Item Name (English)*</label>
                          <input
                            type="text"
                            required
                            value={editingMenuItem.name || ''}
                            onChange={(e) =>
                              setEditingMenuItem({ ...editingMenuItem, name: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            placeholder="e.g., Paneer Tikka Masala"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Name in Hindi (Optional)</label>
                          <input
                            type="text"
                            value={editingMenuItem.hindiName || ''}
                            onChange={(e) =>
                              setEditingMenuItem({ ...editingMenuItem, hindiName: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            placeholder="e.g., पनीर टिक्का मसाला"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Price (₹ INR)*</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={editingMenuItem.price ?? ''}
                            onChange={(e) =>
                              setEditingMenuItem({
                                ...editingMenuItem,
                                price: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Category*</label>
                          <select
                            value={editingMenuItem.category || categories[0]?.slug}
                            onChange={(e) =>
                              setEditingMenuItem({
                                ...editingMenuItem,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.slug}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Description*</label>
                        <textarea
                          rows={2}
                          value={editingMenuItem.description || ''}
                          onChange={(e) =>
                            setEditingMenuItem({
                              ...editingMenuItem,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg text-xs"
                          placeholder="Rich ingredients, accompaniments, spices..."
                        />
                      </div>

                      {/* Image Upload or URL */}
                      <div>
                        <label className="block text-xs font-semibold mb-1">Food Image</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start">
                          <div className="w-24 h-20 rounded-lg bg-gray-200 overflow-hidden border border-[#24211E]/20 shrink-0">
                            {editingMenuItem.imageUrl ? (
                              <img
                                src={editingMenuItem.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2 w-full text-xs">
                            <input
                              type="text"
                              value={editingMenuItem.imageUrl || ''}
                              onChange={(e) =>
                                setEditingMenuItem({
                                  ...editingMenuItem,
                                  imageUrl: e.target.value,
                                })
                              }
                              placeholder="Image URL or upload below..."
                              className="w-full px-3 py-1.5 bg-white border border-[#24211E]/20 rounded-lg"
                            />
                            <div className="flex items-center gap-2">
                              <label className="px-3 py-1 bg-white border border-[#24211E]/20 rounded-md text-[11px] font-semibold text-[#78350F] hover:bg-[#FAF7F2] cursor-pointer inline-flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload from Device</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleImageFileUpload(e, (dataUrl) => {
                                      setEditingMenuItem({
                                        ...editingMenuItem,
                                        imageUrl: dataUrl,
                                      });
                                    })
                                  }
                                />
                              </label>
                              <span className="text-[10px] text-gray-500">
                                Stored locally in browser
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                        <div>
                          <label className="block font-semibold mb-1">Stock Count</label>
                          <input
                            type="number"
                            min={0}
                            value={editingMenuItem.stockCount ?? 50}
                            onChange={(e) =>
                              setEditingMenuItem({
                                ...editingMenuItem,
                                stockCount: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-[#24211E]/20 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Prep Time (Mins)</label>
                          <input
                            type="number"
                            min={1}
                            value={editingMenuItem.prepTimeMinutes ?? 10}
                            onChange={(e) =>
                              setEditingMenuItem({
                                ...editingMenuItem,
                                prepTimeMinutes: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-[#24211E]/20 rounded-lg"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="isAvailable"
                            checked={editingMenuItem.isAvailable ?? true}
                            onChange={(e) =>
                              setEditingMenuItem({
                                ...editingMenuItem,
                                isAvailable: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-[#B45309] rounded"
                          />
                          <label htmlFor="isAvailable" className="font-semibold cursor-pointer">
                            Available Now
                          </label>
                        </div>

                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="isFeatured"
                            checked={editingMenuItem.isFeatured ?? false}
                            onChange={(e) =>
                              setEditingMenuItem({
                                ...editingMenuItem,
                                isFeatured: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-[#B45309] rounded"
                          />
                          <label htmlFor="isFeatured" className="font-semibold cursor-pointer">
                            Chef Special
                          </label>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#24211E]/10 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMenuItem(null)}
                          className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg cursor-pointer"
                        >
                          Save Item
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* Menu Table */}
                  <div className="border border-[#24211E]/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#FAF7F2] text-[#24211E]/70 font-semibold border-b border-[#24211E]/10">
                          <tr>
                            <th className="p-3">Item</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-center">Stock</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#24211E]/10">
                          {menuItems.map((item) => (
                            <tr key={item.id} className="hover:bg-[#FAF7F2]/50">
                              <td className="p-3 flex items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-[#24211E]">{item.name}</div>
                                  {item.hindiName && (
                                    <div className="text-[11px] text-gray-400">{item.hindiName}</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 uppercase text-[11px] font-medium text-gray-600">
                                {item.category}
                              </td>
                              <td className="p-3 text-right font-bold tabular-nums">
                                ₹{item.price}
                              </td>
                              <td className="p-3 text-center tabular-nums font-semibold">
                                {item.stockCount}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleItemAvailability(item.id, item.isAvailable)
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                                    item.isAvailable && item.stockCount > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.isAvailable && item.stockCount > 0 ? 'In Stock' : 'Unavailable'}
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingMenuItem(item)}
                                  className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                                  title="Edit item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: CATEGORIES
                 ======================================================== */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#24211E]/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#24211E]">
                        Menu Categories
                      </h3>
                      <p className="text-xs text-[#24211E]/60">
                        Add categories, edit names, or reorder the customer navigation tab sequence.
                      </p>
                    </div>
                  </div>

                  {/* Add Category Form */}
                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New Category Name (e.g., Rajasthani Specials, Jain Bhojan)..."
                      className="flex-1 px-3 py-2 text-xs border border-[#24211E]/20 rounded-lg focus:outline-none focus:border-[#B45309]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </form>

                  <div className="border border-[#24211E]/10 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF7F2] text-[#24211E]/70 font-semibold border-b border-[#24211E]/10">
                        <tr>
                          <th className="p-3">Order</th>
                          <th className="p-3">Category Name</th>
                          <th className="p-3">Slug</th>
                          <th className="p-3">Items Count</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#24211E]/10">
                        {categories.map((cat, idx) => {
                          const count = menuItems.filter((m) => m.category === cat.slug).length;
                          return (
                            <tr key={cat.id} className="hover:bg-[#FAF7F2]/50">
                              <td className="p-3 font-mono font-bold text-gray-400">
                                #{idx + 1}
                              </td>
                              <td className="p-3 font-semibold text-[#24211E]">{cat.name}</td>
                              <td className="p-3 font-mono text-gray-500">{cat.slug}</td>
                              <td className="p-3">{count} items</td>
                              <td className="p-3 text-right space-x-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveCategory(idx, 'up')}
                                  className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === categories.length - 1}
                                  onClick={() => handleMoveCategory(idx, 'down')}
                                  className="px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1 text-red-600 hover:text-red-800 ml-2 cursor-pointer"
                                  title="Delete category"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 3: INVENTORY TRACKING DASHBOARD (Requested in Brief)
                 ======================================================== */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24211E]/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#24211E]">
                        Live Inventory & Stock Tracking
                      </h3>
                      <p className="text-xs text-[#24211E]/60">
                        Monitor ingredient and portion stocks in real-time. Automated deduction occurs on WhatsApp order dispatch.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Sufficient</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Low Stock (&lt;10)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>Out of Stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#24211E]/10">
                      <div className="text-xs text-[#24211E]/60">Total Active SKUs</div>
                      <div className="text-2xl font-bold text-[#24211E] mt-1">
                        {menuItems.length}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-800">Low Stock Warnings</div>
                      <div className="text-2xl font-bold text-amber-900 mt-1">
                        {menuItems.filter((i) => i.stockCount > 0 && i.stockCount <= i.minThreshold).length}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <div className="text-xs text-red-800">Out of Stock Dishes</div>
                      <div className="text-2xl font-bold text-red-900 mt-1">
                        {menuItems.filter((i) => !i.isAvailable || i.stockCount <= 0).length}
                      </div>
                    </div>
                  </div>

                  {/* Inventory Table */}
                  <div className="border border-[#24211E]/10 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF7F2] text-[#24211E]/70 font-semibold border-b border-[#24211E]/10">
                        <tr>
                          <th className="p-3">Dish</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Current Stock</th>
                          <th className="p-3">Min Alert Level</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Quick Restock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#24211E]/10">
                        {menuItems.map((item) => {
                          const isOut = !item.isAvailable || item.stockCount <= 0;
                          const isLow = !isOut && item.stockCount <= item.minThreshold;

                          return (
                            <tr key={item.id} className="hover:bg-[#FAF7F2]/50">
                              <td className="p-3">
                                <div className="font-semibold text-[#24211E]">{item.name}</div>
                                <div className="text-[10px] text-gray-500">₹{item.price}</div>
                              </td>
                              <td className="p-3 uppercase text-[11px] font-medium text-gray-600">
                                {item.category}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.stockCount}
                                    onChange={(e) =>
                                      handleUpdateStock(item.id, Number(e.target.value))
                                    }
                                    className="w-16 px-2 py-1 bg-white border border-[#24211E]/20 rounded text-center font-bold"
                                  />
                                  <span className="text-[11px] text-gray-500">portions</span>
                                </div>
                              </td>
                              <td className="p-3 tabular-nums text-gray-600">
                                {item.minThreshold} portions
                              </td>
                              <td className="p-3 text-center">
                                {isOut ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                                    Sold Out
                                  </span>
                                ) : isLow ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickRestock(item.id, 10)}
                                  className="px-2 py-1 bg-white border border-[#24211E]/20 hover:bg-[#FAF7F2] rounded text-[11px] font-semibold text-[#B45309] cursor-pointer"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickRestock(item.id, 25)}
                                  className="px-2 py-1 bg-white border border-[#24211E]/20 hover:bg-[#FAF7F2] rounded text-[11px] font-semibold text-[#B45309] cursor-pointer"
                                >
                                  +25
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStock(item.id, 0)}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-[11px] font-medium text-red-700 cursor-pointer"
                                  title="Mark 0 Stock"
                                >
                                  Mark 0
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 4: REAL-TIME SALES REPORTING (Requested in Brief)
                 ======================================================== */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24211E]/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#24211E]">
                        Real-Time Sales & Order Analytics
                      </h3>
                      <p className="text-xs text-[#24211E]/60">
                        Tracks WhatsApp orders, customer requests, revenue velocity, and coach deliveries.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 text-xs font-semibold text-[#78350F] bg-[#FDE68A]/60 hover:bg-[#FDE68A] border border-[#F59E0B]/30 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Clear all orders history?')) {
                            clearOrderHistory();
                            setOrders([]);
                            showToast('Orders cleared.');
                          }
                        }}
                        className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 bg-red-50 rounded-lg cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-[#24211E]/10 shadow-xs">
                      <div className="text-xs text-[#24211E]/60">Total Revenue Logged</div>
                      <div className="text-2xl font-bold text-[#24211E] mt-1 tabular-nums">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-1">Live order dispatch ledger</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#24211E]/10 shadow-xs">
                      <div className="text-xs text-[#24211E]/60">Orders Count</div>
                      <div className="text-2xl font-bold text-[#24211E] mt-1 tabular-nums">
                        {orders.length}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">WhatsApp checkouts</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#24211E]/10 shadow-xs">
                      <div className="text-xs text-[#24211E]/60">Average Order Value</div>
                      <div className="text-2xl font-bold text-[#24211E] mt-1 tabular-nums">
                        ₹{aov}
                      </div>
                      <div className="text-[10px] text-amber-700 mt-1">~₹250 target aligned</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#24211E]/10 shadow-xs">
                      <div className="text-xs text-[#24211E]/60">Train Berth Deliveries</div>
                      <div className="text-2xl font-bold text-[#24211E] mt-1 tabular-nums">
                        {orders.filter((o) => o.orderType === 'train_delivery').length}
                      </div>
                      <div className="text-[10px] text-blue-700 mt-1">Platform 1 runner dispatches</div>
                    </div>
                  </div>

                  {/* Orders Transaction Table */}
                  <div className="border border-[#24211E]/10 rounded-xl overflow-hidden">
                    <div className="p-3 bg-[#FAF7F2] font-semibold text-xs text-[#24211E] border-b border-[#24211E]/10 flex items-center justify-between">
                      <span>Order Transaction Feed ({orders.length})</span>
                      <span className="text-[11px] text-gray-500 font-normal">
                        Updates when customers tap "Place Order on WhatsApp"
                      </span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-500">
                        No orders recorded yet. Place an order from the front-end to view it here live.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#FAF7F2] text-[#24211E]/70 font-semibold border-b border-[#24211E]/10">
                          <tr>
                            <th className="p-3">Order ID / Time</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Type & Details</th>
                            <th className="p-3">Items Summary</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#24211E]/10">
                          {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#FAF7F2]/50">
                              <td className="p-3">
                                <div className="font-mono font-bold text-[#B45309]">{ord.id}</div>
                                <div className="text-[10px] text-gray-400">
                                  {new Date(ord.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-[#24211E]">{ord.customerName}</div>
                                <div className="text-[11px] text-gray-500">{ord.customerPhone}</div>
                              </td>
                              <td className="p-3">
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 mb-1">
                                  {ord.orderType.replace('_', ' ')}
                                </span>
                                {ord.trainDetails && (
                                  <div className="text-[11px] text-gray-600">
                                    {ord.trainDetails.trainNumberOrName} (Coach {ord.trainDetails.coach || 'Gen'}, Seat {ord.trainDetails.seatBerth || '—'})
                                  </div>
                                )}
                                {ord.deliveryAddress && (
                                  <div className="text-[11px] text-gray-600 truncate max-w-xs">
                                    {ord.deliveryAddress}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="text-[11px] text-[#24211E]/80 line-clamp-2">
                                  {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                                </div>
                              </td>
                              <td className="p-3 text-right font-bold tabular-nums">
                                ₹{ord.totalAmount}
                              </td>
                              <td className="p-3 text-center">
                                <select
                                  value={ord.status}
                                  onChange={(e) =>
                                    handleUpdateStatus(ord.id, e.target.value as OrderRecord['status'])
                                  }
                                  className="text-[11px] font-semibold px-2 py-1 rounded bg-[#FAF7F2] border border-[#24211E]/20"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Preparing">Preparing</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 5: OFFERS
                 ======================================================== */}
              {activeTab === 'offers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#24211E]/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#24211E]">
                        Promotional Deals & Passenger Coupons
                      </h3>
                      <p className="text-xs text-[#24211E]/60">
                        Create discount codes, passenger combos, or seasonal specials.
                      </p>
                    </div>

                    {!editingOffer && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingOffer({
                            title: '',
                            code: '',
                            description: '',
                            discountPercent: 10,
                            minOrderValue: 200,
                            badgeText: 'Special Deal',
                            isActive: true,
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Offer</span>
                      </button>
                    )}
                  </div>

                  {editingOffer && (
                    <form onSubmit={handleSaveOffer} className="p-5 bg-[#FAF7F2] rounded-xl border border-[#24211E]/15 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#24211E]">
                          {editingOffer.id ? 'Edit Offer' : 'Create Offer'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingOffer(null)}
                          className="text-xs text-[#24211E]/60 hover:text-[#24211E]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">Offer Title*</label>
                          <input
                            type="text"
                            required
                            value={editingOffer.title || ''}
                            onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            placeholder="e.g., Train Passenger 15% OFF"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Coupon Code (Uppercase)*</label>
                          <input
                            type="text"
                            required
                            value={editingOffer.code || ''}
                            onChange={(e) => setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg font-mono"
                            placeholder="e.g., TRAIN15"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Discount (% or Flat ₹)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Discount %"
                              value={editingOffer.discountPercent ?? ''}
                              onChange={(e) =>
                                setEditingOffer({
                                  ...editingOffer,
                                  discountPercent: Number(e.target.value) || undefined,
                                  discountAmount: undefined,
                                })
                              }
                              className="px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            />
                            <input
                              type="number"
                              placeholder="Or Flat ₹ Off"
                              value={editingOffer.discountAmount ?? ''}
                              onChange={(e) =>
                                setEditingOffer({
                                  ...editingOffer,
                                  discountAmount: Number(e.target.value) || undefined,
                                  discountPercent: undefined,
                                })
                              }
                              className="px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Min Order Value (₹)</label>
                          <input
                            type="number"
                            value={editingOffer.minOrderValue ?? 0}
                            onChange={(e) =>
                              setEditingOffer({
                                ...editingOffer,
                                minOrderValue: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={editingOffer.description || ''}
                          onChange={(e) =>
                            setEditingOffer({ ...editingOffer, description: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg text-xs"
                          placeholder="Terms and eligibility..."
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-[#24211E]/10">
                        <button
                          type="button"
                          onClick={() => setEditingOffer(null)}
                          className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg cursor-pointer"
                        >
                          Save Offer
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="border border-[#24211E]/10 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF7F2] text-[#24211E]/70 font-semibold border-b border-[#24211E]/10">
                        <tr>
                          <th className="p-3">Offer</th>
                          <th className="p-3">Code</th>
                          <th className="p-3">Discount</th>
                          <th className="p-3">Min Order</th>
                          <th className="p-3 text-center">Active</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#24211E]/10">
                        {offers.map((off) => (
                          <tr key={off.id} className="hover:bg-[#FAF7F2]/50">
                            <td className="p-3 font-semibold text-[#24211E]">{off.title}</td>
                            <td className="p-3 font-mono font-bold text-[#B45309]">{off.code}</td>
                            <td className="p-3">
                              {off.discountPercent ? `${off.discountPercent}% OFF` : `₹${off.discountAmount} OFF`}
                            </td>
                            <td className="p-3 tabular-nums">₹{off.minOrderValue}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleOffer(off.id, off.isActive)}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                                  off.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {off.isActive ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingOffer(off)}
                                className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOffer(off.id)}
                                className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 6: GALLERY
                 ======================================================== */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#24211E]/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#24211E]">
                        Food & Restaurant Gallery
                      </h3>
                      <p className="text-xs text-[#24211E]/60">
                        Replace photos with your own local dish images or add new showcases.
                      </p>
                    </div>

                    {!editingGalleryItem && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingGalleryItem({
                            title: '',
                            category: 'Food',
                            imageUrl: '/src/assets/images/hero_indian_veg_feast_1790167650276.jpg',
                            caption: '',
                          })
                        }
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Photo</span>
                      </button>
                    )}
                  </div>

                  {editingGalleryItem && (
                    <form onSubmit={handleSaveGalleryItem} className="p-5 bg-[#FAF7F2] rounded-xl border border-[#24211E]/15 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#24211E]">
                          {editingGalleryItem.id ? 'Edit Photo' : 'Add Photo'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingGalleryItem(null)}
                          className="text-xs text-[#24211E]/60 hover:text-[#24211E]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">Photo Title*</label>
                          <input
                            type="text"
                            required
                            value={editingGalleryItem.title || ''}
                            onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            placeholder="e.g., Deluxe Thali Platter"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Category (Food, Ambiance, Thali, Snacks)</label>
                          <input
                            type="text"
                            value={editingGalleryItem.category || ''}
                            onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg"
                            placeholder="Food"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Image Source</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start">
                          <div className="w-24 h-20 rounded-lg bg-gray-200 overflow-hidden border border-[#24211E]/20 shrink-0">
                            {editingGalleryItem.imageUrl ? (
                              <img
                                src={editingGalleryItem.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2 w-full text-xs">
                            <input
                              type="text"
                              value={editingGalleryItem.imageUrl || ''}
                              onChange={(e) =>
                                setEditingGalleryItem({ ...editingGalleryItem, imageUrl: e.target.value })
                              }
                              placeholder="Image URL or upload below..."
                              className="w-full px-3 py-1.5 bg-white border border-[#24211E]/20 rounded-lg"
                            />
                            <div>
                              <label className="px-3 py-1 bg-white border border-[#24211E]/20 rounded-md text-[11px] font-semibold text-[#78350F] hover:bg-[#FAF7F2] cursor-pointer inline-flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Image from Device</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleImageFileUpload(e, (dataUrl) => {
                                      setEditingGalleryItem({
                                        ...editingGalleryItem,
                                        imageUrl: dataUrl,
                                      });
                                    })
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Caption</label>
                        <input
                          type="text"
                          value={editingGalleryItem.caption || ''}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#24211E]/20 rounded-lg text-xs"
                          placeholder="Brief description for customer view..."
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-[#24211E]/10">
                        <button
                          type="button"
                          onClick={() => setEditingGalleryItem(null)}
                          className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg cursor-pointer"
                        >
                          Save Photo
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {galleryItems.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 bg-[#FAF7F2] rounded-xl border border-[#24211E]/10 space-y-2 group relative"
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={g.imageUrl}
                            alt={g.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#24211E] truncate">{g.title}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{g.category}</div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-[#24211E]/10">
                          <button
                            type="button"
                            onClick={() => setEditingGalleryItem(g)}
                            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Replace / Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryItem(g.id)}
                            className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 7: RESTAURANT INFORMATION
                 ======================================================== */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[#24211E]/10">
                    <h3 className="font-heading text-lg font-bold text-[#24211E]">
                      Restaurant Profile & Operational Details
                    </h3>
                    <p className="text-xs text-[#24211E]/60">
                      Changes here update the headers, contact info, footer, and WhatsApp message routing immediately.
                    </p>
                  </div>

                  <form onSubmit={handleSaveRestaurantInfo} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Restaurant Name</label>
                        <input
                          type="text"
                          required
                          value={infoForm.name}
                          onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Tagline / Headline</label>
                        <input
                          type="text"
                          required
                          value={infoForm.tagline}
                          onChange={(e) => setInfoForm({ ...infoForm, tagline: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Phone Number (Calling)</label>
                        <input
                          type="text"
                          required
                          value={infoForm.phone}
                          onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value, displayPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">WhatsApp Ordering Number</label>
                        <input
                          type="text"
                          required
                          value={infoForm.whatsappNumber}
                          onChange={(e) => setInfoForm({ ...infoForm, whatsappNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Opening Hours</label>
                        <input
                          type="text"
                          value={infoForm.openingHours}
                          onChange={(e) => setInfoForm({ ...infoForm, openingHours: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Closing Time</label>
                        <input
                          type="text"
                          value={infoForm.closingTime}
                          onChange={(e) => setInfoForm({ ...infoForm, closingTime: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Price for Two (₹)</label>
                        <input
                          type="number"
                          value={infoForm.priceForTwo}
                          onChange={(e) => setInfoForm({ ...infoForm, priceForTwo: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Google Rating (3.8)</label>
                        <input
                          type="number"
                          step={0.1}
                          value={infoForm.googleRating}
                          onChange={(e) => setInfoForm({ ...infoForm, googleRating: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Complete Railway Address</label>
                      <textarea
                        rows={2}
                        value={infoForm.address}
                        onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Platform Location Landmarks</label>
                      <input
                        type="text"
                        value={infoForm.platformDetail}
                        onChange={(e) => setInfoForm({ ...infoForm, platformDetail: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">About Us Section Paragraph 1</label>
                      <textarea
                        rows={3}
                        value={infoForm.aboutParagraph1}
                        onChange={(e) => setInfoForm({ ...infoForm, aboutParagraph1: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">About Us Section Paragraph 2</label>
                      <textarea
                        rows={3}
                        value={infoForm.aboutParagraph2}
                        onChange={(e) => setInfoForm({ ...infoForm, aboutParagraph2: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#24211E]/20 rounded-lg"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#24211E]/10 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Save & Apply Live
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
