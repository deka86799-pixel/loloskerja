import React, { useState, useEffect } from 'react';
import { Save, User, Key, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { db } from '../utils/supabaseClient';
import confetti from 'canvas-confetti';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile'); // profile, api, notifications
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [position, setPosition] = useState('');
  const [tier, setTier] = useState('free');
  
  // API Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');

  // Notification preferences
  const [notifyFollowup, setNotifyFollowup] = useState(true);
  const [notifyDailyTips, setNotifyDailyTips] = useState(true);

  useEffect(() => {
    // Load profile
    const profile = db.getProfileSync();
    setName(profile.name || '');
    setIndustry(profile.target_industry || '');
    setPosition(profile.target_position || '');
    setTier(profile.subscription_tier || 'free');

    // Load API Keys from localStorage
    setGeminiKey(localStorage.getItem('loloskerja_gemini_key') || '');
    setSupabaseUrl(localStorage.getItem('loloskerja_supabase_url') || '');
    setSupabaseAnonKey(localStorage.getItem('loloskerja_supabase_key') || '');
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await db.updateProfile({
        name,
        target_industry: industry,
        target_position: position,
        subscription_tier: tier
      });
      alert('Profil berhasil diperbarui!');
      confetti({ particleCount: 30, spread: 50 });
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui profil.');
    }
  };

  const handleSaveAPIKeys = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('loloskerja_gemini_key', geminiKey.trim());
      localStorage.setItem('loloskerja_supabase_url', supabaseUrl.trim());
      localStorage.setItem('loloskerja_supabase_key', supabaseAnonKey.trim());
      alert('Kredensial API berhasil disimpan! Muat ulang halaman jika Anda mengubah kredensial Supabase.');
      confetti({ particleCount: 30, spread: 50 });
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan kunci.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>⚙️ Pengaturan</h2>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
          Kelola profil karir, preferensi notifikasi, dan kredensial API.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '30px' }} className="md-grid-1-mobile">
        
        {/* Navigation Sidebar settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'profile', label: '👤 Profil Karir', icon: <User size={16} /> },
            { id: 'api', label: '🔑 Kunci API & Dev', icon: <Key size={16} /> },
            { id: 'notifications', label: '🔔 Notifikasi', icon: <Bell size={16} /> }
          ].map(t => (
            <button
              key={t.id}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start',
                backgroundColor: activeTab === t.id ? 'var(--surface-container)' : 'transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontWeight: activeTab === t.id ? 600 : 500
              }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              <span style={{ marginLeft: '10px' }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Form Workspace */}
        <div className="card" style={{ backgroundColor: 'white' }}>
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSaveProfile}>
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Profil Karir Saya</h3>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Nama Lengkap</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Target Industri</label>
                  <input type="text" placeholder="Contoh: Teknologi / Fintech" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Target Posisi</label>
                  <input type="text" placeholder="Contoh: Product Manager" value={position} onChange={(e) => setPosition(e.target.value)} />
                </div>
              </div>

              {/* Subscriptions upgrade mock */}
              <div style={{ padding: '16px', backgroundColor: 'var(--surface-0)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Status Langganan
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '12px' }}>
                  Saat ini Anda berada di paket <strong>{tier.toUpperCase()}</strong>. Upgrade paket Anda secara instan untuk tujuan pengujian.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['free', 'pro', 'lifetime'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: tier === t ? 'var(--primary)' : 'white',
                        color: tier === t ? 'white' : 'var(--on-surface)',
                        border: tier === t ? 'none' : '1px solid var(--border)'
                      }}
                      onClick={() => setTier(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', height: '42px', alignSelf: 'flex-end' }}>
                <Save size={16} /> Simpan Perubahan
              </button>
            </form>
          )}

          {/* TAB 2: API KEYS */}
          {activeTab === 'api' && (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSaveAPIKeys}>
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Kredensial API & Database</h3>
              
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', borderLeft: '4px solid var(--warning)', padding: '12px', borderRadius: '4px', fontSize: '12px' }}>
                <strong>💡 Hubungkan Kunci API Anda Sendiri:</strong>
                <p style={{ marginTop: '4px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                  Simpan Kunci API Gemini Anda untuk mengaktifkan AI asli (Summary Generator, ATS Analyzer, Cover Letter Writer, dll). Kunci Anda disimpan aman di penyimpanan lokal (localStorage) browser Anda.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Google Gemini API Key</label>
                <input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  value={geminiKey} 
                  onChange={(e) => setGeminiKey(e.target.value)} 
                />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <ShieldAlert size={14} style={{ color: 'var(--outline)' }} />
                <span style={{ fontSize: '11px', color: 'var(--outline)', fontWeight: 600 }}>Supabase Database Configuration (Optional)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Supabase Project URL</label>
                <input 
                  type="text" 
                  placeholder="https://xxxx.supabase.co" 
                  value={supabaseUrl} 
                  onChange={(e) => setSupabaseUrl(e.target.value)} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>Supabase Anon Public Key</label>
                <input 
                  type="password" 
                  placeholder="eyJhbGci..." 
                  value={supabaseAnonKey} 
                  onChange={(e) => setSupabaseAnonKey(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', height: '42px', alignSelf: 'flex-end' }}>
                <Save size={16} /> Simpan Kunci API
              </button>
            </form>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Notifikasi & Pengingat</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={notifyFollowup} 
                    onChange={(e) => setNotifyFollowup(e.target.checked)} 
                    style={{ width: '18px', height: '18px' }} 
                  />
                  <span>Pengingat Tindak Lanjut (Follow-up Reminder) Tracker Harian</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={notifyDailyTips} 
                    onChange={(e) => setNotifyDailyTips(e.target.checked)} 
                    style={{ width: '18px', height: '18px' }} 
                  />
                  <span>Kirimkan Tips Karir & ATS Harian dari Coach</span>
                </label>
              </div>

              <button className="btn btn-primary" style={{ width: 'fit-content', height: '42px', alignSelf: 'flex-end' }} onClick={() => alert('Preferensi notifikasi disimpan!')}>
                <Save size={16} /> Simpan Pengaturan
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
