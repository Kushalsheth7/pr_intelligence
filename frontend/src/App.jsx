import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RepositoryDetail from './pages/RepositoryDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/repositories/:id" element={<RepositoryDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
