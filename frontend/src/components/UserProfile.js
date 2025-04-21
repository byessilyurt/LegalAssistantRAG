import React, { useState, useRef, useEffect } from 'react';
import { useAuthentication } from '../auth/auth-hooks';
import '../styles/auth.css';

const UserProfile = () => {
  const { user, logout, isLoading } = useAuthentication();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (isLoading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Get first letter of name or email for the avatar
  const getInitial = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <div className="user-profile" ref={menuRef}>
      <button
        className="profile-button"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="User menu"
      >
        {user.picture && !imageError ? (
          <img
            src={user.picture}
            alt={user.name || 'User avatar'}
            className="profile-avatar"
            onError={handleImageError}
          />
        ) : (
          <div className="profile-initials">
            {getInitial()}
          </div>
        )}
      </button>

      {showMenu && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <div className="profile-info">
              {user.picture && !imageError ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="profile-avatar-large" 
                  onError={handleImageError}
                />
              ) : (
                <div className="profile-initials profile-avatar-large">
                  {getInitial()}
                </div>
              )}
              <div className="profile-details">
                <h4>{user.name || user.email || 'User'}</h4>
                <p>{user.email || ''}</p>
              </div>
            </div>
          </div>
          <div className="profile-menu-items">
            <button className="menu-item" onClick={() => logout()}>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 