import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import PlayerDetail from './pages/PlayerDetail';
import StrategyApproval from './pages/StrategyApproval';
import Tournaments from './pages/Tournaments';
import CreateStrategy from './pages/CreateStrategy';
import FAQ from './pages/FAQ';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-hidden bg-white">
          <Routes>
            <Route path="/" element={<StrategyApproval />} />
            <Route path="/player/:playerId" element={<PlayerDetail />} />
            <Route path="/tournaments" element={<div className="w-full max-w-[2000px] mx-auto px-6 lg:px-8 xl:px-12 py-8"><Tournaments /></div>} />
            <Route path="/create-strategy/:playerId" element={<CreateStrategy />} />
            <Route path="/faq" element={<div className="w-full max-w-[2000px] mx-auto px-6 lg:px-8 xl:px-12 py-8"><FAQ /></div>} />
            <Route path="/settings" element={<div className="w-full max-w-[2000px] mx-auto px-6 lg:px-8 xl:px-12 py-8"><Settings /></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
