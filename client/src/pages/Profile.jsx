import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✨ IMPORT NAVIGATE
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, LogOut, Settings, CheckCircle2, Sparkles, X, Save } from 'lucide-react';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ✨ INITIALIZE NAVIGATE
  
  // Modals state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading profile...</div>;
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // ✨ PERFECT LOGOUT FUNCTION
  const handleLogout = () => {
    logout(); // Clears user from AuthContext and localStorage
    navigate('/login'); // Instantly redirects to login page
  };

  // ✨ PERFECT EDIT PROFILE FUNCTION
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Send updated data to backend
      const { data } = await api.put('/users/profile', {
        name: editName,
        email: editEmail
      });
      
      // Update local storage so changes persist
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      userInfo.name = data.name;
      userInfo.email = data.email;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Reload page to update the UI globally
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Make sure your backend route is set up!");
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container">
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials(user.name)}
        </div>
        <div className="profile-info">
          <span className="profile-badge">
            {user.role === 'admin' ? 'Admin Account' : 'Free User'}
          </span>
          <h1>{user.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
            <Mail size={16} /> {user.email}
          </p>
        </div>
      </div>

      <div className="profile-content">
        {/* Subscription Card */}
        <div className="subscription-card">
          <h2><Crown size={24} /> MelodyHub Premium</h2>
          <p style={{ color: '#b3b3b3' }}>Take your music to the next level.</p>
          
          <ul className="subscription-features">
            <li><CheckCircle2 size={18} color="#1db954" /> Ad-free music listening</li>
            <li><CheckCircle2 size={18} color="#1db954" /> Download to listen offline</li>
            <li><CheckCircle2 size={18} color="#1db954" /> Highest audio quality</li>
            <li><CheckCircle2 size={18} color="#1db954" /> AI DJ & Advanced Chatbot</li>
          </ul>

          <button className="upgrade-btn" onClick={() => setShowPremiumModal(true)}>
            Upgrade to Premium
          </button>
        </div>

        {/* Account Settings & Actions */}
        <div className="account-actions">
          <h2 style={{ margin: '0 0 1rem 0' }}>Account Settings</h2>
          
          <button className="action-btn" onClick={() => {
            setEditName(user.name);
            setEditEmail(user.email);
            setShowEditModal(true); // ✨ OPENS EDIT MODAL
          }}>
            <Settings size={20} /> Edit Profile
          </button>
          
          <button className="action-btn logout-btn" onClick={handleLogout}> {/* ✨ LOGOUT TRIGGER */}
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>

      {/* "Coming Soon" Premium Modal */}
      {showPremiumModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Sparkles size={48} className="modal-icon" />
            <h2>Coming Soon!</h2>
            <p style={{ color: '#b3b3b3', marginTop: '1rem', lineHeight: '1.5' }}>
              We are working hard behind the scenes to bring you these premium features. Stay tuned for the next big MelodyHub update!
            </p>
            <button className="close-modal-btn" onClick={() => setShowPremiumModal(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ✨ NEW: "Edit Profile" Form Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              Edit Profile
              <X size={24} style={{ cursor: 'pointer', color: '#b3b3b3' }} onClick={() => setShowEditModal(false)} />
            </h2>
            
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#181818', border: '1px solid #333', color: 'white', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>Email</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#181818', border: '1px solid #333', color: 'white', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="upgrade-btn" 
                style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;