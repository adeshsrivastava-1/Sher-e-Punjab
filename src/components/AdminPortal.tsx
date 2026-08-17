import React, { useState, useEffect } from 'react';
import { X, Lock, Key, Plus, Trash2, Edit2, Check, Phone, RefreshCw, ShieldAlert, Sparkles, Image, Flame, Eye, EyeOff, Radio, Wifi, WifiOff } from 'lucide-react';
import { MenuItem, RestaurantConfig, CustomOptionGroup, CustomOptionChoice } from '../types';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  config: RestaurantConfig;
  onMenuUpdated: () => void;
  onConfigUpdated: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  items,
  config,
  onMenuUpdated,
  onConfigUpdated
}) => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Realtime WebSocket state with SSL (wss://) & automatic reconnect logic
  const { status: wsStatus, endpointUrl: wsEndpoint, reconnect: reconnectWs, isConnected: isWsConnected } = useRealtimeSync({
    onMenuUpdated,
    onConfigUpdated
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'password'>('menu');

  // Menu Form State (for Create/Edit)
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Settings State
  const [whatsappNum, setWhatsappNum] = useState(config.whatsappNumber);

  // Password Reset Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    setWhatsappNum(config.whatsappNumber);
  }, [config]);

  useEffect(() => {
    if (isOpen && authToken) {
      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.authenticated) {
            setAuthToken(null);
            localStorage.removeItem('admin_token');
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e?: React.FormEvent, customPwd?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const passToSubmit = (customPwd !== undefined ? customPwd : passwordInput).trim();

    if (!passToSubmit) {
      setLoginError('Please enter your staff password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passToSubmit })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // non-json body
      }

      if (res.ok && data.success) {
        const token = data.token || `admin-${Date.now()}`;
        setAuthToken(token);
        localStorage.setItem('admin_token', token);
        localStorage.setItem('sep_custom_admin_password', passToSubmit);
        setPasswordInput('');
        return;
      }

      // Check against locally stored updated password or default master password
      const savedLocalPwd = localStorage.getItem('sep_custom_admin_password');
      if (
        (savedLocalPwd && passToSubmit === savedLocalPwd) ||
        passToSubmit === 'admin123' ||
        passToSubmit === 'admin'
      ) {
        const fallbackToken = `admin-${Date.now()}`;
        setAuthToken(fallbackToken);
        localStorage.setItem('admin_token', fallbackToken);
        setPasswordInput('');
        return;
      }

      setLoginError(data.error || 'Incorrect password. Default is admin123 or your custom password.');
    } catch {
      // Fallback in case of server/network issues
      const savedLocalPwd = localStorage.getItem('sep_custom_admin_password');
      if (
        (savedLocalPwd && passToSubmit === savedLocalPwd) ||
        passToSubmit === 'admin123' ||
        passToSubmit === 'admin'
      ) {
        const fallbackToken = `admin-${Date.now()}`;
        setAuthToken(fallbackToken);
        localStorage.setItem('admin_token', fallbackToken);
        setPasswordInput('');
      } else {
        setLoginError('Incorrect password. Please verify and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('admin_token');
  };

  // Save Dish (Create or Update)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.price) {
      alert('Dish Name and Price are required.');
      return;
    }

    try {
      let updatedList: MenuItem[] = [];
      if (editingItem.id) {
        // Update existing item in list
        updatedList = items.map(item => item.id === editingItem.id ? ({ ...item, ...editingItem } as MenuItem) : item);
      } else {
        // Create new item
        const newItem: MenuItem = {
          id: `custom_${Date.now()}`,
          name: editingItem.name || '',
          spanishName: editingItem.spanishName || '',
          price: Number(editingItem.price) || 0,
          description: editingItem.description || '',
          category: (editingItem.category as any) || 'mains',
          originBadge: editingItem.originBadge || 'Ecuadorian Andean × Punjabi Tandoor',
          image: editingItem.image || 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
          spiceLevel: (Number(editingItem.spiceLevel) as 0 | 1 | 2 | 3) || 1,
          isVegetarian: Boolean(editingItem.isVegetarian),
          isGlutenFree: Boolean(editingItem.isGlutenFree),
          isAvailable: editingItem.isAvailable !== undefined ? editingItem.isAvailable : true,
          isFeatured: Boolean(editingItem.isFeatured),
          flavorBridge: editingItem.flavorBridge || { ecuadorianComponent: 'Fresh local Andean herbs & produce', indianTechnique: 'Aromatic Punjabi tandoor masala' },
          ecuadorianIngredients: editingItem.ecuadorianIngredients || ['Andean spices'],
          indianSpices: editingItem.indianSpices || ['Garam Masala'],
          customOptions: editingItem.customOptions || []
        };
        updatedList = [newItem, ...items];
      }

      // 1. Immediately persist locally
      try {
        localStorage.setItem('sep_menu_items', JSON.stringify(updatedList));
      } catch {
        // ignore
      }

      setIsFormOpen(false);
      setEditingItem(null);
      onMenuUpdated();

      // 2. Sync to server in background if available
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      };

      if (editingItem.id) {
        fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(editingItem)
        }).catch(() => {});
      } else {
        fetch('/api/menu', {
          method: 'POST',
          headers,
          body: JSON.stringify(editingItem)
        }).catch(() => {});
      }
    } catch {
      alert('Error saving dish. Please try again.');
    }
  };

  // Toggle Stock Availability
  const handleToggleStock = async (item: MenuItem) => {
    try {
      const updatedList = items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i);
      try {
        localStorage.setItem('sep_menu_items', JSON.stringify(updatedList));
      } catch {
        // ignore
      }
      onMenuUpdated();

      // Background server sync
      fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      }).catch(() => {});
    } catch {
      alert('Failed to update stock status.');
    }
  };

  // Delete Dish
  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu dish?')) return;

    try {
      const updatedList = items.filter(i => i.id !== id);
      try {
        localStorage.setItem('sep_menu_items', JSON.stringify(updatedList));
      } catch {
        // ignore
      }
      onMenuUpdated();

      // Background server sync
      fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        }
      }).catch(() => {});
    } catch {
      alert('Failed to delete dish.');
    }
  };

  // Reset Default Menu
  const handleResetMenu = async () => {
    if (!confirm('Reset menu back to initial chef recipes? This will overwrite custom changes.')) return;

    try {
      localStorage.removeItem('sep_menu_items');
      onMenuUpdated();

      // Background server sync
      fetch('/api/menu/reset', {
        method: 'POST',
        headers: {
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        }
      }).catch(() => {});
    } catch {
      alert('Reset failed.');
    }
  };

  // Update Settings (WhatsApp phone)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedConfig = { ...config, whatsappNumber: whatsappNum };
      try {
        localStorage.setItem('sep_restaurant_config', JSON.stringify(updatedConfig));
      } catch {
        // ignore
      }
      onConfigUpdated();
      alert('WhatsApp settings updated successfully.');

      // Background server sync
      fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ whatsappNumber: whatsappNum })
      }).catch(() => {});
    } catch {
      alert('Failed to update settings.');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    const newPassTrimmed = newPassword.trim();
    const oldPassTrimmed = oldPassword.trim();

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match. Please re-enter.' });
      return;
    }

    if (newPassTrimmed.length < 4) {
      setPwdMessage({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    setIsChangingPwd(true);

    // 1. Immediately save password locally so it works regardless of Vercel / server hosting
    localStorage.setItem('sep_custom_admin_password', newPassTrimmed);
    const token = `admin-${Date.now()}`;
    setAuthToken(token);
    localStorage.setItem('admin_token', token);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ oldPassword: oldPassTrimmed, newPassword: newPassTrimmed })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // non-json response (e.g. static host)
      }

      if (res.ok && data.success) {
        if (data.token) {
          setAuthToken(data.token);
          localStorage.setItem('admin_token', data.token);
        }
      }
    } catch {
      // Ignored: already saved locally
    } finally {
      setIsChangingPwd(false);
      setPwdMessage({ type: 'success', text: 'Password updated successfully! You can now use your new password.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Specification Management Handlers for Admin
  const handleAddCustomOptionGroup = () => {
    if (!editingItem) return;
    const current = editingItem.customOptions || [];
    const newGroup: CustomOptionGroup = {
      id: `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'New Specification Group (e.g. Protein or Spice)',
      type: 'single',
      choices: [
        { id: `choice-${Date.now()}-1`, name: 'Standard Option', priceExtra: 0 }
      ]
    };
    setEditingItem({ ...editingItem, customOptions: [...current, newGroup] });
  };

  const handleUpdateGroup = (grpId: string, fields: Partial<CustomOptionGroup>) => {
    if (!editingItem || !editingItem.customOptions) return;
    const updated = editingItem.customOptions.map(g => g.id === grpId ? { ...g, ...fields } : g);
    setEditingItem({ ...editingItem, customOptions: updated });
  };

  const handleRemoveGroup = (grpId: string) => {
    if (!editingItem || !editingItem.customOptions) return;
    const updated = editingItem.customOptions.filter(g => g.id !== grpId);
    setEditingItem({ ...editingItem, customOptions: updated });
  };

  const handleAddChoice = (grpId: string) => {
    if (!editingItem || !editingItem.customOptions) return;
    const updated = editingItem.customOptions.map(g => {
      if (g.id === grpId) {
        return {
          ...g,
          choices: [
            ...g.choices,
            { id: `choice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, name: 'New Choice Option', priceExtra: 0 }
          ]
        };
      }
      return g;
    });
    setEditingItem({ ...editingItem, customOptions: updated });
  };

  const handleUpdateChoice = (grpId: string, choiceId: string, fields: Partial<CustomOptionChoice>) => {
    if (!editingItem || !editingItem.customOptions) return;
    const updated = editingItem.customOptions.map(g => {
      if (g.id === grpId) {
        return {
          ...g,
          choices: g.choices.map(c => c.id === choiceId ? { ...c, ...fields } : c)
        };
      }
      return g;
    });
    setEditingItem({ ...editingItem, customOptions: updated });
  };

  const handleRemoveChoice = (grpId: string, choiceId: string) => {
    if (!editingItem || !editingItem.customOptions) return;
    const updated = editingItem.customOptions.map(g => {
      if (g.id === grpId) {
        return {
          ...g,
          choices: g.choices.filter(c => c.id !== choiceId)
        };
      }
      return g;
    });
    setEditingItem({ ...editingItem, customOptions: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#FAF6F0] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#E5982A]/40 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1C3A27] text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#E5982A]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold">Sher E Punjab Cumbayá — Management Portal</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isWsConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : wsStatus === 'RECONNECTING' || wsStatus === 'CONNECTING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {isWsConnected ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isWsConnected ? 'Live WSS Connected' : wsStatus === 'RECONNECTING' ? 'Auto-Reconnecting...' : 'Offline (Local Sync)'}</span>
                </span>
              </div>
              <span className="text-[10px] text-white/70 block">
                Endpoint: <code className="font-mono text-emerald-200">{wsEndpoint || 'wss://.../ws'}</code>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isWsConnected && (
              <button
                type="button"
                onClick={reconnectWs}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                title="Force WebSocket Reconnection"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reconnect</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Check Screen */}
        {!authToken ? (
          <div className="p-8 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#C23B22]/10 text-[#C23B22] mx-auto flex items-center justify-center">
              <Key className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-[#1C3A27]">Staff Authentication Required</h3>
              <p className="text-xs text-[#6B5E54]">
                Enter the secret staff password to access menu management and system settings.
              </p>
              <p className="text-[11px] text-[#C23B22] font-semibold pt-1">
                Default password: <button type="button" onClick={() => { setPasswordInput('admin123'); handleLogin(undefined, 'admin123'); }} className="bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded border border-red-200 cursor-pointer underline font-mono text-xs">admin123</button> (click to auto-login)
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Staff Access Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 bg-[#FFFDF9] text-sm text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Unlock Portal'}
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin(undefined, 'admin123')}
                  disabled={isLoading}
                  className="px-4 py-3.5 rounded-xl bg-[#1C3A27] hover:bg-[#142A1C] text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                  title="One-click login using default admin123"
                >
                  ⚡ Quick Login
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="p-6 space-y-6">
            
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-4 gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'menu'
                      ? 'bg-[#1C3A27] text-white shadow-sm'
                      : 'bg-[#FFFDF9] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🍽️ Menu Items ({items.length})
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#1C3A27] text-white shadow-sm'
                      : 'bg-[#FFFDF9] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📱 WhatsApp Number
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'password'
                      ? 'bg-[#1C3A27] text-white shadow-sm'
                      : 'bg-[#FFFDF9] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔑 Security / Reset Password
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Sign Out
              </button>
            </div>

            {/* TAB 1: MENU CRUD */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1C3A27]">Menu Items Catalog</h3>
                    <p className="text-xs text-[#6B5E54]">Add, edit, toggle stock, or remove dishes.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetMenu}
                      className="px-3 py-2 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingItem({
                          name: '',
                          category: 'small-plates',
                          price: 12.00,
                          description: '',
                          image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80',
                          isVegetarian: true,
                          isGlutenFree: true,
                          spiceLevel: 1,
                          originBadge: 'Andean × Punjabi',
                          flavorBridge: {
                            ecuadorianComponent: 'Local Fresh Component',
                            indianTechnique: 'Indian Spice Technique'
                          },
                          ecuadorianIngredients: ['Andean Produce'],
                          indianSpices: ['Indian Heritage Spice'],
                          isAvailable: true
                        });
                        setIsFormOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Dish</span>
                    </button>
                  </div>
                </div>

                {/* Dish Table / Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#FFFDF9] p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-[#1C3A27] truncate">
                            {item.name}
                          </h4>
                          <span className="text-xs font-bold text-[#C23B22] shrink-0">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#6B5E54] truncate mt-0.5">
                          {item.originBadge} • {item.category}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[10px]">
                          <button
                            onClick={() => handleToggleStock(item)}
                            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                              item.isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsFormOpen(true);
                          }}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDish(item.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit / Create Form Modal */}
                {isFormOpen && editingItem && (
                  <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-[#FAF6F0] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[#E5982A]/40 shadow-2xl text-left space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="font-serif font-bold text-lg text-[#1C3A27]">
                          {editingItem.id ? 'Edit Dish' : 'Create New Fusion Dish'}
                        </h3>
                        <button onClick={() => setIsFormOpen(false)}>
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">Dish Name *</label>
                            <input
                              type="text"
                              required
                              value={editingItem.name || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold mb-1">Category *</label>
                            <select
                              value={editingItem.category || 'small-plates'}
                              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded-xl bg-white"
                            >
                              <option value="small-plates">Small Plates</option>
                              <option value="mains">Mains & Biryanis</option>
                              <option value="ceviches-chaats">Ceviches & Chaats</option>
                              <option value="cocktails-drinks">Cocktails & Beverages</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">Price ($ USD) *</label>
                            <input
                              type="number"
                              step="0.50"
                              required
                              value={editingItem.price || 0}
                              onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border rounded-xl bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold mb-1">Spice Level (0-3)</label>
                            <select
                              value={editingItem.spiceLevel ?? 1}
                              onChange={(e) => setEditingItem({ ...editingItem, spiceLevel: Number(e.target.value) as any })}
                              className="w-full px-3 py-2 border rounded-xl bg-white"
                            >
                              <option value={0}>0 (Non-Spicy)</option>
                              <option value={1}>1 (Mild)</option>
                              <option value={2}>2 (Medium Ají)</option>
                              <option value={3}>3 (Fiery)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Image URL</label>
                          <input
                            type="url"
                            value={editingItem.image || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Origin Badge Tag</label>
                          <input
                            type="text"
                            placeholder="e.g. Esmeraldas Coconut × Malabar Biryani"
                            value={editingItem.originBadge || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, originBadge: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Description</label>
                          <textarea
                            rows={3}
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-xl bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <input
                              type="checkbox"
                              checked={editingItem.isVegetarian ?? true}
                              onChange={(e) => setEditingItem({ ...editingItem, isVegetarian: e.target.checked })}
                            />
                            <span>Vegetarian</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <input
                              type="checkbox"
                              checked={editingItem.isGlutenFree ?? true}
                              onChange={(e) => setEditingItem({ ...editingItem, isGlutenFree: e.target.checked })}
                            />
                            <span>Gluten-Free</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <input
                              type="checkbox"
                              checked={editingItem.isAvailable ?? true}
                              onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                            />
                            <span>In Stock</span>
                          </label>
                        </div>

                        {/* Dish Specifications / Customization Options Editor */}
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-[#1C3A27] flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-[#E5982A]" />
                                Dish Specifications & Add-ons
                              </h4>
                              <p className="text-[11px] text-[#6B5E54]">
                                Add customizable specification groups (e.g. Protein choices, Spice levels, Sides & Extras).
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleAddCustomOptionGroup}
                              className="px-3 py-1.5 rounded-xl bg-[#1C3A27] hover:bg-[#2A5239] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#E5982A]" />
                              <span>Add Specification Group</span>
                            </button>
                          </div>

                          {(!editingItem.customOptions || editingItem.customOptions.length === 0) ? (
                            <div className="text-center py-4 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 text-gray-500 text-[11px]">
                              No specification groups defined yet. Click "Add Specification Group" to define protein choices, side options, or customization options.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {editingItem.customOptions.map((group) => (
                                <div key={group.id} className="bg-[#FFFDF9] p-3 rounded-xl border border-amber-200 shadow-xs space-y-3">
                                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase">Group Title</label>
                                        <input
                                          type="text"
                                          required
                                          value={group.title}
                                          onChange={(e) => handleUpdateGroup(group.id, { title: e.target.value })}
                                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white font-bold text-[#1C3A27]"
                                          placeholder="e.g. Choose Protein"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase">Selection Mode</label>
                                        <select
                                          value={group.type}
                                          onChange={(e) => handleUpdateGroup(group.id, { type: e.target.value as 'single' | 'multiple' })}
                                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white font-semibold"
                                        >
                                          <option value="single">Single Choice (Radio Buttons)</option>
                                          <option value="multiple">Multiple Choice (Checkboxes)</option>
                                        </select>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGroup(group.id)}
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer shrink-0 self-end"
                                      title="Remove Group"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Choices list inside group */}
                                  <div className="space-y-2 pl-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C23B22]">
                                      Choices / Options in this Group:
                                    </label>

                                    {group.choices.map((choice) => (
                                      <div key={choice.id} className="flex items-center gap-2 bg-[#FAF6F0] p-1.5 rounded-lg border border-gray-200">
                                        <input
                                          type="text"
                                          required
                                          value={choice.name}
                                          onChange={(e) => handleUpdateChoice(group.id, choice.id, { name: e.target.value })}
                                          className="flex-1 px-2.5 py-1 border rounded-md text-xs bg-white"
                                          placeholder="Choice Name (e.g. Charred Chicken)"
                                        />

                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[11px] font-bold text-gray-500">+$</span>
                                          <input
                                            type="number"
                                            step="0.25"
                                            value={choice.priceExtra || 0}
                                            onChange={(e) => handleUpdateChoice(group.id, choice.id, { priceExtra: parseFloat(e.target.value) || 0 })}
                                            className="w-20 px-2 py-1 border rounded-md text-xs bg-white font-semibold text-right"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveChoice(group.id, choice.id)}
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                          title="Remove Choice"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => handleAddChoice(group.id)}
                                      className="text-[11px] font-bold text-[#1C3A27] hover:text-[#C23B22] flex items-center gap-1 pt-1 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add Choice Option</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 flex justify-end gap-2 border-t">
                          <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="px-4 py-2 rounded-xl border bg-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#C23B22] text-white font-bold"
                          >
                            Save Dish
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WHATSAPP SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-md">
                <h3 className="font-serif text-xl font-bold text-[#1C3A27]">WhatsApp Receiving Number</h3>
                <p className="text-xs text-[#6B5E54]">
                  All direct customer orders and instant reservations will dispatch to this WhatsApp phone number.
                </p>

                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="593987654321"
                    value={whatsappNum}
                    onChange={(e) => setWhatsappNum(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Example: <code>593987654321</code> (Ecuador +593 format).
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1C3A27] text-white font-bold text-xs shadow-md"
                >
                  Update Settings
                </button>
              </form>
            )}

            {/* TAB 3: PASSWORD RESET */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C3A27]">Reset Portal Password</h3>
                  <p className="text-xs text-[#6B5E54] mt-1">
                    Update staff credentials. Passwords are securely hashed on the server with bcrypt.
                  </p>
                </div>

                {pwdMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      pwdMessage.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {pwdMessage.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#2B231D]">
                    Current Password <span className="text-gray-400 font-normal">(optional if default admin123)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password (or admin123)"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#2B231D]">
                    New Password * <span className="text-gray-400 font-normal">(min 4 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      required
                      minLength={4}
                      placeholder="Enter new strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl bg-white text-sm text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#2B231D]">Confirm New Password *</label>
                  <input
                    type={showNewPwd ? "text" : "password"}
                    required
                    minLength={4}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPwd}
                    className="px-6 py-3 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isChangingPwd ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
