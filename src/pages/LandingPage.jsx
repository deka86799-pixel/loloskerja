import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle, AlertTriangle, XCircle, ChevronRight, 
  Star, Menu, X, ArrowRight, Upload, Briefcase, Camera, 
  HelpCircle, ChevronDown, Check, Globe, RefreshCw, Zap
} from 'lucide-react';
import { isLocalMode } from '../utils/supabaseClient';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const [activeFAQ, setActiveFAQ] = useState(null);
  
  // Interactive Dashboard Preview State
  const [previewScore, setPreviewScore] = useState(0);
  const [previewTab, setPreviewTab] = useState('keywords');
  const [beforeAfterToggle, setBeforeAfterToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Dynamic demo dashboard states
  const [previewMenu, setPreviewMenu] = useState('beranda'); // 'beranda', 'cv', 'ats', 'letter', 'foto', 'tracker'
  const [previewOutfit, setPreviewOutfit] = useState('jas'); // 'jas', 'blazer', 'batik'
  const [previewBg, setPreviewBg] = useState('office'); // 'office', 'studio'
  const [previewGender, setPreviewGender] = useState('pria'); // 'pria', 'wanita'
  const [previewPhotoLoading, setPreviewPhotoLoading] = useState(false);
  const [showDemoAlert, setShowDemoAlert] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animasi count-up score saat preview diklik
  const triggerScoreAnimation = () => {
    setPreviewScore(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 3;
      if (current >= 87) {
        setPreviewScore(87);
        clearInterval(interval);
      } else {
        setPreviewScore(current);
      }
    }, 20);
  };

  useEffect(() => {
    triggerScoreAnimation();
  }, []);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqData = [
    {
      q: "Apa itu ATS dan kenapa penting?",
      a: "ATS (Applicant Tracking System) adalah software yang digunakan oleh rekruter perusahaan besar untuk memindai, menyaring, dan mengurutkan CV secara otomatis berdasarkan kata kunci (keywords) dan format tertentu. Jika CV Anda tidak berformat ramah ATS atau kekurangan kata kunci penting dari lowongan, sistem akan langsung mengeliminasinya sebelum dibaca manusia."
    },
    {
      q: "Apakah CV yang dibuat benar-benar bebas watermark di plan Free?",
      a: "Ya! 100% Gratis tanpa watermark apapun. Komitmen utama LolosKerja adalah membantu pencari kerja Indonesia mendapatkan berkas lamaran yang profesional secara adil dan terjangkau."
    },
    {
      q: "Bagaimana cara kerja foto profesional AI?",
      a: "Anda cukup mengunggah satu foto selfie kasual beresolusi baik dengan pencahayaan cukup. AI kami akan secara cerdas merender ulang wajah Anda, memadukannya dengan pakaian formal pilihan Anda (jas, batik, blazer), menyesuaikan pencahayaan studio, dan mengganti latar belakang menjadi profesional."
    },
    {
      q: "Apakah cover letter yang dihasilkan AI akan terdeteksi sebagai AI?",
      a: "AI Cover Letter Writer kami dikonfigurasi untuk menulis dengan gaya bahasa penulisan surat lamaran khas Indonesia yang natural, kontekstual, dan personal. Surat disesuaikan dengan latar belakang profil CV Anda dan poin-poin penting pada deskripsi kerja, sehingga terdengar sangat otentik."
    },
    {
      q: "Bisakah saya buat CV dalam Bahasa Inggris?",
      a: "Tentu saja! Template builder kami mendukung input teks dalam bahasa apa pun dan fitur AI pendukung kami (Summary & Work Bullet Points) dapat merespons serta menghasilkan teks dalam Bahasa Inggris jika diminta."
    },
    {
      q: "Apakah ada template yang cocok untuk fresh graduate?",
      a: "Ya, kami menyediakan template kategori 'ATS-Friendly' klasik berstruktur satu kolom yang sangat direkomendasikan untuk fresh graduate karena mengedepankan keterbacaan data pendidikan, keahlian, dan organisasi tanpa distraksi desain berlebih."
    },
    {
      q: "Apa bedanya Free dan Pro?",
      a: "Plan Free memungkinkan Anda membuat hingga 2 CV, 2 Cover Letter, dan 5 kali ATS Analyzer. Plan Pro membuka akses ke seluruh template modern visual berdesain menarik, generator cover letter & ATS Analyzer tanpa batas, pembuatan foto profesional AI tanpa kuota, serta simulasi interview interaktif (Practice Mode)."
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* NAVBAR */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 var(--space-lg)',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>L</div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--primary)' }}>
              LolosKerja
            </span>
          </div>

          <div style={{ display: 'none', gap: '32px', alignItems: 'center' }} className="md-flex-desktop">
            <a href="#fitur" style={{ color: 'var(--on-surface-variant)', fontWeight: 500, fontSize: '14px' }}>Fitur</a>
            <a href="#harga" style={{ color: 'var(--on-surface-variant)', fontWeight: 500, fontSize: '14px' }}>Harga</a>
            <a href="#faq" style={{ color: 'var(--on-surface-variant)', fontWeight: 500, fontSize: '14px' }}>FAQ</a>
          </div>

          <div style={{ display: 'none', gap: '12px', alignItems: 'center' }} className="md-flex-desktop">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>Masuk</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth?mode=register')}>Buat CV Gratis</button>
          </div>

          <button className="btn btn-ghost btn-sm md-hide-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE NAV DROPDOWN */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid var(--border)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 99,
          boxShadow: 'var(--shadow-high)'
        }}>
          <a href="#fitur" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Fitur</a>
          <a href="#harga" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Harga</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>FAQ</a>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          <button className="btn btn-secondary" onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>Masuk</button>
          <button className="btn btn-primary" onClick={() => { setMobileMenuOpen(false); navigate('/auth?mode=register'); }}>Buat CV Gratis</button>
        </div>
      )}

      {/* HERO SECTION */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '80px',
        background: 'radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.08) 0%, rgba(255,255,255,0) 60%)',
        position: 'relative'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          {/* Pre-headline Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.15)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '24px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--primary)'
          }}>
            <span>🎯 CV kamu lolos ATS atau langsung dibuang?</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'calc(1.8rem + 1.8vw)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            fontWeight: 800
          }}>
            <span style={{
              background: 'linear-gradient(to right, var(--primary-dark), #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>75% CV dibuang oleh sistem</span> bahkan sebelum HR membacanya. Pastikan CV kamu bukan salah satunya.
          </h1>

          <p style={{
            fontSize: 'calc(0.95rem + 0.15vw)',
            color: 'var(--on-surface-variant)',
            maxWidth: '650px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            LolosKerja membantu kamu membuat CV yang lolos ATS, surat lamaran yang dilirik HR, dan foto profesional dari selfie biasa — semua dalam satu platform terintegrasi.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '32px'
          }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth?mode=register')}>
              Buat CV Gratis Sekarang
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard/ats-analyzer')}>
              Cek ATS Score CV-mu →
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '40px' }}>
            🎉 Gratis · Tanpa watermark · Tidak perlu kartu kredit
          </p>

          {/* Social Proof */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', marginLeft: '10px' }}>
              {[1,2,3,4,5].map((i) => (
                <div key={i} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  marginLeft: '-10px',
                  backgroundColor: '#eae1da',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  overflow: 'hidden'
                }}>
                  <img src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', marginBottom: '2px' }}>
                <Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" />
                <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--on-surface)', marginLeft: '4px' }}>4.9/5</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                <strong>10.000+ pencari kerja</strong> sudah terbantu · <strong>85% dapat panggilan</strong> dalam 2 minggu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DASHBOARD PREVIEW */}
      <section style={{ padding: '20px 0 80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Lihat LolosKerja Beraksi</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>Semua yang kamu butuhkan untuk mendapat pekerjaan dalam satu platform interaktif</p>
          </div>

          {/* Browser Frame */}
          <div className="card" style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: 0,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-high)',
            backgroundColor: 'var(--surface-0)'
          }}>
            {/* Header Browser */}
            <div style={{
              backgroundColor: '#eae1da',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fbbf24' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '4px 16px',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                width: '320px',
                textAlign: 'left',
                border: '1px solid var(--border)'
              }}>
                app.loloskerja.com/dashboard
              </div>
              <div style={{ marginLeft: 'auto' }} className="badge badge-success">
                ✨ Live Preview
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '520px' }} className="md-grid-1-mobile">
              
              {/* Sidebar */}
              <div style={{
                backgroundColor: 'white',
                borderRight: '1px solid var(--border)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }} className="md-hide-mobile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
                  <span style={{ fontWeight: 800, fontSize: '15px' }}>LolosKerja</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button 
                    style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '6px', width: '100%', textAlign: 'left', backgroundColor: previewMenu === 'beranda' ? 'var(--surface-container)' : 'transparent', fontWeight: previewMenu === 'beranda' ? 600 : 500, fontSize: '13px', color: previewMenu === 'beranda' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setPreviewMenu('beranda')}
                  >
                    <span>🏠 Beranda</span>
                  </button>
                  <button 
                    style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '6px', width: '100%', textAlign: 'left', backgroundColor: previewMenu === 'cv' ? 'var(--surface-container)' : 'transparent', fontWeight: previewMenu === 'cv' ? 600 : 500, fontSize: '13px', color: previewMenu === 'cv' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setPreviewMenu('cv')}
                  >
                    <span>📄 CV Saya</span>
                  </button>
                  <button 
                    style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '6px', width: '100%', textAlign: 'left', backgroundColor: previewMenu === 'ats' ? 'var(--surface-container)' : 'transparent', fontWeight: previewMenu === 'ats' ? 600 : 500, fontSize: '13px', color: previewMenu === 'ats' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setPreviewMenu('ats')}
                  >
                    <span>🎯 ATS Analyzer</span>
                  </button>
                  <button 
                    style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '6px', width: '100%', textAlign: 'left', backgroundColor: previewMenu === 'letter' ? 'var(--surface-container)' : 'transparent', fontWeight: previewMenu === 'letter' ? 600 : 500, fontSize: '13px', color: previewMenu === 'letter' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setPreviewMenu('letter')}
                  >
                    <span>✉️ Cover Letter</span>
                  </button>
                  <button 
                    style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '6px', width: '100%', textAlign: 'left', backgroundColor: previewMenu === 'foto' ? 'var(--surface-container)' : 'transparent', fontWeight: previewMenu === 'foto' ? 600 : 500, fontSize: '13px', color: previewMenu === 'foto' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setPreviewMenu('foto')}
                  >
                    <span>📸 Foto Profesional</span>
                  </button>
                  <button 
                    style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '6px', width: '100%', textAlign: 'left', backgroundColor: previewMenu === 'tracker' ? 'var(--surface-container)' : 'transparent', fontWeight: previewMenu === 'tracker' ? 600 : 500, fontSize: '13px', color: previewMenu === 'tracker' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setPreviewMenu('tracker')}
                  >
                    <span>📋 Tracker</span>
                  </button>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600 }}>Budi Santoso</p>
                    <span className="badge badge-primary" style={{ fontSize: '8px', padding: '1px 4px' }}>PRO USER</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
                
                {/* 1. BERANDA TAB */}
                {previewMenu === 'beranda' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Halo, Budi! 👋</h3>
                        <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Semangat cari kerja hari ini. Setiap lamaran mendekatkanmu pada impian.</p>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={triggerScoreAnimation} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={12} /> Recalculate
                      </button>
                    </div>

                    {/* Grid Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
                      <div className="card" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'white' }}>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>📄 CV Dibuat</p>
                        <h4 style={{ fontSize: '20px' }}>3 <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--on-surface-variant)' }}>versi</span></h4>
                      </div>
                      <div className="card" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'white', position: 'relative', overflow: 'hidden' }}>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>🎯 Skor ATS Terbaik</p>
                        <h4 style={{ fontSize: '20px', color: 'var(--success)' }}>{previewScore}/100</h4>
                        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}></div>
                      </div>
                      <div className="card" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'white' }}>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>📤 Total Lamaran</p>
                        <h4 style={{ fontSize: '20px' }}>12</h4>
                      </div>
                      <div className="card" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'white' }}>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>📞 Panggilan</p>
                        <h4 style={{ fontSize: '20px' }}>4 <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 6px' }}>33% rate</span></h4>
                      </div>
                    </div>

                    {/* Sub Features Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }} className="md-grid-1-mobile">
                      {/* ATS Analyzer Preview */}
                      <div className="card" style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>ATS Analyzer Matcher</span>
                          <span className="badge badge-success" style={{ fontSize: '10px' }}>{previewScore}% Match</span>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                          <button 
                            style={{ padding: '8px 12px', fontWeight: previewTab === 'keywords' ? 600 : 400, borderBottom: previewTab === 'keywords' ? '2px solid var(--primary)' : 'none', color: previewTab === 'keywords' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                            onClick={() => setPreviewTab('keywords')}
                          >
                            Keywords
                          </button>
                          <button 
                            style={{ padding: '8px 12px', fontWeight: previewTab === 'format' ? 600 : 400, borderBottom: previewTab === 'format' ? '2px solid var(--primary)' : 'none', color: previewTab === 'format' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                            onClick={() => setPreviewTab('format')}
                          >
                            Format
                          </button>
                        </div>

                        {previewTab === 'keywords' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <p style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                <CheckCircle size={12} /> Ditemukan (Cocok)
                              </p>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {["Product Strategy", "Data Analysis", "User Research", "Scrum"].map((kw) => (
                                  <span key={kw} style={{ fontSize: '10px', backgroundColor: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>{kw}</span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                <XCircle size={12} /> Belum Ada (Missing)
                              </p>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {["Agile Project Management", "A/B Testing", "KPI Design"].map((kw) => (
                                  <span key={kw} style={{ fontSize: '10px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>{kw}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Format File (PDF)</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>OK ✅</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Keterbacaan Font</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>OK ✅</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Struktur Layout</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>OK ✅</span></div>
                          </div>
                        )}
                      </div>

                      {/* Photo AI Before / After */}
                      <div className="card" style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>Foto Profesional AI</span>
                        
                        <div style={{ position: 'relative', width: '130px', height: '130px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)' }}>
                          <img 
                            src={beforeAfterToggle 
                              ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" 
                              : "https://randomuser.me/api/portraits/men/32.jpg"
                            } 
                            alt="Photo Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: beforeAfterToggle ? 'var(--primary)' : 'rgba(0,0,0,0.5)',
                            color: 'white',
                            fontSize: '9px',
                            padding: '2px 0',
                            fontWeight: 600
                          }}>
                            {beforeAfterToggle ? "AI Enhanced ✨" : "Original Selfie 🤳"}
                          </div>
                        </div>

                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ fontSize: '11px', height: '30px' }}
                          onMouseEnter={() => setBeforeAfterToggle(true)}
                          onMouseLeave={() => setBeforeAfterToggle(false)}
                          onClick={() => setBeforeAfterToggle(!beforeAfterToggle)}
                        >
                          Hover untuk After
                        </button>
                      </div>
                    </div>

                    {/* Job Tracker mini */}
                    <div className="card" style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>Job Tracker</span>
                        <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Kategori: Interview Tahap 2</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--surface-0)', borderLeft: '4px solid var(--warning)', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 700 }}>Shopee — Product Manager</p>
                          <span style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>Apply: 10 Juli 2026</span>
                        </div>
                        <span className="badge badge-warning" style={{ marginLeft: 'auto', fontSize: '9px' }}>Dapat Panggilan</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. CV SAYA TAB */}
                {previewMenu === 'cv' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>📄 CV Saya (Simulasi)</h4>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowDemoAlert(true)}>+ Buat CV Baru</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
                      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>CV_Budi_Shopee_2025</span>
                          <span className="badge badge-success" style={{ fontSize: '9px' }}>87 ATS</span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Template: ATS-Classic</p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" style={{ fontSize: '10px', height: '28px' }} onClick={() => setShowDemoAlert(true)}>Cetak</button>
                          <button className="btn btn-primary btn-sm" style={{ fontSize: '10px', height: '28px' }} onClick={() => setShowDemoAlert(true)}>Edit</button>
                        </div>
                      </div>

                      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>CV_Budi_Creative_2025</span>
                          <span className="badge badge-warning" style={{ fontSize: '9px' }}>74 ATS</span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Template: Modern-Creative</p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" style={{ fontSize: '10px', height: '28px' }} onClick={() => setShowDemoAlert(true)}>Cetak</button>
                          <button className="btn btn-primary btn-sm" style={{ fontSize: '10px', height: '28px' }} onClick={() => setShowDemoAlert(true)}>Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ATS ANALYZER TAB */}
                {previewMenu === 'ats' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>🎯 ATS Analyzer (Simulasi)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '16px' }} className="md-grid-1-mobile">
                      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)' }}>CV Aktif:</label>
                          <p style={{ fontSize: '12px', fontWeight: 'bold' }}>CV_Budi_Shopee_2025.pdf</p>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Posisi Dilamar:</label>
                          <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Product Manager di Shopee</p>
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', height: '36px' }} onClick={() => setShowDemoAlert(true)}>Analisa Ulang</button>
                      </div>

                      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold' }}>MATCH SCORE</span>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '6px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'var(--success)' }}>
                          87%
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>CV Anda sangat cocok dengan deskripsi lowongan ini!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. COVER LETTER TAB */}
                {previewMenu === 'letter' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>✉️ Cover Letter (Simulasi)</h4>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowDemoAlert(true)}>Ubah Tone 👔</button>
                    </div>
                    <div className="card" style={{ backgroundColor: 'white', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--outline)' }}>Tone: Conversational</span>
                      <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--on-surface)', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--surface-0)' }}>
                        <p><strong>Halo Tim Rekrutmen Shopee,</strong></p>
                        <br />
                        <p>Saya sangat senang menulis surat ini untuk melamar posisi Product Manager di Shopee. Sebagai seorang profesional dengan pengalaman memimpin inisiatif peluncuran fitur mobile di TechCorp Indonesia yang berhasil menaikkan retensi retensi bulanan pengguna sebesar 15%...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. FOTO PROFESIONAL TAB */}
                {previewMenu === 'foto' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>📸 Foto Profesional AI (Simulasi)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }} className="md-grid-1-mobile">
                      
                      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pilih Pakaian</label>
                          <select value={previewOutfit} onChange={(e) => setPreviewOutfit(e.target.value)} style={{ height: '32px', padding: '4px' }}>
                            <option value="jas">Jas Hitam Formal 🤵</option>
                            <option value="batik">Batik Indonesia 🎋</option>
                            <option value="blazer">Blazer Navy 👩‍💼</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pilih Background</label>
                          <select value={previewBg} onChange={(e) => setPreviewBg(e.target.value)} style={{ height: '32px', padding: '4px' }}>
                            <option value="office">Blur Ruang Kantor 🌫️</option>
                            <option value="studio">Polos Abu Studio 🔲</option>
                          </select>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-primary btn-sm" 
                          style={{ height: '36px', marginTop: '10px' }}
                          onClick={() => {
                            setPreviewPhotoLoading(true);
                            setTimeout(() => {
                              setPreviewPhotoLoading(false);
                            }, 1200);
                          }}
                        >
                          Render AI Foto
                        </button>
                      </div>

                      <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                        {previewPhotoLoading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: '11px' }}>AI merender...</span>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', margin: '0 auto 10px auto', border: '2px solid var(--primary)' }}>
                              <img 
                                src={previewOutfit === 'blazer'
                                  ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                                  : previewOutfit === 'batik'
                                    ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300"
                                    : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150"
                                } 
                                alt="Outfit" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: '10px', height: '24px' }} onClick={() => setShowDemoAlert(true)}>Unduh Hasil</button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* 6. TRACKER TAB */}
                {previewMenu === 'tracker' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>📋 Kanban Tracker (Simulasi)</h4>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowDemoAlert(true)}>+ Tambah</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }} className="grid-2-mobile">
                      <div style={{ backgroundColor: 'var(--surface-0)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--outline)' }}>Wishlist (1)</span>
                        <div className="card" style={{ padding: '8px', fontSize: '9px', fontWeight: 'bold', backgroundColor: 'white', marginTop: '6px' }} onClick={() => setShowDemoAlert(true)}>
                          Traveloka - APM
                        </div>
                      </div>
                      <div style={{ backgroundColor: 'var(--surface-0)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>Applied (1)</span>
                        <div className="card" style={{ padding: '8px', fontSize: '9px', fontWeight: 'bold', backgroundColor: 'white', marginTop: '6px' }} onClick={() => setShowDemoAlert(true)}>
                          Gojek - Junior PM
                        </div>
                      </div>
                      <div style={{ backgroundColor: 'var(--surface-0)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--warning)' }}>Interview (1)</span>
                        <div className="card" style={{ padding: '8px', fontSize: '9px', fontWeight: 'bold', backgroundColor: 'white', marginTop: '6px', borderLeft: '3px solid var(--warning)' }} onClick={() => setShowDemoAlert(true)}>
                          Shopee - PM
                        </div>
                      </div>
                      <div style={{ backgroundColor: 'var(--surface-0)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#a855f7' }}>Offer (0)</span>
                        <div style={{ fontSize: '9px', fontStyle: 'italic', color: 'var(--outline)', textAlign: 'center', marginTop: '12px' }}>Kosong</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO BAR */}
      <section style={{ padding: '40px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            Pengguna kami bekerja di perusahaan terkemuka Indonesia:
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            opacity: 0.65,
            fontWeight: 800,
            fontSize: '18px',
            color: 'var(--on-surface-variant)',
            fontFamily: 'var(--font-heading)'
          }}>
            <span>GoTo Group</span>
            <span>Shopee Indonesia</span>
            <span>BCA</span>
            <span>Telkom Indonesia</span>
            <span>Pertamina</span>
            <span>Traveloka</span>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-0)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Kenapa lamaran kamu tidak pernah dibalas?</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>Memahami kendala utama dalam rekrutmen korporasi modern</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="md-grid-1-mobile">
            <div className="card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--danger)' }}>
              <div style={{ fontSize: '24px' }}>🤖</div>
              <h3 style={{ fontSize: '18px' }}>CV Tidak Dilihat Manusia</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                Perusahaan besar memakai ATS untuk menyaring ratusan CV secara otomatis. Jika format CV Anda tidak terbaca komputer atau tidak mengandung keyword lowongan, CV langsung terbuang otomatis tanpa sempat dibuka HR.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--warning)' }}>
              <div style={{ fontSize: '24px' }}>✉️</div>
              <h3 style={{ fontSize: '18px' }}>Surat Lamaran Copas</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                Kalimat "Dengan hormat, saya ingin melamar..." sudah dihafal luar kepala oleh HR. Cover letter yang generik menunjukkan kurangnya minat nyata. HR menginginkan keterkaitan khusus antara kualifikasi Anda dengan target divisi perusahaan.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '24px' }}>📸</div>
              <h3 style={{ fontSize: '18px' }}>Foto CV Kurang Profesional</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                Foto selfie, foto wisuda ber-toga lengkap, atau foto berlatar ramai memberikan impresi pertama yang kurang rapi. Kesan profesionalisme visual menentukan kredibilitas berkas lamaran bahkan sebelum dibaca lebih dalam.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
              "Saatnya berhenti kirim lamaran kosong dan mulai dapat panggilan interview."
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Memperkenalkan LolosKerja 🎯</p>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section id="fitur" style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '96px' }}>
          
          {/* Fitur 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="md-grid-1-mobile">
            <div>
              <span className="badge badge-success" style={{ marginBottom: '12px' }}>ATS-Optimized</span>
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>CV yang lolos sistem otomatis dan menarik bagi HR</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px', lineHeight: 1.6 }}>
                Pilih dari 12 template CV yang dirancang khusus: 6 template kategori **ATS-Friendly** berformat clean dan 6 template kategori **Modern Visual** untuk startup kreatif. Gunakan modul AI writer per section untuk memperbaiki resume Anda dalam hitungan detik.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Template 100% ATS-Safe & Modern</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>AI Writer per section didukung Gemini API</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>ATS Score Meter interaktif (Update Real-time)</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Download gratis format PDF / DOCX / Plain Text</span></div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/auth?mode=register')}>Buat CV Sekarang</button>
            </div>
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white' }}>
              <div style={{ borderLeft: '4px solid var(--success)', paddingLeft: '12px' }}>
                <h4 style={{ fontSize: '16px' }}>CV Budi Santoso - Product Manager</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Template: Classic ATS Safe</p>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.85, fontSize: '11px' }}>
                <p><strong>PENGALAMAN KERJA</strong></p>
                <p><strong>Associate PM | TechCorp Indonesia (2023 - Sekarang)</strong></p>
                <p>• Mengelola pengembangan produk mobile app dari inisiasi hingga rilis.</p>
                <p>• Berhasil meningkatkan retensi bulanan aplikasi sebesar 15% via eksperimen UX.</p>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">✅ ATS Friendly template</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>ATS Score: 87</span>
              </div>
            </div>
          </div>

          {/* Fitur 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="md-grid-1-mobile">
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white', order: 2 }} className="md-order-2-desktop">
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--surface-0)', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>AI Photo Generator</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', textAlign: 'left' }}>
                  <div style={{ border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', backgroundColor: 'white' }}>🤵 Jas Hitam</div>
                  <div style={{ border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', backgroundColor: 'white' }}>🌫️ Blur Kantor</div>
                  <div style={{ border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', backgroundColor: 'white' }}>💡 Studio Warm</div>
                  <div style={{ border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', backgroundColor: 'white' }}>📐 Grid 2x2</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', backgroundColor: '#eae1da', display: 'flex', alignItems: 'center', justifyCenter: 'center', overflow: 'hidden' }}>
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Source" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--on-surface-variant)' }}>➡️</div>
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', border: '2px solid var(--primary)', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" alt="Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
            <div style={{ order: 1 }} className="md-order-1-desktop">
              <span className="badge badge-warning" style={{ marginBottom: '12px' }}>Eksklusif — Tidak ada di tempat lain</span>
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Ubah selfie biasa jadi foto profesional dalam 30 detik</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px', lineHeight: 1.6 }}>
                Tidak perlu mengeluarkan biaya besar sewa fotografer studio atau membeli setelan mahal. Cukup unggah selfie dari HP, pilih pakaian formal yang diinginkan (jas, blazer, batik), atur latar belakang dan pencahayaan, dan AI kami akan merender potret profesional siap CV & LinkedIn.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Pilihan outfit lengkap (jas, blazer, batik formal)</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Custom background kantor / studio gradasi</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Download resolusi tinggi 800x800px (JPG, PNG transparan)</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Tombol instan pasang langsung ke CV editor</span></div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/auth?mode=register')}>Coba Foto AI</button>
            </div>
          </div>

          {/* Fitur 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="md-grid-1-mobile">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Dipersonalisasi Per Lamaran</span>
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Surat lamaran (Cover Letter) yang dibuat khusus untuk tiap lowongan</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px', lineHeight: 1.6 }}>
                LolosKerja AI membaca deskripsi pekerjaan (Job Description) yang kamu paste, merujuk isi resume CV yang sudah kamu buat, dan menulis surat lamaran berbobot yang menonjolkan keterkaitan keterampilan Anda dengan target kebutuhan rekruter.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Pilih tone tulisan: Formal, Semi-formal, atau Conversational</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Rich text editor untuk modifikasi manual secara langsung</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Simpan otomatis ke pustaka (Cover Letter Library)</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Export ke format PDF & DOCX</span></div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/auth?mode=register')}>Tulis Cover Letter</button>
            </div>
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                <span>✉️ Cover Letter Writer</span>
                <span>Tone: 👔 Semi-formal</span>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px', backgroundColor: 'var(--surface-0)', lineHeight: 1.6 }}>
                <p><strong>Kepada Tim Rekrutmen Shopee Indonesia,</strong></p>
                <br />
                <p>Saya menulis surat ini untuk menyatakan ketertarikan saya pada posisi <strong>Product Manager</strong>...</p>
                <p>Dengan latar belakang saya di <strong>TechCorp Indonesia</strong> di mana saya meluncurkan fitur mobile yang menaikkan retensi 15%...</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: '10px' }}>Ubah Tone</button>
                <button className="btn btn-primary btn-sm" style={{ fontSize: '10px' }}>Generate Ulang ✨</button>
              </div>
            </div>
          </div>

          {/* Fitur 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="md-grid-1-mobile">
            <div className="card" style={{ padding: '20px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '12px', order: 2 }} className="md-order-2-desktop">
              <div style={{ display: 'flex', gap: '10px', fontSize: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', borderBottom: '2px solid var(--primary)', paddingBottom: '4px' }}>📋 Kanban Tracker</span>
                <span style={{ color: 'var(--on-surface-variant)' }}>📊 Persiapan Interview</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ border: '1px dashed var(--border)', padding: '10px', borderRadius: '8px', minHeight: '100px', backgroundColor: 'var(--surface-0)' }}>
                  <p style={{ fontSize: '9px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>Applied (12)</p>
                  <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '6px', borderRadius: '6px', fontSize: '8px', fontWeight: 'bold' }}>Gojek — APM</div>
                </div>
                <div style={{ border: '1px dashed var(--border)', padding: '10px', borderRadius: '8px', minHeight: '100px', backgroundColor: 'var(--surface-0)' }}>
                  <p style={{ fontSize: '9px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px' }}>Interview (4)</p>
                  <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '6px', borderRadius: '6px', fontSize: '8px', fontWeight: 'bold', borderLeft: '3px solid var(--warning)' }}>Shopee — PM</div>
                </div>
              </div>
            </div>
            <div style={{ order: 1 }} className="md-order-1-desktop">
              <span className="badge badge-danger" style={{ marginBottom: '12px' }}>Career Command Center</span>
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Pantau lamaran dan latih kesiapan interview dalam satu dasbor</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px', lineHeight: 1.6 }}>
                Simpan dan kelola status seluruh lamaran kerja dalam papan kanban (Kanban Board) yang intuitif. Ketika Anda dipanggil untuk sesi wawancara, AI pendukung kami secara cerdas meramu 20 pertanyaan terfokus beserta draf jawaban ideal ber-framework **STAR** berdasarkan data lowongan tersebut.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Kanban Board visual (Wishlist, Applied, Interview, Offer, Diterima, Ditolak)</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>20 Pertanyaan tersesuaikan berdasarkan posisi + Draf jawaban STAR</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>Practice Mode dengan timer terintegrasi</span></div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} style={{ color: 'var(--success)' }} /> <span>AI grading & koreksi detail jawaban lisan/tulisan Anda</span></div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/auth?mode=register')}>Latih Interview</button>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-0)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Mereka sudah mendapat kerjanya</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>10.000+ pencari kerja Indonesia telah terbantu dan melangkah maju</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="md-grid-1-mobile">
            {/* Testimonial 1 - Featured */}
            <div className="card" style={{ gridColumn: 'span 2', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--primary)', backgroundColor: 'white' }} className="md-span-1-mobile">
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                <Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: 1.7, color: 'var(--on-surface)' }}>
                "Saya sudah mengirim lebih dari 50 lamaran selama 3 bulan dan tidak mendapat balasan apapun. Setelah menggunakan LolosKerja untuk mengecek ATS Score, saya kaget karena skor CV saya hanya 42/100! Setelah saya perbaiki berdasarkan rekomendasi kata kunci dan layout hingga mencapai skor 89, dalam 2 minggu saya langsung mendapat 5 panggilan interview. Sekarang saya sudah bekerja sebagai Product Manager di startup impian saya."
              </p>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px' }}>Reza Pratama, 24 tahun</p>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Sekarang Product Manager di Jakarta</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                <Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
                "Fitur foto profesional AI-nya benar-benar di luar ekspektasi. Saya hanya upload foto selfie kasual di kamar, lalu AI merendernya dengan jas hitam formal yang sangat rapi. Hemat ratusan ribu rupiah dari menyewa foto studio profesional!"
              </p>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Dina, 22 tahun</p>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Fresh Graduate, Surabaya</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                <Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
                "ATS Analyzer yang membedakan platform ini. Begitu pasang job description, langsung ketahuan kata kunci mana yang kurang, lengkap dengan rekomendasi cara menambahkannya. Benar-benar memberikan solusi konkret, bukan sekadar memberitahu masalah."
              </p>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Fajar, 28 tahun</p>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Marketing Manager, Bandung</p>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white', gridColumn: 'span 2' }} className="md-span-1-mobile">
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                <Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" /><Star size={14} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
                "Akhirnya ada tools karir lokal yang paham konteks pasar kerja Indonesia. Cover letter yang di-generate terdengar sangat natural dan profesional, bukan terjemahan kaku dari bahasa Inggris. Sebagai HR, saya sangat menghargai format CV bersih yang dihasilkan."
              </p>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Sari, 31 tahun</p>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>HR Professional, Jakarta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="harga" style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Investasi Terkecil untuk Karir Terbaik</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>Lebih murah dari satu lembar cetak foto studio, lebih valuable dari kursus CV manapun.</p>
            
            {/* Toggle Bulanan / Tahunan */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'var(--surface-container)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              marginTop: '24px',
              border: '1px solid var(--border)'
            }}>
              <button 
                className="btn btn-sm" 
                style={{
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: billingPeriod === 'monthly' ? 'white' : 'transparent',
                  color: billingPeriod === 'monthly' ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: billingPeriod === 'monthly' ? 'var(--shadow-low)' : 'none'
                }}
                onClick={() => setBillingPeriod('monthly')}
              >
                Bulanan
              </button>
              <button 
                className="btn btn-sm" 
                style={{
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: billingPeriod === 'yearly' ? 'white' : 'transparent',
                  color: billingPeriod === 'yearly' ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: billingPeriod === 'yearly' ? 'var(--shadow-low)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => setBillingPeriod('yearly')}
              >
                Tahunan <span style={{ fontSize: '9px', backgroundColor: 'var(--success-container)', color: 'var(--on-success-container)', padding: '1px 6px', borderRadius: '4px' }}>Hemat 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'stretch' }} className="md-grid-1-mobile">
            {/* Free Plan */}
            <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Free</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '24px' }}>Untuk pencari kerja pemula yang baru memulai perjalanan karir.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800 }}>Rp 0</span>
                <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}> / selamanya</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '24px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Buat dan download 2 CV (Tanpa Watermark)</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Hanya template kategori ATS-Safe</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Maksimal 2 cover letter</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>ATS Analyzer 5x per bulan</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Foto profesional AI 3x</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>1 sesi persiapan interview / bulan</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Job application tracker unlimited</span></div>
              </div>

              <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate('/auth?mode=register')}>Mulai Gratis</button>
            </div>

            {/* Pro Plan */}
            <div className="card" style={{
              backgroundColor: 'white', 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '32px', 
              borderRadius: '20px', 
              border: '2px solid var(--primary)', 
              boxShadow: 'var(--shadow-high)',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: 'white', padding: '4px 16px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Paling Populer 🎯
              </div>

              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Pro Plan</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '24px' }}>Untuk akselerasi penuh lamaran kerja Anda dengan seluruh asisten AI.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800 }}>
                  Rp {billingPeriod === 'monthly' ? '35.000' : '28.000'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}> / bulan</span>
                {billingPeriod === 'yearly' && (
                  <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>Ditagih tahunan (Rp 336.000 / tahun)</p>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '24px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span><strong>Unlimited CV & Cover Letter</strong></span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span><strong>Akses seluruh 12 template</strong> (ATS + Modern)</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span><strong>ATS Analyzer unlimited</strong></span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span><strong>Foto Profesional AI unlimited</strong></span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span><strong>Persiapan interview unlimited + Practice Mode</strong></span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Riwayat versi CV (Version history)</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Share online link CV public</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Dukungan prioritas (Customer support)</span></div>
              </div>

              <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate('/auth?mode=register&plan=pro')}>Langganan Sekarang</button>
            </div>

            {/* Lifetime Plan */}
            <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Lifetime Access</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '24px' }}>Satu kali bayar untuk mendukung seluruh petualangan karir seumur hidup.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800 }}>Rp 349.000</span>
                <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}> / sekali bayar</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '24px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span><strong>Semua fitur Pro selamanya</strong></span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Tidak ada biaya bulanan berulang</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Akses awal (early access) fitur baru</span></div>
                <div style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> <span>Lisensi komersial CV online</span></div>
              </div>

              <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => navigate('/auth?mode=register&plan=lifetime')}>Miliki Selamanya</button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px dashed var(--success)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success-container)', color: '#047857' }}>
              ✅ Garansi Semua Plan: Download CV dalam format PDF, DOCX, & Plain Text secara GRATIS TANPA WATERMARK!
            </span>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{ padding: '80px 0', backgroundColor: 'var(--surface-0)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>Klarifikasi instan tentang cara kerja platform LolosKerja</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  padding: '20px', 
                  borderRadius: '12px', 
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => toggleFAQ(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{faq.q}</h3>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      transform: activeFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </div>
                {activeFAQ === index && (
                  <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, var(--primary-dark) 0%, #6366f1 100%)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <h2 style={{ fontSize: '36px', color: 'white', marginBottom: '16px', fontWeight: 800 }}>
            CV-mu sudah siap. Lamarkan sekarang.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', marginBottom: '32px' }}>
            Mulai buat CV ATS-friendly pertamamu gratis. Tidak perlu kartu kredit.
          </p>
          <button 
            className="btn btn-lg" 
            style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 'bold', fontSize: '16px' }}
            onClick={() => navigate('/auth?mode=register')}
          >
            Buat CV Gratis Sekarang 🎯
          </button>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>
            10.000+ pencari kerja sudah memulai · 85% dapat panggilan dalam 2 minggu
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--on-surface)', color: 'white', padding: '64px 0 32px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '48px' }} className="md-grid-1-mobile">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
              <span style={{ fontWeight: 800, fontSize: '20px', fontFamily: 'var(--font-heading)' }}>LolosKerja</span>
            </div>
            <p style={{ fontSize: '13px', color: '#c7c4d8', lineHeight: 1.6 }}>
              Karirmu dimulai dari CV yang tepat 🚀
              <br />
              Platform karir terintegrasi terlengkap untuk talenta hebat Indonesia.
            </p>
            <p style={{ fontSize: '12px', color: '#777587' }}>© 2026 LolosKerja. All rights reserved.</p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produk</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <a href="#fitur" style={{ color: '#c7c4d8' }}>CV Builder</a>
              <a href="#fitur" style={{ color: '#c7c4d8' }}>ATS Analyzer</a>
              <a href="#fitur" style={{ color: '#c7c4d8' }}>Foto Profesional AI</a>
              <a href="#fitur" style={{ color: '#c7c4d8' }}>Cover Letter Generator</a>
              <a href="#fitur" style={{ color: '#c7c4d8' }}>Job tracker</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tentang</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <a href="#" style={{ color: '#c7c4d8' }}>Tentang Kami</a>
              <a href="#" style={{ color: '#c7c4d8' }}>Blog Karir</a>
              <a href="#" style={{ color: '#c7c4d8' }}>Kontak</a>
              <a href="#" style={{ color: '#c7c4d8' }}>Karir LolosKerja</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <a href="#" style={{ color: '#c7c4d8' }}>Kebijakan Privasi</a>
              <a href="#" style={{ color: '#c7c4d8' }}>Syarat & Ketentuan</a>
              <a href="#" style={{ color: '#c7c4d8' }}>Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>

      {showDemoAlert && (
        <div className="modal-overlay" onClick={() => setShowDemoAlert(false)}>
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '32px' }}>🔒</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Simulasi Demo Interaktif</h3>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
              Ini adalah representasi demo interaktif. Silakan Daftar Akun Gratis sekarang untuk menggunakan fitur ini secara nyata di dashboard Anda!
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowDemoAlert(false)}>Tutup</button>
              <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setShowDemoAlert(false); navigate('/auth?mode=register'); }}>Daftar Sekarang</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
