import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Star, Settings, Moon, Sun, Search, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useDebounce } from '../hooks/useDebounce';
import { stockService } from '../services/stockService';

export default function Layout({ children }) {
  const { theme, toggleTheme } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length > 1) {
        setIsSearching(true);
        const results = await stockService.searchStocks(debouncedQuery);
        setSearchResults(results.slice(0, 6)); // limit to 6 results
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/stock/${symbol}`);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', href: '/watchlist', icon: Star },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Modern clean sidebar like trading platforms */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">X</span>
            </div>
            XChange
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                JD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">Pro Trader</span>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-2 md:hidden mr-4">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">X</span>
            </div>
          </div>
          <div className="flex-1 max-w-xl flex items-center" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if(searchResults.length > 0) setShowDropdown(true); }}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              />
              {/* Search Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <ul className="max-h-80 overflow-y-auto">
                      {searchResults.map(res => (
                        <li key={res.symbol}>
                          <button 
                            className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-0 flex items-center justify-between"
                            onClick={() => handleSelect(res.symbol)}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm tracking-wide">{res.displaySymbol}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{res.description}</span>
                            </div>
                            <span className="text-xs font-semibold bg-secondary/50 px-2 py-1 rounded text-muted-foreground">{res.type}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.length > 1 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors p-2 md:p-0">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-background relative z-0 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50 px-6 py-3 flex justify-between">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
