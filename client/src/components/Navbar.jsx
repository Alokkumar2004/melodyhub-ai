import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="nav-buttons">
        {user ? (
          <>
            <Link to="/profile" className="profile-badge">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-placeholder">
                  <User size={16} />
                </div>
              )}
              <span>{user.name}</span>
            </Link>
            <button className="btn-signup" onClick={logout} style={{ marginLeft: '8px' }}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/register"><button className="btn-signup">Sign up</button></Link>
            <Link to="/login"><button className="btn-login">Log in</button></Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;