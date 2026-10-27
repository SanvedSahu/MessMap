import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, useOutletContext } from 'react-router-dom';
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
  Store,
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getOwnerMenuApi,
  createMenuItemApi,
  updateMenuItemApi,
  deleteMenuItemApi,
  updateMessPricingApi,
  getOwnerDailyMenuApi,
  updateDailyMealMenuApi,
  type OwnerMessProfileResponse,
} from '../../../api/ownerApi';
import './MenuPage.css';

interface MenuOutletContextType {
  ownerMess?: OwnerMessProfileResponse | null;
  loadingMess?: boolean;
}

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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletCtx = useOutletContext<MenuOutletContextType | null>();
  const liveMess = outletCtx?.ownerMess;
  const loadingMess = outletCtx?.loadingMess;

  const { user } = useAuth();
  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com' || user.messId === 'MESS-101';
  const storageKey = `messmap_owner_menu_items_${user.id}`;

  const [hasMess, setHasMess] = useState<boolean>(() => !!(liveMess || user.messId || isDemoOwner));
  const activeMessId = liveMess?.id && !String(liveMess.id).startsWith('MESS-') ? Number(liveMess.id) : undefined;

  useEffect(() => {
    if (liveMess || user.messId || isDemoOwner) {
      setHasMess(true);
    }
  }, [liveMess, user.messId, isDemoOwner]);

  const [activeTab, setActiveTab] = useState<'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner'>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return isDemoOwner ? initialMenuItems : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Pricing form states
  const [breakfastPrice, setBreakfastPrice] = useState<number>(40);
  const [lunchPrice, setLunchPrice] = useState<number>(90);
  const [dinnerPrice, setDinnerPrice] = useState<number>(90);
  const [dailyPrice, setDailyPrice] = useState<number>(110);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(3200);
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Daily Meal Menu (Weekly Schedule) state
  const weekDaysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>('Monday');
  const [dailyBreakfast, setDailyBreakfast] = useState<string>('');
  const [initialBreakfast, setInitialBreakfast] = useState<string>('');
  const [dailyLunch, setDailyLunch] = useState<string>('');
  const [initialLunch, setInitialLunch] = useState<string>('');
  const [dailyDinner, setDailyDinner] = useState<string>('');
  const [initialDinner, setInitialDinner] = useState<string>('');
  const [loadingDailyMenu, setLoadingDailyMenu] = useState<boolean>(false);
  const [savingMeal, setSavingMeal] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | null>(null);

  // Form states for Add/Edit Dish
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishMeal, setDishMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [dishPrice, setDishPrice] = useState(80);
  const [dishDiet, setDishDiet] = useState<'veg' | 'non-veg'>('veg');
  const [dishIsSpecial, setDishIsSpecial] = useState(false);
  const [isSavingDish, setIsSavingDish] = useState(false);

  const saveToStorage = (items: MenuItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  // Fetch menu and pricing from backend on mount or when active mess changes
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getOwnerMenuApi(token, activeMessId)
        .then((res) => {
          if (res?.data) {
            setHasMess(true);
            if (res.data.items) {
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
          if (
            err.message &&
            (err.message.includes('not found') || err.message.includes('No mess'))
          ) {
            if (!isDemoOwner && !liveMess) {
              setHasMess(false);
            }
          } else {
            console.warn('Backend menu catalog fetch note:', err.message);
          }
        });
    }
  }, [user.id, isDemoOwner, activeMessId, liveMess]);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      try {
        await updateMessPricingApi(token, {
          messId: activeMessId,
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

  // Fetch daily menu for selected day from backend
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (!token) return;

    let isCurrent = true;
    setLoadingDailyMenu(true);

    getOwnerDailyMenuApi(token, activeMessId, selectedScheduleDay)
      .then((res) => {
        if (!isCurrent) return;
        if (res?.data) {
          const b = res.data.breakfast || '';
          const l = res.data.lunch || '';
          const d = res.data.dinner || '';
          setDailyBreakfast(b);
          setInitialBreakfast(b);
          setDailyLunch(l);
          setInitialLunch(l);
          setDailyDinner(d);
          setInitialDinner(d);
        } else {
          setDailyBreakfast('');
          setInitialBreakfast('');
          setDailyLunch('');
          setInitialLunch('');
          setDailyDinner('');
          setInitialDinner('');
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.warn('Backend daily menu fetch note:', err.message);
      })
      .finally(() => {
        if (isCurrent) setLoadingDailyMenu(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [activeMessId, selectedScheduleDay]);

  const handleSaveDailyMeal = async (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER') => {
    const dishes =
      mealType === 'BREAKFAST'
        ? dailyBreakfast
        : mealType === 'LUNCH'
        ? dailyLunch
        : dailyDinner;

    if (!dishes.trim()) {
      showErrorToast(`Please enter at least one dish for ${mealType.toLowerCase()}.`);
      return;
    }

    const token = localStorage.getItem('messmap_auth_token');
    if (!token) {
      showErrorToast('You must be signed in to save daily meal menus.');
      return;
    }

    setSavingMeal(mealType);
    try {
      await updateDailyMealMenuApi(token, {
        messId: activeMessId,
        dayOfWeek: selectedScheduleDay,
        mealType,
        dishes: dishes.trim(),
      });

      if (mealType === 'BREAKFAST') setInitialBreakfast(dishes.trim());
      if (mealType === 'LUNCH') setInitialLunch(dishes.trim());
      if (mealType === 'DINNER') setInitialDinner(dishes.trim());

      showToast(`Saved ${selectedScheduleDay} ${mealType.toLowerCase()} menu to database! 🍛`);
    } catch (err: any) {
      console.error(`Failed to save ${mealType} menu:`, err);
      showErrorToast(err?.message || `Failed to save ${mealType.toLowerCase()} menu.`);
    } finally {
      setSavingMeal(null);
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
      const token = localStorage.getItem('messmap_auth_token');
      if (token && !id.startsWith('m_') && !isNaN(Number(id))) {
        try {
          await deleteMenuItemApi(token, Number(id));
          setMenuItems((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            saveToStorage(updated);
            return updated;
          });
          showToast('Dish removed from menu.');
        } catch (err: any) {
          console.error('Backend menu delete error:', err);
          showErrorToast(err?.message || 'Failed to delete dish from database.');
        }
      } else {
        setMenuItems((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          saveToStorage(updated);
          return updated;
        });
        showToast('Dish removed from menu.');
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
    setModalError(null);
    setIsModalOpen(true);
  };

  // Automatically open the Add New Dish modal if navigated with openAddModal state or ?action=add / ?action=add-item
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    const stateObj = location.state as { openAddModal?: boolean } | null;
    const actionParam = searchParams.get('action');
    const hasAddActionParam = actionParam === 'add' || actionParam === 'add-item';
    const shouldOpenAdd = Boolean(stateObj?.openAddModal || hasAddActionParam);
    const messAvailable = hasMess || !!liveMess || !!user.messId || isDemoOwner;

    if (shouldOpenAdd && !hasAutoOpenedRef.current && (!loadingMess || messAvailable)) {
      hasAutoOpenedRef.current = true;
      handleOpenAdd();

      // Clear the trigger from location state / searchParams using replace: true
      // This ensures browser back button and page refresh (F5) work cleanly without re-triggering
      if (stateObj?.openAddModal) {
        navigate(location.pathname, { replace: true, state: {} });
      }
      if (hasAddActionParam) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('action');
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [location.state, searchParams, navigate, setSearchParams, loadingMess, hasMess, liveMess, user.messId, isDemoOwner]);

  const handleOpenEdit = (item: MenuItem) => {
    setEditingDish(item);
    setDishName(item.name);
    setDishDesc(item.description);
    setDishMeal(item.mealType);
    setDishPrice(item.price);
    setDishDiet(item.dietType);
    setDishIsSpecial(!!item.isSpecial);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const token = localStorage.getItem('messmap_auth_token');
    const backendMealType = dishMeal.toUpperCase() as any;

    setIsSavingDish(true);
    setModalError(null);

    try {
      if (editingDish) {
        // Update existing
        if (token && !editingDish.id.startsWith('m_') && !isNaN(Number(editingDish.id))) {
          const res = await updateMenuItemApi(token, Number(editingDish.id), {
            dishName: dishName.trim(),
            name: dishName.trim(),
            description: dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
            mealType: backendMealType,
            price: Number(dishPrice),
            isSpecial: dishIsSpecial,
          });

          const updatedServerItem = res?.data;
          setMenuItems((prev) => {
            const updated = prev.map((item) =>
              item.id === editingDish.id
                ? {
                    ...item,
                    name: updatedServerItem?.name || updatedServerItem?.dishName || dishName.trim(),
                    description: updatedServerItem?.description || dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
                    mealType: (updatedServerItem?.mealType ? updatedServerItem.mealType.toLowerCase() : dishMeal) as any,
                    price: updatedServerItem?.price != null ? Number(updatedServerItem.price) : Number(dishPrice),
                    dietType: dishDiet,
                    isSpecial: updatedServerItem?.isSpecial != null ? !!updatedServerItem.isSpecial : dishIsSpecial,
                  }
                : item
            );
            saveToStorage(updated);
            return updated;
          });
        } else {
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
        }
        showToast(`Updated "${dishName.trim()}" successfully! 🍲`);
        setIsModalOpen(false);
      } else {
        // Add new item
        if (token) {
          const res = await createMenuItemApi(token, {
            messId: activeMessId,
            dishName: dishName.trim(),
            name: dishName.trim(),
            description: dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
            mealType: backendMealType,
            price: Number(dishPrice),
            isAvailable: true,
            isSpecial: dishIsSpecial,
            dayOfWeek: 'MONDAY',
          });

          if (!res?.data?.id) {
            throw new Error(res?.message || 'Failed to save menu item to database.');
          }

          const savedItem: MenuItem = {
            id: String(res.data.id),
            name: res.data.name || res.data.dishName || dishName.trim(),
            description: res.data.description || dishDesc.trim() || 'Prepared fresh daily with finest ingredients.',
            mealType: (res.data.mealType ? res.data.mealType.toLowerCase() : dishMeal) as any,
            price: Number(res.data.price) || Number(dishPrice),
            dietType: dishDiet,
            isAvailable: res.data.isAvailable !== false,
            isSpecial: !!res.data.isSpecial,
          };

          setMenuItems((prev) => {
            const updated = [savedItem, ...prev];
            saveToStorage(updated);
            return updated;
          });

          if (activeTab !== 'all' && activeTab !== dishMeal) {
            setActiveTab(dishMeal);
          }

          showToast(`Added "${savedItem.name}" to the menu! ✨`);
          setIsModalOpen(false);
        } else if (isDemoOwner) {
          const newItem: MenuItem = {
            id: `m_${Date.now()}`,
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
          if (activeTab !== 'all' && activeTab !== dishMeal) {
            setActiveTab(dishMeal);
          }
          showToast(`Added "${newItem.name}" to demo menu! ✨`);
          setIsModalOpen(false);
        } else {
          throw new Error('You must be logged in to save menu items.');
        }
      }
    } catch (err: any) {
      console.error('Failed to save menu item:', err);
      const errorMsg = err?.message || 'Failed to save menu item. Please try again.';
      setModalError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setIsSavingDish(false);
    }
  };

  if (loadingMess && !hasMess && !liveMess && !user.messId && !isDemoOwner) {
    return (
      <div className="menu-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading menu and mess profile...</p>
      </div>
    );
  }

  if (!hasMess && !loadingMess && !liveMess && !user.messId && !isDemoOwner) {
    return (
      <div className="menu-page-container">
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '2rem auto',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Store size={36} color="#10b981" />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '0.6rem',
              color: 'var(--text-primary)',
            }}
          >
            You haven't created your mess profile yet.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            Please create your mess business profile first before adding dishes and configuring
            subscription pricing.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/owner/profile')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.8rem 1.8rem',
              fontWeight: 700,
            }}
          >
            <Plus size={18} /> Create Mess Profile
          </button>
        </div>
      </div>
    );
  }

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

      {errorToast && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{errorToast}</span>
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

      {/* SECTION: MANAGE DAILY MENUS (WEEKLY SCHEDULE) */}
      <section className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Manage Daily Meal Menus
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Enter and update dishes for Monday through Sunday. These dishes persist in the database and display dynamically to students.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loadingDailyMenu && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={14} className="animate-spin" /> Loading schedule...
              </span>
            )}
          </div>
        </div>

        {/* Day Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1.5rem' }}>
          {weekDaysList.map((day) => {
            const active = selectedScheduleDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedScheduleDay(day)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: active ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  background: active ? 'var(--primary-light)' : '#ffffff',
                  color: active ? 'var(--primary-dark)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 3 Meal Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Breakfast Card */}
          <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--warning-dark)' }}>
                <Coffee size={18} />
                <span>Breakfast (07:30 – 10:00 AM)</span>
              </div>
              {dailyBreakfast !== initialBreakfast ? (
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Unsaved Changes</span>
              ) : !dailyBreakfast.trim() ? (
                <span className="badge" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b' }}>Not Set</span>
              ) : (
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={11} /> Saved
                </span>
              )}
            </div>

            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Dishes served on {selectedScheduleDay}:
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Kanda Poha, Boiled Eggs, Sprouts, Masala Chai"
              value={dailyBreakfast}
              onChange={(e) => setDailyBreakfast(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                resize: 'vertical',
                marginBottom: '1rem',
              }}
            />

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSaveDailyMeal('BREAKFAST')}
              disabled={savingMeal === 'BREAKFAST' || dailyBreakfast === initialBreakfast || !dailyBreakfast.trim()}
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={14} />
              {savingMeal === 'BREAKFAST' ? 'Saving...' : 'Save Breakfast'}
            </button>
          </div>

          {/* Lunch Card */}
          <div style={{ background: 'var(--primary-light)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                <Sun size={18} />
                <span>Lunch Thali (12:15 – 03:00 PM)</span>
              </div>
              {dailyLunch !== initialLunch ? (
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Unsaved Changes</span>
              ) : !dailyLunch.trim() ? (
                <span className="badge" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b' }}>Not Set</span>
              ) : (
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={11} /> Saved
                </span>
              )}
            </div>

            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Dishes served on {selectedScheduleDay}:
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Dal Makhani, Shahi Paneer, Jeera Rice, Hot Phulkas, Kheer"
              value={dailyLunch}
              onChange={(e) => setDailyLunch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                resize: 'vertical',
                marginBottom: '1rem',
              }}
            />

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSaveDailyMeal('LUNCH')}
              disabled={savingMeal === 'LUNCH' || dailyLunch === initialLunch || !dailyLunch.trim()}
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={14} />
              {savingMeal === 'LUNCH' ? 'Saving...' : 'Save Lunch'}
            </button>
          </div>

          {/* Dinner Card */}
          <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#4338ca' }}>
                <Moon size={18} />
                <span>Dinner Thali (07:30 – 10:15 PM)</span>
              </div>
              {dailyDinner !== initialDinner ? (
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Unsaved Changes</span>
              ) : !dailyDinner.trim() ? (
                <span className="badge" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b' }}>Not Set</span>
              ) : (
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={11} /> Saved
                </span>
              )}
            </div>

            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Dishes served on {selectedScheduleDay}:
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Egg Curry, Shev Bhaji, Dal Tadka, Rice, Chapati"
              value={dailyDinner}
              onChange={(e) => setDailyDinner(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                resize: 'vertical',
                marginBottom: '1rem',
              }}
            />

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSaveDailyMeal('DINNER')}
              disabled={savingMeal === 'DINNER' || dailyDinner === initialDinner || !dailyDinner.trim()}
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={14} />
              {savingMeal === 'DINNER' ? 'Saving...' : 'Save Dinner'}
            </button>
          </div>
        </div>
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
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} id="modal-add-dish">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingDish ? `Edit "${editingDish.name}"` : 'Add New Dish to Menu'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="modal-form">
              {modalError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} color="#dc2626" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahi Paneer, Veg Biryani"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="form-input"
                  id="input-dish-name"
                  autoFocus
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="btn-save-dish"
                  disabled={isSavingDish}
                >
                  {isSavingDish ? 'Saving...' : (editingDish ? 'Update Dish' : 'Save Dish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
