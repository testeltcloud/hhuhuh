import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Purchased from './pages/Purchased';

function AppRoutes() {
  const { currentProfile, loading } = useProfile();

  if (loading) {
    return (
      <div className="welcome-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return <Welcome />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/items" element={<Items />} />
        <Route path="/purchased" element={<Purchased />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
