import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './context/AppProvider';

import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import StockDetail from './pages/StockDetail';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}
