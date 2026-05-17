import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAppContext } from '../context/AppProvider';
import { stockService } from '../services/stockService';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Star, StarOff, ArrowLeft, Info, TrendingUp, TrendingDown } from 'lucide-react';

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { portfolio, watchlist, addToWatchlist, removeFromWatchlist, buyStock, sellStock, balance } = useAppContext();
  
  const [quote, setQuote] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [tradeShares, setTradeShares] = useState(1);
  const [tradeType, setTradeType] = useState('buy');

  const isWatched = watchlist.includes(symbol || '');
  const ownedPosition = portfolio.find(p => p.symbol === symbol);

  useEffect(() => {
    if (!symbol) return;
    
    const fetchData = async () => {
      try {
        const q = await stockService.getQuote(symbol);
        setQuote(q);
        setChartData(stockService.getHistoricalData(symbol, q.c, 30));
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading || !quote) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading {symbol} data...</div>;
  }

  const isPositive = quote.d >= 0;
  
  const handleTrade = () => {
    if (!symbol) return;
    if (tradeType === 'buy') {
      buyStock(symbol, tradeShares, quote.c);
    } else {
      if (ownedPosition && ownedPosition.shares >= tradeShares) {
        sellStock(symbol, tradeShares, quote.c);
      }
    }
    setTradeShares(1); // reset
  };

  const tradeCost = tradeShares * quote.c;

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate(-1)} className="mt-1 text-muted-foreground hover:text-foreground">
             <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{symbol}</h1>
            <p className="text-xl text-muted-foreground font-medium uppercase tracking-wider">{symbol} Equity</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold">${quote.c.toFixed(2)}</div>
            <div className={`flex items-center justify-end font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
              {isPositive ? '+' : '-'}${Math.abs(quote.d).toFixed(2)} ({quote.dp.toFixed(2)}%)
            </div>
          </div>
          <button 
            onClick={() => isWatched ? removeFromWatchlist(symbol) : addToWatchlist(symbol)}
            className="p-3 border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            {isWatched ? <Star className="w-6 h-6 text-primary fill-primary" /> : <StarOff className="w-6 h-6 text-muted-foreground" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance (30D)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                      }}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                <div>
                   <div className="text-sm text-muted-foreground mb-1">Previous Close</div>
                   <div className="text-lg font-bold">${quote.pc.toFixed(2)}</div>
                </div>
                <div>
                   <div className="text-sm text-muted-foreground mb-1">Open</div>
                   <div className="text-lg font-bold">${quote.o.toFixed(2)}</div>
                </div>
                <div>
                   <div className="text-sm text-muted-foreground mb-1">Day's Range</div>
                   <div className="text-lg font-bold">${quote.l.toFixed(2)} - ${quote.h.toFixed(2)}</div>
                </div>
                <div>
                   <div className="text-sm text-muted-foreground mb-1">Volume</div>
                   <div className="text-lg font-bold">{(Math.random() * 50 + 10).toFixed(1)}M</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade and Position Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="border-b border-border mb-4">
              <div className="flex gap-4">
                <button 
                  className={`flex-1 pb-2 text-center font-bold text-lg border-b-2 transition-colors ${tradeType === 'buy' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setTradeType('buy')}
                >
                  Buy
                </button>
                <button 
                   className={`flex-1 pb-2 text-center font-bold text-lg border-b-2 transition-colors ${tradeType === 'sell' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                   onClick={() => setTradeType('sell')}
                >
                  Sell
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                 <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Shares</label>
                 <input 
                   type="number" 
                   min="1" 
                   step="1"
                   value={tradeShares}
                   onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 0))}
                   className="w-full text-2xl font-bold bg-secondary border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-right"
                 />
               </div>

               <div className="flex items-center justify-between text-lg">
                 <span className="font-semibold text-muted-foreground">Market Price</span>
                 <span className="font-bold">${quote.c.toFixed(2)}</span>
               </div>
               
               <div className="flex items-center justify-between text-xl border-t border-border pt-4">
                 <span className="font-bold">Estimated Cost</span>
                 <span className="font-bold text-primary">${tradeCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
               </div>

               {tradeType === 'buy' && tradeCost > balance && (
                 <div className="text-destructive text-sm font-semibold text-center bg-destructive/10 p-2 rounded">
                   Insufficient buying power
                 </div>
               )}
               {tradeType === 'sell' && (!ownedPosition || ownedPosition.shares < tradeShares) && (
                 <div className="text-destructive text-sm font-semibold text-center bg-destructive/10 p-2 rounded">
                   Insufficient shares to sell
                 </div>
               )}

               <button 
                 onClick={handleTrade}
                 disabled={(tradeType === 'buy' && tradeCost > balance) || (tradeType === 'sell' && (!ownedPosition || ownedPosition.shares < tradeShares))}
                 className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity uppercase tracking-wider"
               >
                 Confirm {tradeType}
               </button>

               <div className="text-center text-sm font-medium text-muted-foreground">
                 {tradeType === 'buy' ? `$${balance.toLocaleString()} buying power available` : `${ownedPosition?.shares || 0} shares available`}
               </div>
            </CardContent>
          </Card>

          {ownedPosition && (
            <Card>
              <CardHeader>
                <CardTitle>Your Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                 <div>
                   <div className="text-sm text-muted-foreground uppercase font-medium mb-1">Shares Owned</div>
                   <div className="text-3xl font-bold">{ownedPosition.shares}</div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Avg Cost</div>
                      <div className="font-bold">${ownedPosition.averagePrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Market Value</div>
                      <div className="font-bold">${(ownedPosition.shares * quote.c).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                 </div>
                 <div className="border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Return</div>
                    <div className={`text-xl font-bold flex items-center justify-center gap-1 ${((quote.c - ownedPosition.averagePrice) * ownedPosition.shares) >= 0 ? 'text-success' : 'text-destructive'}`}>
                       {((quote.c - ownedPosition.averagePrice) * ownedPosition.shares) >= 0 ? '+' : '-'}$
                       {Math.abs((quote.c - ownedPosition.averagePrice) * ownedPosition.shares).toFixed(2)}
                       <span className="text-sm">
                         ({(((quote.c - ownedPosition.averagePrice) / ownedPosition.averagePrice) * 100).toFixed(2)}%)
                       </span>
                    </div>
                 </div>
              </CardContent>
            </Card>
          )}

           <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" /> About {symbol}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This is a mock description for the {symbol} stock. In a fully-connected application, this would provide the company's profile description fetched via the API.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
