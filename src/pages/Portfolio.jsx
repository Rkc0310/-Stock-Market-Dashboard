import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAppContext } from '../context/AppProvider';
import { stockService } from '../services/stockService';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const { portfolio, balance } = useAppContext();
  const [data, setData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      let value = balance;
      let gain = 0;
      const updatedData = [];
      
      for (const item of portfolio) {
        const quote = await stockService.getQuote(item.symbol);
        const currentValue = quote.c * item.shares;
        const invested = item.averagePrice * item.shares;
        const totalReturn = currentValue - invested;
        const returnPercentage = (totalReturn / invested) * 100;
        
        value += currentValue;
        gain += totalReturn;
        
        updatedData.push({
          symbol: item.symbol,
          shares: item.shares,
          averagePrice: item.averagePrice,
          currentPrice: quote.c,
          currentValue,
          totalReturn,
          returnPercentage
        });
      }
      
      setData(updatedData);
      setTotalValue(value);
      setTotalGain(gain);
    };

    fetchData();
  }, [portfolio, balance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Portfolio</h1>
        <p className="text-muted-foreground font-medium">Manage your assets and track performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-primary/20 bg-card z-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Briefcase className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Est. Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tracking-tighter mb-4">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center text-lg font-medium ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalGain >= 0 ? <ArrowUpRight className="w-5 h-5 mr-1" /> : <ArrowDownRight className="w-5 h-5 mr-1" />}
              ${Math.abs(totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-2 text-sm text-muted-foreground">All time return</span>
            </div>
            <div className="mt-8">
               <div className="text-sm font-medium text-muted-foreground mb-1">Buying Power (Cash)</div>
               <div className="text-xl font-bold">${balance.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Positions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground">
                 <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p className="font-medium text-lg">No open positions.</p>
                 <p className="text-sm">Search for stocks to start investing.</p>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Symbol</th>
                      <th className="pb-3 font-semibold text-right">Shares</th>
                      <th className="pb-3 font-semibold text-right">Avg Cost</th>
                      <th className="pb-3 font-semibold text-right">Current</th>
                      <th className="pb-3 font-semibold text-right">Total Return</th>
                      <th className="pb-3 font-semibold text-right">Total Equity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.map((item) => (
                      <tr key={item.symbol} className="group hover:bg-secondary/50 transition-colors">
                        <td className="py-4">
                          <Link to={`/stock/${item.symbol}`} className="font-bold text-primary hover:underline">
                            {item.symbol}
                          </Link>
                        </td>
                        <td className="py-4 text-right font-medium">{item.shares}</td>
                        <td className="py-4 text-right font-mono text-sm">${item.averagePrice.toFixed(2)}</td>
                        <td className="py-4 text-right font-mono text-sm">${item.currentPrice.toFixed(2)}</td>
                        <td className={`py-4 text-right font-medium ${item.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${item.totalReturn.toFixed(2)} 
                          <span className="text-xs ml-1 block opacity-80">({item.returnPercentage.toFixed(2)}%)</span>
                        </td>
                        <td className="py-4 text-right font-bold">${item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
