import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Home, FileText, CheckSquare, Settings, LogOut, 
  Menu, X, Target, Mail, Camera, MessageSquare, ShieldAlert, Brain
} from 'lucide-react';
import { db, isLocalMode, supabase } from '../utils/supabaseClient';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check session
    if (isLocalMode) {
      const sess = localStorage.getItem('loloskerja_session');
      if (!sess) {
        navigate('/auth');
        return;
      }
      setProfile(db.getProfileSync());
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          navigate('/auth');
        } else {
          db.getProfile().then(p => setProfile(p));
        }
      });
    }
  }, [navigate]);

  const handleLogout = async () => {
    if (isLocalMode) {
      localStorage.removeItem('loloskerja_session');
      navigate('/');
      return;
    }
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
    { label: 'CV Saya', path: '/dashboard/cvs', icon: <FileText size={18} /> },
    { label: 'ATS Analyzer', path: '/dashboard/ats-analyzer', icon: <Target size={18} /> },
    { label: 'Cover Letter', path: '/dashboard/cover-letters', icon: <Mail size={18} /> },
    { label: 'Foto AI', path: '/dashboard/foto', icon: <Camera size={18} /> },
    { label: 'Tracker', path: '/dashboard/tracker', icon: <CheckSquare size={18} /> },
    { label: 'Interview Prep', path: '/dashboard/interview', icon: <MessageSquare size={18} /> },
    { label: 'Psikotes AI', path: '/dashboard/psikotes', icon: <Brain size={18} /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
  ];

  const currentPath = location.pathname;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff8f5' }}>
      
      {/* SIDEBAR - DESKTOP ONLY */}
      <aside style={{
        width: '260px',
        backgroundColor: 'white',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease'
      }} className="md-hide-desktop-sidebar">
        
        {/* Logo */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>L</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>
            LolosKerja
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            return (
              <button 
                key={item.label}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  height: '44px',
                  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                  fontWeight: isActive ? 600 : 500
                }}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span style={{ marginLeft: '12px' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile bottom section */}
        {profile && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'} 
                  alt="Profile" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '2px solid white'
                }}></div>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {profile.name}
                </p>
                <span className="badge badge-primary" style={{ fontSize: '9px', padding: '1px 6px' }}>
                  {profile.subscription_tier?.toUpperCase() || 'FREE'}
                </span>
              </div>
            </div>

            <button 
              className="btn btn-ghost" 
              style={{
                width: '100%', 
                justifyContent: 'flex-start', 
                height: '38px', 
                padding: '0 12px', 
                fontSize: '13px',
                color: 'var(--danger)',
                backgroundColor: 'rgba(239, 68, 68, 0.04)'
              }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span style={{ marginLeft: '8px' }}>Keluar</span>
            </button>
          </div>
        )}
      </aside>

      {/* MOBILE HEADER TOP NAV */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 90
      }} className="md-flex-mobile-header">
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ padding: 0, width: '36px', height: '36px' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
          LolosKerja
        </span>
        {profile && (
          <img 
            src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'} 
            alt="Profile" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            onClick={() => navigate('/dashboard/settings')}
          />
        )}
      </div>

      {/* MOBILE SIDE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 89
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            width: '260px',
            height: '100%',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              {navItems.map((item) => {
                const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                return (
                  <button 
                    key={item.label}
                    className="btn btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      height: '44px',
                      backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                      fontWeight: isActive ? 600 : 500
                    }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                  >
                    {item.icon}
                    <span style={{ marginLeft: '12px' }}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <button 
              className="btn btn-ghost" 
              style={{
                width: '100%', 
                justifyContent: 'flex-start', 
                height: '40px',
                color: 'var(--danger)'
              }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span style={{ marginLeft: '8px' }}>Keluar</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER WORKSPACE */}
      <main style={{
        flex: 1,
        padding: '32px',
        marginLeft: '260px',
        minHeight: '100vh',
        overflowY: 'auto'
      }} className="md-main-layout-mobile">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'white',
        borderTop: '1px solid var(--border)',
        display: 'none',
        gridTemplateColumns: 'repeat(4, 1fr)',
        zIndex: 90
      }} className="md-flex-bottom-nav">
        {[
          { label: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
          { label: 'CV Saya', path: '/dashboard/cvs', icon: <FileText size={18} /> },
          { label: 'Tracker', path: '/dashboard/tracker', icon: <CheckSquare size={18} /> },
          { label: 'Akun', path: '/dashboard/settings', icon: <Settings size={18} /> },
        ].map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button 
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontWeight: isActive ? 600 : 500,
                gap: '4px'
              }}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
