import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { ShoppingBag, CheckCircle, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FusionHighlights } from './components/FusionHighlights';
import { OurStory } from './components/OurStory';
import { MenuSection } from './components/MenuSection';
import { Footer } from './components/Footer';

import { MenuItem, CartItem, RestaurantConfig, SelectedOptionSelection } from './types';
import { INITIAL_MENU_ITEMS, INITIAL_RESTAURANT_CONFIG } from './data/initialMenu';

// Lazy-loaded heavy components (loaded on-demand when modals/drawers open)
const DishDetailModal = lazy(() => import('./components/DishDetailModal').then(m => ({ default: m.DishDetailModal })));
const IngredientMap = lazy(() => import('./components/IngredientMap').then(m => ({ default: m.IngredientMap })));
const ReservationModal = lazy(() => import('./components/ReservationModal').then(m => ({ default: m.ReservationModal })));
const CartDrawer = lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const AdminPortal = lazy(() => import('./components/AdminPortal').then(m => ({ default: m.AdminPortal })));

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig>(INITIAL_RESTAURANT_CONFIG);

  // Cart State with isolated per-session LocalStorage & SessionStorage fallback
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      // Generate or retrieve unique customer session ID for this browser tab/device
      let sessionId = sessionStorage.getItem('sep_customer_session_id');
      if (!sessionId) {
        sessionId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('sep_customer_session_id', sessionId);
      }
      const saved = localStorage.getItem(`sep_cart_items_${sessionId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal Control States
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save cart changes to localStorage for this specific customer session
  useEffect(() => {
    try {
      const sessionId = sessionStorage.getItem('sep_customer_session_id');
      if (sessionId) {
        localStorage.setItem(`sep_cart_items_${sessionId}`, JSON.stringify(cartItems));
      }
    } catch {
      // ignore quota errors
    }
  }, [cartItems]);

  // Toast auto-clear timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Check URL path on mount for unlisted route /management-portal-sep
  useEffect(() => {
    if (window.location.pathname.includes('management-portal-sep') || window.location.search.includes('portal=admin')) {
      setIsAdminPortalOpen(true);
    }
  }, []);

  // Fetch Menu from API
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMenuItems(json.data);
        }
      }
    } catch (err) {
      console.warn('Using default menu data:', err);
    }
  }, []);

  // Fetch Restaurant Config from API
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRestaurantConfig(json.data);
        }
      }
    } catch (err) {
      console.warn('Using default config:', err);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchConfig();
  }, [fetchMenu, fetchConfig]);

  // Cart Management Handlers
  const handleAddToCart = (
    dish: MenuItem,
    selectedOptions: SelectedOptionSelection[] = [],
    customerNote: string = ''
  ) => {
    const optionsExtraTotal = selectedOptions.reduce((acc, opt) => acc + (opt.priceExtra || 0), 0);
    const unitPrice = dish.price + optionsExtraTotal;

    const optionsKey = selectedOptions
      .map((o) => `${o.groupId}:${o.choiceId}`)
      .sort()
      .join('|');
    const noteKey = customerNote.trim().toLowerCase();
    const cartItemId = `${dish.id}-${optionsKey}-${noteKey}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.cartItemId === cartItemId || (!item.cartItemId && item.dish.id === dish.id && selectedOptions.length === 0 && !customerNote)
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          dish,
          quantity: 1,
          selectedOptions,
          customerNote: customerNote.trim(),
          unitPrice,
        },
      ];
    });
    // Do NOT open cart automatically - allow user to choose items first
    setToastMessage(`Added "${dish.name}" to cart`);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          const idToMatch = item.cartItemId || item.dish.id;
          if (idToMatch === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => (item.cartItemId || item.dish.id) !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleDecrementDish = (dishId: string) => {
    setCartItems((prev) => {
      const index = prev.findLastIndex((item) => item.dish.id === dishId);
      if (index === -1) return prev;
      const item = prev[index];
      if (item.quantity > 1) {
        const updated = [...prev];
        updated[index] = { ...item, quantity: item.quantity - 1 };
        return updated;
      } else {
        return prev.filter((_, i) => i !== index);
      }
    });
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2B231D] flex flex-col font-sans selection:bg-[#C23B22] selection:text-white">
      
      {/* Sticky Header Navigation */}
      <Navbar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreMenu={scrollToMenu}
          onOpenReservation={() => setIsReservationOpen(true)}
        />

        {/* Fusion Highlights Carousel */}
        <FusionHighlights
          items={menuItems}
          cartItems={cartItems}
          onSelectDish={(dish) => setSelectedDish(dish)}
          onAddToCart={handleAddToCart}
          onDecrementDish={handleDecrementDish}
        />

        {/* Our Story & Culinary Philosophy */}
        <OurStory />

        {/* Interactive Menu Section */}
        <MenuSection
          items={menuItems}
          cartItems={cartItems}
          onSelectDish={(dish) => setSelectedDish(dish)}
          onAddToCart={handleAddToCart}
          onDecrementDish={handleDecrementDish}
        />

        {/* Interactive Botanical Ingredient Map */}
        <Suspense fallback={null}>
          <IngredientMap />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer
        config={restaurantConfig}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* MODALS & DRAWERS (LAZY LOADED ON DEMAND) */}
      <Suspense fallback={null}>
        {/* Dish Ingredient Breakdown Modal */}
        {selectedDish && (
          <DishDetailModal
            dish={selectedDish}
            onClose={() => setSelectedDish(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Sliding Order Cart Drawer */}
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            config={restaurantConfig}
          />
        )}

        {/* Table Reservation Modal */}
        {isReservationOpen && (
          <ReservationModal
            isOpen={isReservationOpen}
            onClose={() => setIsReservationOpen(false)}
            config={restaurantConfig}
          />
        )}

        {/* Hidden Management Portal */}
        {isAdminPortalOpen && (
          <AdminPortal
            isOpen={isAdminPortalOpen}
            onClose={() => setIsAdminPortalOpen(false)}
            items={menuItems}
            config={restaurantConfig}
            onMenuUpdated={fetchMenu}
            onConfigUpdated={fetchConfig}
          />
        )}
      </Suspense>

      {/* NON-INTRUSIVE TOAST NOTIFICATION WHEN DISH IS ADDED */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="bg-[#1C3A27] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#E5982A]/40 flex items-center gap-3 max-w-sm">
            <CheckCircle className="w-5 h-5 text-[#E5982A] shrink-0" />
            <span className="text-xs font-medium flex-1">{toastMessage}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-bold text-[#E5982A] underline hover:text-white px-1"
            >
              View Cart
            </button>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING QUICK CHECKOUT BAR IF CART HAS ITEMS & DRAWER IS CLOSED */}
      {cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#C23B22] hover:bg-[#A52F1A] text-white py-3.5 px-6 rounded-full shadow-2xl border border-white/20 flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)} {cartItems.reduce((a, b) => a + b.quantity, 0) === 1 ? 'Item' : 'Items'} Selected
                </p>
                <p className="text-[10px] text-white/80">Tap to review & checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-3.5 py-1.5 rounded-full">
              <span>${cartItems.reduce((a, b) => a + (b.unitPrice || b.dish.price) * b.quantity, 0).toFixed(2)}</span>
              <span className="text-xs">→</span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
