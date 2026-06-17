import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotifikasiDropdown from './NotifikasiDropdown';
import { LogOut, ShoppingBag, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import { getUploadUrl } from '../api/axiosInstance';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 99,
      background: 'rgba(10, 7, 27, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '12px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" className="logo-container" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/candil_icon.png" 
            alt="Candil Skill Logo" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--accent-purple)', objectFit: 'cover' }} 
          />
          <span className="text-gradient logo-text" style={{
            fontWeight: 800,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Candil Skill Platform
          </span>
        </Link>

        {/* Right Area Navigation/Actions Wrapper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Desktop Navigation Links */}
          <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link 
              to="/" 
              style={{ 
                color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                textDecoration: 'none', 
                fontWeight: 500, 
                transition: 'var(--transition-smooth)' 
              }} 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Jelajah Jasa
            </Link>

            {user && (
              <>
                {user.role === 'client' && (
                  <Link 
                    to="/pesanan" 
                    style={{ 
                      color: isActive('/pesanan') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      textDecoration: 'none', 
                      fontWeight: 500, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }} 
                    className={`nav-link ${isActive('/pesanan') ? 'active' : ''}`}
                  >
                    <ShoppingBag size={18} /> Pesanan Saya
                  </Link>
                )}

                {user.role === 'freelancer' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      style={{ 
                        color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        textDecoration: 'none', 
                        fontWeight: 500, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }} 
                      className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                      <LayoutDashboard size={18} /> Dashboard FL
                    </Link>
                    <Link 
                      to="/pesanan" 
                      style={{ 
                        color: isActive('/pesanan') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        textDecoration: 'none', 
                        fontWeight: 500, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }} 
                      className={`nav-link ${isActive('/pesanan') ? 'active' : ''}`}
                    >
                      <ShoppingBag size={18} /> Kelola Pesanan
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    style={{ 
                      color: isActive('/admin') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      textDecoration: 'none', 
                      fontWeight: 500, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }} 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    <Shield size={18} /> Panel Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Divider Line */}
          <div className="nav-divider" style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

          {/* Desktop Right Area (User Profile / Auth) */}
          <div className="auth-desktop" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <>
                {/* Notification icon */}
                <NotifikasiDropdown />

                {/* User details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
                  {user.foto ? (
                    <img 
                      src={getUploadUrl(user.foto)} 
                      alt={user.nama} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-purple)' }} 
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {user.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.nama}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: 'bold' }}>{user.role}</span>
                  </div>

                  <button 
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      marginLeft: '8px',
                      transition: 'var(--transition-smooth)'
                    }}
                    title="Logout"
                    className="logout-btn"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>Login</button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Register</button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions Container (Notifications & Hamburger Button) */}
          <div className="nav-mobile-actions">
            {user && <NotifikasiDropdown />}
            <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-In Mobile Drawer */}
      <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link to="/" className="logo-container" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/candil_icon.png" 
              alt="Candil Skill Logo" 
              style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid var(--accent-purple)', objectFit: 'cover' }} 
            />
            <span className="text-gradient" style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase' }}>
              Candil Skill
            </span>
          </Link>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="mobile-drawer-content">
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px' }}>
              {user.foto ? (
                <img 
                  src={getUploadUrl(user.foto)} 
                  alt={user.nama} 
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-purple)' }} 
                />
              ) : (
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {user.nama.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.nama}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: 'bold' }}>{user.role}</span>
              </div>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              style={{ 
                color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                textDecoration: 'none', 
                fontWeight: 500,
                fontSize: '1.05rem'
              }}
            >
              Jelajah Jasa
            </Link>

            {user && (
              <>
                {user.role === 'client' && (
                  <Link 
                    to="/pesanan" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${isActive('/pesanan') ? 'active' : ''}`}
                    style={{ 
                      color: isActive('/pesanan') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      fontSize: '1.05rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShoppingBag size={18} /> Pesanan Saya
                  </Link>
                )}

                {user.role === 'freelancer' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                      style={{ 
                        color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        textDecoration: 'none', 
                        fontWeight: 500,
                        fontSize: '1.05rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <LayoutDashboard size={18} /> Dashboard FL
                    </Link>
                    <Link 
                      to="/pesanan" 
                      onClick={() => setIsMenuOpen(false)}
                      className={`nav-link ${isActive('/pesanan') ? 'active' : ''}`}
                      style={{ 
                        color: isActive('/pesanan') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                        textDecoration: 'none', 
                        fontWeight: 500,
                        fontSize: '1.05rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <ShoppingBag size={18} /> Kelola Pesanan
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    style={{ 
                      color: isActive('/admin') ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      fontSize: '1.05rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Shield size={18} /> Panel Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
            {user ? (
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="btn btn-danger"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <button className="btn btn-outline" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>Login</button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>Register</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isMenuOpen && (
        <div className="drawer-backdrop" onClick={() => setIsMenuOpen(false)}></div>
      )}
      
      {/* Global CSS style injection for hover effects and animations */}
      <style>{`
        .logo-container img {
          transition: var(--transition-smooth);
        }
        .logo-container:hover img {
          transform: rotate(10deg) scale(1.08);
          border-color: var(--accent-teal) !important;
        }
        .nav-link {
          position: relative;
          padding: 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-teal));
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }
        .nav-link:hover {
          color: var(--text-primary) !important;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
          transform-origin: left;
        }
        .logout-btn:hover {
          color: var(--accent-red) !important;
          background-color: rgba(239, 68, 68, 0.08);
        }
        
        /* Drawer styles */
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: var(--transition-smooth);
        }
        .hamburger-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .nav-mobile-actions {
          display: none;
          align-items: center;
          gap: 12px;
        }
        
        .mobile-drawer {
          position: fixed;
          top: 0;
          right: -300px;
          width: 300px;
          height: 100vh;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-glass);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          z-index: 999;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .mobile-drawer.open {
          right: 0;
        }
        .mobile-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-glass);
        }
        .mobile-drawer-header .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: var(--transition-smooth);
        }
        .mobile-drawer-header .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .mobile-drawer-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.2s ease forwards;
        }
        
        .logo-text {
          font-size: 1.4rem;
        }
        @media (max-width: 1200px) {
          .logo-text {
            font-size: 1.15rem;
          }
        }
        @media (max-width: 992px) {
          .nav-desktop, .nav-divider, .auth-desktop {
            display: none !important;
          }
          .nav-mobile-actions {
            display: flex !important;
          }
          .hamburger-btn {
            display: block !important;
          }
          .logo-text {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
