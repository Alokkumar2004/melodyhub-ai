import React from 'react';
import { Home, Search, Library, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  
  return (
    <div className="mobile-nav">
      <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      
      <Link to="/search" className={`mobile-nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
        <Search size={24} />
        <span>Search</span>
      </Link>
      
      <Link to="/library" className={`mobile-nav-item ${location.pathname === '/library' ? 'active' : ''}`}>
        <Library size={24} />
        <span>Library</span>
      </Link>

      {/* Added Profile so users can access their account on mobile */}
      <Link to="/profile" className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
    </div>
  );
};

export default MobileNav;