const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

// Simple pseudo-random generator to create stable 'live' mock data
const generateMockQuote = (symbol) => {
  let basePrice = 0;
  for (let i = 0; i < symbol.length; i++) {
    basePrice += symbol.charCodeAt(i);
  }
  const volatility = (basePrice % 10) / 100 + 0.01;
  const timeOffset = Date.now() / 10000;
  const currentPrice = basePrice + Math.sin(timeOffset) * basePrice * volatility;
  
  const openPrice = basePrice - (basePrice * volatility * 0.5);
  const change = currentPrice - openPrice;
  
  return {
    c: currentPrice,
    d: change,
    dp: (change / openPrice) * 100,
    h: currentPrice + (basePrice * volatility * 0.1),
    l: currentPrice - (basePrice * volatility * 0.1),
    o: openPrice,
    pc: openPrice - (change * 0.1)
  };
};

export const stockService = {
  async getQuote(symbol) {
    if (!FINNHUB_API_KEY) {
      return Promise.resolve(generateMockQuote(symbol));
    }
    
    try {
      const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      if (!res.ok) throw new Error('Failed to fetch quote');
      return await res.json();
    } catch (error) {
      console.warn(`Failed to fetch real data for ${symbol}, falling back to mock.`);
      return generateMockQuote(symbol);
    }
  },

  async searchStocks(query) {
    if (!FINNHUB_API_KEY || !query) {
      // Return hardcoded common stocks as mock search
      const mockDb = [
        { symbol: 'AAPL', displaySymbol: 'AAPL', description: 'APPLE INC', type: 'Common Stock' },
        { symbol: 'MSFT', displaySymbol: 'MSFT', description: 'MICROSOFT CORP', type: 'Common Stock' },
        { symbol: 'TSLA', displaySymbol: 'TSLA', description: 'TESLA INC', type: 'Common Stock' },
        { symbol: 'GOOGL', displaySymbol: 'GOOGL', description: 'ALPHABET INC-CL A', type: 'Common Stock' },
        { symbol: 'AMZN', displaySymbol: 'AMZN', description: 'AMAZON.COM INC', type: 'Common Stock' },
        { symbol: 'NVDA', displaySymbol: 'NVDA', description: 'NVIDIA CORP', type: 'Common Stock' },
        { symbol: 'META', displaySymbol: 'META', description: 'META PLATFORMS INC', type: 'Common Stock' },
        { symbol: 'SPY', displaySymbol: 'SPY', description: 'SPDR S&P 500 ETF TRUST', type: 'ETF' }
      ];
      return Promise.resolve(mockDb.filter(s => 
        s.symbol.toLowerCase().includes(query.toLowerCase()) || 
        s.description.toLowerCase().includes(query.toLowerCase())
      ));
    }

    try {
      const res = await fetch(`${BASE_URL}/search?q=${query}&token=${FINNHUB_API_KEY}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.result || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },
  
  getHistoricalData(symbol, currentPrice, days = 30) {
    // Generate realistic looking chart data bounded by currentPrice
    const data = [];
    let price = currentPrice * 0.8; // start a bit lower
    const now = new Date();
    for(let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const volatility = currentPrice * 0.05; // 5% daily volatility
      const change = (Math.random() - 0.45) * volatility; // slight upward bias
      price = price + change;
      
      // Ensure we end up exactly at the current price on the last day
      if (i === 0) price = currentPrice;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 0.01), // avoid negative prices
      });
    }
    return data;
  }
};
