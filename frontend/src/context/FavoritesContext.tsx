import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FavoritesContextType {
  favorites: string[];
  isFavorite: (messId: string) => boolean;
  toggleFavorite: (messId: string) => void;
  removeFavorite: (messId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('messmap_favorites');
    return saved ? JSON.parse(saved) : ['mess-1', 'mess-3'];
  });

  useEffect(() => {
    localStorage.setItem('messmap_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (messId: string) => favorites.includes(messId);

  const toggleFavorite = (messId: string) => {
    setFavorites((prev) => {
      if (prev.includes(messId)) {
        return prev.filter((id) => id !== messId);
      } else {
        return [...prev, messId];
      }
    });
  };

  const removeFavorite = (messId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== messId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
