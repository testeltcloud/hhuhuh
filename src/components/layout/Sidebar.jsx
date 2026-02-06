import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <span className="sidebar-nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/items" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">🛒</span>
            <span>Itens</span>
          </NavLink>
          
          <NavLink 
            to="/purchased" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">📦</span>
            <span>Histórico</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
