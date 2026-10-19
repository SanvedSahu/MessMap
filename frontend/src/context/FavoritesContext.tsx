import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStudentFavoritesApi,
  addFavoriteApi,
  removeFavoriteApi,
  FavoriteApiResponse,
  adaptFavoriteToMessItem,
} from '../api/studentApi';
import { useAuth } from './AuthContext';
import { MessItem } from '../types/student.types';

export interface FavoritesContextType {
  favorites: string[];
  favoriteItems: MessItem[];
  isLoading: boolean;
  isFavorite: (messId: string | number) => boolean;
  toggleFavorite: (messId: string | number) => Promise<void>;
  removeFavorite: (messId: string | number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem('messmap_auth_token') || '';

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('messmap_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteItems, setFavoriteItems] = useState<MessItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync favorites with backend when student is authenticated
  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await getStudentFavoritesApi(token);
      if (res && Array.isArray(res.data)) {
        const ids = res.data.map((f: FavoriteApiResponse) => String(f.messId || f.id));
        setFavorites(ids);
        const adaptedItems = res.data.map(adaptFavoriteToMessItem);
        setFavoriteItems(adaptedItems);
        localStorage.setItem('messmap_favorites', JSON.stringify(ids));
      }
    } catch (err: any) {
      console.warn('Backend favorites load notice:', err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token, fetchFavorites]);

  const isFavorite = (messId: string | number) => {
    const sId = String(messId);
    return favorites.includes(sId);
  };

  const toggleFavorite = async (messId: string | number) => {
    const sId = String(messId);
    const currentlyFavorited = favorites.includes(sId);

    // Optimistic local update
    const nextFavorites = currentlyFavorited
      ? favorites.filter((id) => id !== sId)
      : [...favorites, sId];
    setFavorites(nextFavorites);
    try {
      localStorage.setItem('messmap_favorites', JSON.stringify(nextFavorites));
    } catch {
      // ignore
    }

    if (token) {
      try {
        if (currentlyFavorited) {
          await removeFavoriteApi(token, messId);
        } else {
          await addFavoriteApi(token, messId);
        }
        await fetchFavorites();
      } catch (err: any) {
        console.error('Failed to sync favorite with backend:', err);
        // Rollback on failure
        setFavorites(favorites);
      }
    }
  };

  const removeFavorite = async (messId: string | number) => {
    const sId = String(messId);
    const nextFavorites = favorites.filter((id) => id !== sId);
    setFavorites(nextFavorites);
    setFavoriteItems((prev) => prev.filter((item) => item.id !== sId));
    try {
      localStorage.setItem('messmap_favorites', JSON.stringify(nextFavorites));
    } catch {
      // ignore
    }

    if (token) {
      try {
        await removeFavoriteApi(token, messId);
        await fetchFavorites();
      } catch (err: any) {
        console.error('Failed to remove favorite on backend:', err);
      }
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteItems,
        isLoading,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
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

