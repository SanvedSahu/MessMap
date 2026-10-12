import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('messmap_favorites');
    return saved ? JSON.parse(saved) : ['mess-1', 'mess-3'];
  });

  useEffect(() => {
    localStorage.setItem('messmap_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (messId) => favorites.includes(messId);

  const toggleFavorite = (messId) => {
    setFavorites((prev) => {
      if (prev.includes(messId)) {
        return prev.filter((id) => id !== messId);
      } else {
        return [...prev, messId];
      }
    });
  };

  const removeFavorite = (messId) => {
    setFavorites((prev) => prev.filter((id) => id !== messId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
