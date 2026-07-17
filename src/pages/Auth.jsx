import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase, isLocalMode } from '../utils/supabaseClient';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  
  const [isRegister, setIsRegister] = useState(modeParam === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setIsRegister(modeParam === 'register');
  }, [modeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (isLocalMode) {
      // MOCK LOCAL MODE AUTHENTICATION
      setTimeout(() => {
        setLoading(false);
        // Create local profile
        const localProfile = {
          id: 'local-user-id',
          name: name || email.split('@')[0] || 'Budi Santoso',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          target_industry: 'Teknologi / Startup',
          target_position: 'Product Manager',
          subscription_tier: searchParams.get('plan') || 'free',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('loloskerja_profile', JSON.stringify(localProfile));
        localStorage.setItem('loloskerja_session', 'local-session-active');
        navigate('/dashboard');
      }, 1000);
      return;
    }

    try {
      if (isRegister) {
        // Supabase Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });
        if (error) throw error;
        
        // Auto sign in or show verification
        if (data.session) {
          navigate('/dashboard');
        } else {
          setSuccessMsg('Pendaftaran berhasil! Silakan cek email Anda untuk melakukan verifikasi akun.');
        }
      } else {
        // Supabase Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    if (isLocalMode) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const localProfile = {
          id: 'local-user-id',
          name: 'Budi Santoso (Google)',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          target_industry: 'Teknologi / Startup',
          target_position: 'Product Manager',
          subscription_tier: 'free',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('loloskerja_profile', JSON.stringify(localProfile));
        localStorage.setItem('loloskerja_session', 'local-session-active');
        navigate('/dashboard');
      }, 1200);
      return;
    }

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-body)'
    }} className="md-flex-column">
      
      {/* KIRI: Branding Panel (40%) */}
      <div style={{
        flex: '0 0 40%',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, #6366f1 100%)',
        color: 'white',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }} className="md-hide-mobile">
        
        {/* Floating circles background */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', zIndex: 2 }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>
            L
          </div>
          <span style={{ fontWeight: 800, fontSize: '22px', fontFamily: 'var(--font-heading)' }}>LolosKerja</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2 }}>
          <h2 style={{ fontSize: '32px', color: 'white', fontWeight: 800, lineHeight: 1.2 }}>
            Karir impianmu dimulai dari sini.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>CV ATS-ready dalam 10 menit</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>Foto profesional dari selfie biasa</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>10.000+ pencari kerja sudah terbantu</span>
            </div>
          </div>
        </div>

        {/* Success story card */}
        <div className="card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '16px',
          borderRadius: '16px',
          color: 'white',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', marginBottom: '8px' }}>
            <Star size={12} fill="#fbbf24" /><Star size={12} fill="#fbbf24" /><Star size={12} fill="#fbbf24" /><Star size={12} fill="#fbbf24" /><Star size={12} fill="#fbbf24" />
          </div>
          <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.95)', lineHeight: 1.5, marginBottom: '12px' }}>
            "Reza dapat kerja dalam 2 minggu pakai LolosKerja."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eae1da', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>R</div>
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Reza Pratama</span>
          </div>
        </div>

      </div>

      {/* KANAN: Form Panel (60%) */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--surface-0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px'
      }}>
        
        {/* Mobile Header */}
        <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px', textAlign: 'center' }} className="md-flex-mobile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>L</div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>LolosKerja</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>"Karir impianmu dimulai dari sini"</p>
        </div>

        <div className="card" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          backgroundColor: 'white',
          boxShadow: 'var(--shadow-high)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>
              {isRegister ? 'Daftar Akun' : 'Masuk Akun'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
              {isRegister ? 'Mulai buat CV ATS-friendly pertamamu gratis' : 'Lanjutkan persiapan karirmu sekarang'}
            </p>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: 'var(--danger-container)', color: 'var(--on-danger-container)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: 'var(--success-container)', color: 'var(--on-success-container)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
              ✅ {successMsg}
            </div>
          )}

          {isLocalMode && (
            <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', marginBottom: '16px', textAlign: 'center', fontWeight: 500 }}>
              💻 Mode Pengembang Aktif: Masukkan email & password acak untuk masuk instan.
            </div>
          )}

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--outline)' }} />
                  <input 
                    type="text" 
                    placeholder="Masukkan nama lengkap" 
                    style={{ paddingLeft: '38px' }} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--outline)' }} />
                <input 
                  type="email" 
                  placeholder="nama@email.com" 
                  style={{ paddingLeft: '38px' }} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Kata Sandi</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--outline)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Minimal 8 karakter" 
                  style={{ paddingLeft: '38px', paddingRight: '40px' }} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--outline)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Memproses...' : isRegister ? 'Mulai Gratis Sekarang' : 'Masuk Sekarang'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '10px' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--outline)', textTransform: 'uppercase' }}>atau</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          </div>

          {/* Google Auth Button */}
          <button className="btn btn-secondary" style={{ width: '100%', height: '44px', display: 'flex', gap: '8px' }} onClick={handleGoogleAuth} disabled={loading}>
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Masuk dengan Google</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '24px' }}>
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <button 
              type="button" 
              style={{ fontWeight: 600, color: 'var(--primary)', display: 'inline' }}
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setIsRegister(!isRegister);
                navigate(`/auth?mode=${!isRegister ? 'register' : 'login'}`);
              }}
            >
              {isRegister ? 'Masuk di sini' : 'Daftar gratis'}
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}
