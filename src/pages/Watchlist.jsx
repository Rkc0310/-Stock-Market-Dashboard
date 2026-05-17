import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAppContext } from '../context/AppProvider';
import { stockService } from '../services/stockService';
import { StatWidget } from '../components/ui/StatWidget';
import { StarOff } from 'lucide-react';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useAppContext();
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchWatchlist = async () => {
      const results = {};
      for (const sym of watchlist) {
        results[sym] = await stockService.getQuote(sym);
      }
      setData(results);
    };
    
    if (watchlist.length > 0) {
      fetchWatchlist();
      const interval = setInterval(fetchWatchlist, 10000);
      return () => clearInterval(interval);
    }
  }, [watchlist]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
        <p className="text-muted-foreground font-medium">Keep an eye on potential investments.</p>
      </div>

      {watchlist.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent className="flex flex-col items-center justify-center">
             <StarOff className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
             <h3 className="text-xl font-semibold mb-2">Watchlist is empty</h3>
             <p className="text-muted-foreground">Search for stocks and add them to your watchlist to monitor their performance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {watchlist.map(sym => {
            const q = data[sym];
            if (!q) return <div key={sym} className="h-32 bg-secondary rounded-xl animate-pulse text-center pt-10 font-bold">Loading...</div>;
            return (
              <div key={sym} className="relative group">
                <StatWidget 
                  title={sym}
                  value={q.c}
                  changeValue={q.d}
                  changePercentage={q.dp}
                  isPositive={q.d >= 0}
                  linkTo={`/stock/${sym}`}
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWatchlist(sym);
                  }}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1"
                  title="Remove from Watchlist"
                >
                  <StarOff className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
