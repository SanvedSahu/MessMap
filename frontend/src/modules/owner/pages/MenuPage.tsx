import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Sparkles,
  X,
  CreditCard,
  Save,
} from 'lucide-react';
import {
  getOwnerMenuApi,
  createMenuItemApi,
  updateMenuItemApi,
  deleteMenuItemApi,
  updateMessPricingApi,
} from '../../../api/ownerApi';
import './MenuPage.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  price: number;
  dietType: 'veg' | 'non-veg';
  isAvailable: boolean;
  isSpecial?: boolean;
}

const initialMenuItems: MenuItem[] = [
  // Breakfast
  {
    id: 'm1',
    name: 'Pohe with Sev & Lemon',
    description: 'Fresh flattened rice cooked with mustard seeds, curry leaves, peanuts and fresh coriander.',
    mealType: 'breakfast',
    price: 40,
    dietType: 'veg',
    isAvailable: true,
  },
  {
    id: 'm2',
    name: 'Upma with Coconut Chutney',
    description: 'Roasted semolina dish with ginger, roasted cashews, and mild spices.',
    mealType: 'breakfast',
    price: 45,
    dietType: 'veg',
    isAvailable: true,
  },
  {
    id: 'm3',
    name: 'Masala Chai & Bun Maska',
    description: 'Freshly brewed ginger-cardamom tea with toasted butter bun.',
    mealType: 'breakfast',
    price: 30,
    dietType: 'veg',
    isAvailable: true,
  },

  // Lunch
  {
    id: 'm4',
    name: 'Paneer Butter Masala',
    description: 'Fresh cottage cheese cubes in rich tomato-cashew gravy with aromatic herbs.',
    mealType: 'lunch',
    price: 110,
    dietType: 'veg',
    isAvailable: true,
    isSpecial: true,
  },
  {
    id: 'm5',
    name: 'Yellow Dal Tadka',
    description: 'Arhar dal tempered with cumin, garlic, and dry red chillies in pure ghee.',
    mealType: 'lunch',
    price: 70,
    dietType: 'veg',
    isAvailable: true,
  },
  {
    id: 'm6',
    name: 'Jeera Rice & 4 Butter Chapatis',
    description: 'Long-grain basmati jeera rice with whole wheat hot rotis.',
    mealType: 'lunch',
    price: 60,
    dietType: 'veg',
    isAvailable: true,
  },
  {
    id: 'm7',
    name: 'Gulab Jamun (2 Pcs)',
    description: 'Soft melt-in-mouth milk dumplings soaked in rose cardamom sugar syrup.',
    mealType: 'lunch',
    price: 40,
    dietType: 'veg',
    isAvailable: true,
  },

  // Dinner
  {
    id: 'm8',
    name: 'Mix Vegetable Kolhapuri',
    description: 'Seasonal vegetables cooked in spicy Kolhapuri masala and roasted coconut paste.',
    mealType: 'dinner',
    price: 90,
    dietType: 'veg',
    isAvailable: true,
  },
  {
    id: 'm9',
    name: 'Moong Dal Khichdi with Kadhi',
    description: 'Comforting yellow dal and rice slow cooked and paired with Gujarati-style sweet-sour kadhi.',
    mealType: 'dinner',
    price: 80,
    dietType: 'veg',
    isAvailable: true,
  },
];

export const MenuPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('messmap_owner_menu_items');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialMenuItems;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Pricing form states
  const [breakfastPrice, setBreakfastPrice] = useState<number>(40);
  const [lunchPrice, setLunchPrice] = useState<number>(90);
  const [dinnerPrice, setDinnerPrice] = useState<number>(90);
  const [dailyPrice, setDailyPrice] = useState<number>(110);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(3200);
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Form states for Add/Edit Dish
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishMeal, setDishMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [dishPrice, setDishPrice] = useState(80);
  const [dishDiet, setDishDiet] = useState<'veg' | 'non-veg'>('veg');
  const [dishIsSpecial, setDishIsSpecial] = useState(false);

  const saveToStorage = (items: MenuItem[]) => {
    try {
      localStorage.setItem('messmap_owner_menu_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Fetch menu and pricing from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getOwnerMenuApi(token)
        .then((res) => {
          if (res?.data) {
            if (res.data.items && res.data.items.length > 0) {
              const loaded: MenuItem[] = res.data.items.map((it: any) => ({
                id: String(it.id),
                name: it.dishName || it.name,
                description: it.description || 'Prepared fresh daily with finest ingredients.',
                mealType: (it.mealType ? it.mealType.toLowerCase() : 'lunch') as any,
                price: Number(it.price) || 0,
                dietType: 'veg',
                isAvailable: it.isAvailable !== false,
                isSpecial: !!it.isSpecial,
              }));
              setMenuItems(loaded);
              saveToStorage(loaded);
            }
            if (res.data.pricing) {
              const p = res.data.pricing;
              if (p.breakfastPrice != null) setBreakfastPrice(Number(p.breakfastPrice));
              if (p.lunchPrice != null) setLunchPrice(Number(p.lunchPrice));
              if (p.dinnerPrice != null) setDinnerPrice(Number(p.dinnerPrice));
              if (p.dailyPrice != null) setDailyPrice(Number(p.dailyPrice));
              if (p.monthlyPrice != null) setMonthlyPrice(Number(p.monthlyPrice));
            }
          }
        })
        .catch((err) => {
          console.warn('Backend menu catalog fetch note:', err.message);
        });
    }
  }, []);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      try {
        await updateMessPricingApi(token, {
          breakfastPrice: Number(breakfastPrice),
          lunchPrice: Number(lunchPrice),
          dinnerPrice: Number(dinnerPrice),
          dailyPrice: Number(dailyPrice),
          monthlyPrice: Number(monthlyPrice),
        });
        showToast('Meal & subscription pricing saved to backend! 💳');
      } catch (err: any) {
        console.warn('Backend pricing update error:', err);
        showToast(err.message || 'Pricing update failed.');
      } finally {
        setIsSavingPricing(false);
      }
    } else {
      showToast('Pricing saved locally (offline mode).');
      setIsSavingPricing(false);
    }
  };

  const toggleAvailability = async (id: string) => {
    const target = menuItems.find((i) => i.id === id);
    const nextAvailability = target ? !target.isAvailable : true;
    setMenuItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isAvailable: nextAvailability } : item
      );
      saveToStorage(updated);
      return updated;
    });

    const token = localStorage.getItem('messmap_auth_token');
    if (token && !id.startsWith('m_') && !isNaN(Number(id))) {
      try {
        await updateMenuItemApi(token, Number(id), {
          isAvailable: nextAvailability,
        });
      } catch (err) {
        console.warn('Backend availability toggle warning:', err);
      }
    }
  };

  const deleteItem = async (id: string) => {
    const target = menuItems.find((i) => i.id === id);
    if (window.confirm(`Are you sure you want to remove "${target?.name || 'this dish'}" from the menu?`)) {
      setMenuItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveToStorage(updated);
        return updated;
      });
      showToast('Dish removed from menu.');

      const token = localStorage.getItem('messmap_auth_token');
      if (token && !id.startsWith('m_') && !isNaN(Number(id))) {
        try {
          await deleteMenuItemApi(token, Number(id));
        } catch (err) {
          console.warn('Backend menu delete warning:', err);
        }
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingDish(null);
    setDishName('');
    setDishDesc('');
    setDishMeal(activeTab === 'all' ? 'lunch' : activeTab);
    setDishPrice(80);
    setDishDiet('veg');
    setDishIsSpecial(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingDish(item);
    setDishName(item.name);
    setDishDesc(item.description);
    setDishMeal(item.mealType);
    setDishPrice(item.price);
    setDishDiet(item.dietType);
    setDishIsSpecial(!!item.isSpecial);
    setIsModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const token = localStorage.getItem('messmap_auth_token');
    const backendMealType = dishMeal === 'snacks' ? 'SPECIAL' : (dishMeal.toUpperCase() as any);

    if (editingDish) {
      // Update existing
      setMenuItems((prev) => {
        const updated = prev.map((item) =>
          item.id === editingDish.id
            ? {
                ...item,
                name: dishName.trim(),
                description: dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
                mealType: dishMeal,
                price: Number(dishPrice),
                dietType: dishDiet,
                isSpecial: dishIsSpecial,
              }
            : item
        );
        saveToStorage(updated);
        return updated;
      });

      if (token && !editingDish.id.startsWith('m_') && !isNaN(Number(editingDish.id))) {
        try {
          await updateMenuItemApi(token, Number(editingDish.id), {
            dishName: dishName.trim(),
            name: dishName.trim(),
            description: dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
            mealType: backendMealType,
            price: Number(dishPrice),
            isSpecial: dishIsSpecial,
          });
        } catch (err) {
          console.warn('Backend update dish warning:', err);
        }
      }
      showToast(`Updated "${dishName.trim()}" successfully! 🍲`);
    } else {
      // Add new
      let newId = `m_${Date.now()}`;
      if (token) {
        try {
          const res = await createMenuItemApi(token, {
            dishName: dishName.trim(),
            name: dishName.trim(),
            description: dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
            mealType: backendMealType,
            price: Number(dishPrice),
            isAvailable: true,
            isSpecial: dishIsSpecial,
            dayOfWeek: 'MONDAY',
          });
          if (res?.data?.id) {
            newId = String(res.data.id);
          }
        } catch (err) {
          console.warn('Backend create dish warning, using local id:', err);
        }
      }

      const newItem: MenuItem = {
        id: newId,
        name: dishName.trim(),
        description: dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
        mealType: dishMeal,
        price: Number(dishPrice),
        dietType: dishDiet,
        isAvailable: true,
        isSpecial: dishIsSpecial,
      };
      setMenuItems((prev) => {
        const updated = [newItem, ...prev];
        saveToStorage(updated);
        return updated;
      });
      showToast(`Added "${newItem.name}" to the menu! ✨`);
    }

    setIsModalOpen(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.mealType === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="menu-page-container">
      {/* Toast Alert */}
      {successToast && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner and Actions */}
      <div className="menu-header-bar">
        <div>
          <h2 className="page-heading">Daily & Weekly Menu Management</h2>
          <p className="page-subheading">
            Update dishes, mark instant item availability, set daily specials, and manage meal pricing.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Dish
        </button>
      </div>

      {/* Meal & Subscription Pricing Card */}
      <section className="menu-pricing-card">
        <div className="pricing-card-header">
          <div className="pricing-header-left">
            <CreditCard size={20} className="pricing-icon" />
            <div>
              <h3 className="pricing-title">Meal & Subscription Pricing</h3>
              <p className="pricing-subtitle">
                Configure individual meal rates, daily pass prices, and monthly dining passes.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSavePricing}
            disabled={isSavingPricing}
            id="btn-save-pricing"
          >
            <Save size={16} /> {isSavingPricing ? 'Saving...' : 'Save Pricing'}
          </button>
        </div>

        <form onSubmit={handleSavePricing} className="pricing-grid">
          <div className="pricing-field">
            <label className="pricing-label">Breakfast (₹)</label>
            <input
              type="number"
              min={0}
              value={breakfastPrice}
              onChange={(e) => setBreakfastPrice(Number(e.target.value))}
              className="pricing-input"
            />
          </div>
          <div className="pricing-field">
            <label className="pricing-label">Lunch Thali (₹)</label>
            <input
              type="number"
              min={0}
              value={lunchPrice}
              onChange={(e) => setLunchPrice(Number(e.target.value))}
              className="pricing-input"
            />
          </div>
          <div className="pricing-field">
            <label className="pricing-label">Dinner Thali (₹)</label>
            <input
              type="number"
              min={0}
              value={dinnerPrice}
              onChange={(e) => setDinnerPrice(Number(e.target.value))}
              className="pricing-input"
            />
          </div>
          <div className="pricing-field">
            <label className="pricing-label">Daily Pass (₹)</label>
            <input
              type="number"
              min={0}
              value={dailyPrice}
              onChange={(e) => setDailyPrice(Number(e.target.value))}
              className="pricing-input"
            />
          </div>
          <div className="pricing-field">
            <label className="pricing-label">Monthly Pass (₹)</label>
            <input
              type="number"
              min={0}
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(Number(e.target.value))}
              className="pricing-input"
            />
          </div>
        </form>
      </section>

      {/* Control bar: Tabs & Search */}
      <div className="menu-controls-card">
        {/* Meal Type Tabs */}
        <div className="meal-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Items ({menuItems.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'breakfast' ? 'active' : ''}`}
            onClick={() => setActiveTab('breakfast')}
          >
            Breakfast ({menuItems.filter((i) => i.mealType === 'breakfast').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'lunch' ? 'active' : ''}`}
            onClick={() => setActiveTab('lunch')}
          >
            Lunch ({menuItems.filter((i) => i.mealType === 'lunch').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'snacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('snacks')}
          >
            Snacks ({menuItems.filter((i) => i.mealType === 'snacks').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'dinner' ? 'active' : ''}`}
            onClick={() => setActiveTab('dinner')}
          >
            Dinner ({menuItems.filter((i) => i.mealType === 'dinner').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="menu-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`menu-card ${!item.isAvailable ? 'out-of-stock' : ''}`}
          >
            <div className="menu-card-top">
              <div className="dish-meta">
                <span className={`diet-indicator ${item.dietType}`}>
                  <span className="dot" />
                </span>
                <span className="meal-type-badge">{item.mealType.toUpperCase()}</span>
                {item.isSpecial && (
                  <span className="badge badge-warning">
                    <Sparkles size={11} /> Today's Special
                  </span>
                )}
              </div>

              <div className="availability-toggle">
                <button
                  className={`toggle-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
                  onClick={() => toggleAvailability(item.id)}
                  title={item.isAvailable ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle2 size={13} /> In Stock
                    </>
                  ) : (
                    <>
                      <XCircle size={13} /> Out of Stock
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="menu-card-body">
              <h3 className="dish-name">{item.name}</h3>
              <p className="dish-description">{item.description}</p>
            </div>

            <div className="menu-card-footer">
              <div className="dish-price">
                <span className="currency">₹</span>
                <span className="amount">{item.price}</span>
              </div>

              <div className="dish-actions">
                <button
                  className="icon-action"
                  title="Edit Dish"
                  onClick={() => handleOpenEdit(item)}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  className="icon-action danger"
                  title="Remove Dish"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="empty-menu-state">
            <UtensilsCrossed size={48} className="empty-icon" />
            <h3>No menu items found</h3>
            <p>Try searching with another keyword or click below to add a new dish.</p>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={16} /> Add Dish
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingDish ? `Edit "${editingDish.name}"` : 'Add New Dish to Menu'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="modal-form">
              <div className="form-group">
                <label className="form-label">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahi Paneer, Veg Biryani"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  placeholder="Ingredients, preparation, side dishes..."
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Meal Category *</label>
                  <select
                    value={dishMeal}
                    onChange={(e) => setDishMeal(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Type *</label>
                  <select
                    value={dishDiet}
                    onChange={(e) => setDishDiet(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={dishPrice}
                  onChange={(e) => setDishPrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={dishIsSpecial}
                    onChange={(e) => setDishIsSpecial(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>🌟 Highlight as Today's Special Dish</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDish ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
