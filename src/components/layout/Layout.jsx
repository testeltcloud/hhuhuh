import { NavLink } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const { currentProfile, logout } = useProfile();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="header-title">💰 Despesas</h1>
            
            <div className="flex items-center gap-sm">
              <button 
                className="btn btn-ghost btn-icon"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <button 
                className="header-profile"
                onClick={logout}
                title="Trocar perfil"
              >
                <div 
                  className="profile-avatar"
                  style={{ backgroundColor: currentProfile?.color }}
                >
                  {currentProfile?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium desktop-only">{currentProfile?.name}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content - Scrollable Area */}
        <main className="content-area">
          {children}
        </main>

        {/* Bottom navigation - Mobile Only */}
        <nav className="bottom-nav mobile-only">
          <NavLink 
            to="/" 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <span className="bottom-nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/items" 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">🛒</span>
            <span>Itens</span>
          </NavLink>
          
          <NavLink 
            to="/purchased" 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">📦</span>
            <span>Histórico</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
