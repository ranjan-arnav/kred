import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Research from './pages/Research';
import RiskDNA from './pages/RiskDNA';
import Scoring from './pages/Scoring';
import Results from './pages/Results';
import Approvals from './pages/Approvals';
import Fraud from './pages/Fraud';
import DueDiligence from './pages/DueDiligence';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/research" element={<Research />} />
          <Route path="/due-diligence" element={<DueDiligence />} />
          <Route path="/risk-dna" element={<RiskDNA />} />
          <Route path="/scoring" element={<Scoring />} />
          <Route path="/results" element={<Results />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/fraud" element={<Fraud />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;

