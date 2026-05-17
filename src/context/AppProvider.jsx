import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN']);
  const [portfolio, setPortfolio] = useState([
    { symbol: 'AAPL', shares: 10, averagePrice: 150 },
    { symbol: 'TSLA', shares: 5, averagePrice: 200 }
  ]);
  const [balance, setBalance] = useState(100000); // initial fake balance

  useEffect(() => {
    // Initial theme setup
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const buyStock = (symbol, shares, price) => {
    const cost = shares * price;
    if (balance >= cost) {
      setBalance(prev => prev - cost);
      setPortfolio(prev => {
        const existing = prev.find(p => p.symbol === symbol);
        if (existing) {
          const totalShares = existing.shares + shares;
          const newAvgPrice = ((existing.shares * existing.averagePrice) + cost) / totalShares;
          return prev.map(p => p.symbol === symbol ? { ...p, shares: totalShares, averagePrice: newAvgPrice } : p);
        }
        return [...prev, { symbol, shares, averagePrice: price }];
      });
    }
  };

  const sellStock = (symbol, shares, price) => {
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === symbol);
      if (existing && existing.shares >= shares) {
        setBalance(b => b + (shares * price));
        if (existing.shares === shares) {
          return prev.filter(p => p.symbol !== symbol); // remove completely if sold all
        }
        return prev.map(p => p.symbol === symbol ? { ...p, shares: p.shares - shares } : p);
      }
      return prev;
    });
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      watchlist, addToWatchlist, removeFromWatchlist,
      portfolio, buyStock, sellStock,
      balance
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
