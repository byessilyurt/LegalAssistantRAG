import React, { useState, useRef, useEffect } from 'react';
import { useAuthentication } from '../auth/auth-hooks';
import '../styles/auth.css';

const UserProfile = () => {
  const { user, logout, isLoading } = useAuthentication();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

  if (isLoading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile" ref={menuRef}>
      <button
        className="profile-button"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="User menu"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User avatar'}
            className="profile-avatar"
          />
        ) : (
          <div className="profile-initials">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </button>

      {showMenu && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <div className="profile-info">
              {user.picture && (
                <img src={user.picture} alt={user.name} className="profile-avatar-large" />
              )}
              <div className="profile-details">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
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