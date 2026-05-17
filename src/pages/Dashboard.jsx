import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatWidget } from '../components/ui/StatWidget';
import { stockService } from '../services/stockService';
import { useAppContext } from '../context/AppProvider';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const { balance, portfolio } = useAppContext();
  const [marketIndices, setMarketIndices] = useState({});
  const [chartData, setChartData] = useState([]);

  // Calculate total portfolio value
  // In a real app we would fetch fresh quotes for each portfolio item to get current value
  const totalInvested = portfolio.reduce((acc, item) => acc + (item.shares * item.averagePrice), 0);
  const totalValue = balance + totalInvested; // Simplified: assumes current price = avg price for demo unless we fetch real quotes
  
  // For demo, let's just show an arbitrary performance graph
  useEffect(() => {
    // Generate some stable fake portfolio history chart data
    const generateChartData = () => {
      const data = [];
      const now = new Date();
      let val = totalValue * 0.8;
      for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        val += (Math.random() - 0.45) * 5000;
        if (i === 0) val = totalValue;
        data.push({ name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: val });
      }
      return data;
    };
    setChartData(generateChartData());
  }, [totalValue]);

  useEffect(() => {
    const fetchIndices = async () => {
      const symbols = ['SPY', 'QQQ', 'DIA'];
      const results = {};
      for (const sym of symbols) {
        results[sym] = await stockService.getQuote(sym);
      }
      setMarketIndices(results);
    };
    
    fetchIndices();
    const interval = setInterval(fetchIndices, 10000); // 10s updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground font-medium">Welcome back, here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Total Wealth</div>
            <div className="text-4xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-sm font-medium mt-2 text-primary">Available Cash: ${balance.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        {['SPY', 'QQQ', 'DIA'].map(sym => {
          const q = marketIndices[sym];
          if (!q) return <div key={sym} className="h-32 bg-secondary rounded-xl animate-pulse"></div>;
          return (
            <StatWidget 
              key={sym}
              title={`${sym} Index`}
              value={q.c}
              changeValue={q.d}
              changePercentage={q.dp}
              isPositive={q.d >= 0}
              linkTo={`/stock/${sym}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance (30D)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trending Stocks</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {['NVDA', 'AMD', 'META', 'AMZN', 'GOOGL'].map(sym => (
                <div key={sym} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer" onClick={() => window.location.href = `/stock/${sym}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-background border border-border flex items-center justify-center font-bold text-sm">
                      {sym.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{sym}</div>
                      <div className="text-xs text-muted-foreground uppercase">Tech Sector</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold whitespace-nowrap">{(Math.random() * 500 + 50).toFixed(2)}</div>
                    <div className="text-xs text-success font-medium">+{((Math.random() * 5)).toFixed(2)}%</div>
                  </div>
                </div>
              ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {[
                "Fed Signals Potential Rate Cuts Later This Year as Inflation Cools",
                "Tech Giants Rally Following Strong Q2 Earnings Reports",
                "Oil Prices Stabilize After Week of Volatility in Energy Markets",
                "Retail Sales Show Unexpected Resilience Despite Economic Headwinds"
              ].map((news, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 hover:bg-secondary/50 rounded transition-colors px-2 cursor-pointer">
                  <div className="text-xs text-muted-foreground mb-1 font-mono tracking-wider">{Math.floor(Math.random() * 12) + 1} hours ago • MarketWatch</div>
                  <div className="font-semibold text-lg">{news}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Brief synopsis of the news article detailing the major points and how it might impact the broader market conditions.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
