import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Sparkles,
  X
} from 'lucide-react';
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new dish
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemMeal, setNewItemMeal] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [newItemPrice, setNewItemPrice] = useState(80);
  const [newItemDiet, setNewItemDiet] = useState<'veg' | 'non-veg'>('veg');

  const toggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to remove this dish from the menu?')) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: MenuItem = {
      id: `m_${Date.now()}`,
      name: newItemName.trim(),
      description: newItemDesc.trim() || 'Prepared fresh daily with finest ingredients.',
      mealType: newItemMeal,
      price: Number(newItemPrice),
      dietType: newItemDiet,
      isAvailable: true,
    };

    setMenuItems((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setNewItemName('');
    setNewItemDesc('');
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
      {/* Top Banner and Actions */}
      <div className="menu-header-bar">
        <div>
          <h2 className="page-heading">Daily & Weekly Menu Management</h2>
          <p className="page-subheading">
            Update dishes, mark instant item availability, and set daily specials.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Dish
        </button>
      </div>

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
                  onClick={() => alert(`Edit ${item.name}`)}
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
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Dish
            </button>
          </div>
        )}
      </div>

      {/* Add Dish Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add New Dish to Menu</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDish} className="modal-form">
              <div className="form-group">
                <label className="form-label">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahi Paneer, Veg Biryani"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  placeholder="Ingredients, preparation, side dishes..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Meal Category *</label>
                  <select
                    value={newItemMeal}
                    onChange={(e) => setNewItemMeal(e.target.value as any)}
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
                    value={newItemDiet}
                    onChange={(e) => setNewItemDiet(e.target.value as any)}
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
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="form-input"
                />
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
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
