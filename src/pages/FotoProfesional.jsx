import React, { useState } from 'react';
import { Camera, Upload, ArrowRight, Download, Check, RefreshCw, Grid } from 'lucide-react';
import confetti from 'canvas-confetti';

const MOCK_MALE_PORTRAITS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
];

const MOCK_FEMALE_PORTRAITS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
];

export default function FotoProfesional() {
  const [step, setStep] = useState(1); // 1: upload, 2: customize, 3: loading, 4: results
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [gender, setGender] = useState('pria'); // pria, wanita
  const [outfit, setOutfit] = useState('jas'); // kemeja, jas, blazer, batik, casual
  const [color, setColor] = useState('navy'); // hitam, navy, abu, putih, biru, coklat
  const [bg, setBg] = useState('office'); // putih, abu, biru, office, gradient
  const [lighting, setLighting] = useState('studio'); // studio, natural, professional
  const [selectedResultIdx, setSelectedResultIdx] = useState(0);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(URL.createObjectURL(file));
      setStep(2);
    }
  };

  const handleGenerate = () => {
    setStep(3);
    setTimeout(() => {
      setStep(4);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }, 2800); // realistic AI generation delay
  };

  const currentPortraits = gender === 'pria' ? MOCK_MALE_PORTRAITS : MOCK_FEMALE_PORTRAITS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>📸 Foto Profesional AI</h2>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
          Ubah selfie biasamu menjadi foto profesional siap CV dalam hitungan detik.
        </p>
      </div>

      {/* Intro Box */}
      {step === 1 && (
        <div style={{
          backgroundColor: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          padding: '20px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>✨</div>
          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--primary)' }}>
            "Ubah selfie biasamu jadi foto profesional siap CV dalam hitungan detik ✨"
          </p>
        </div>
      )}

      {/* STEP WIZARD CONTAINER */}
      <div className="card" style={{ backgroundColor: 'white', padding: '32px' }}>
        
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ color: step >= 1 ? 'var(--primary)' : 'var(--outline)' }}>Step 1: Upload Foto</span>
          <span style={{ color: 'var(--outline)' }}>➡️</span>
          <span style={{ color: step >= 2 ? 'var(--primary)' : 'var(--outline)' }}>Step 2: Kustomisasi</span>
          <span style={{ color: 'var(--outline)' }}>➡️</span>
          <span style={{ color: step >= 3 ? 'var(--primary)' : 'var(--outline)' }}>Step 3: Render AI</span>
          <span style={{ color: 'var(--outline)' }}>➡️</span>
          <span style={{ color: step >= 4 ? 'var(--primary)' : 'var(--outline)' }}>Step 4: Unduh Hasil</span>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}>
            <div style={{
              width: '100%',
              maxWidth: '380px',
              border: '2px dashed var(--border)',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--surface-0)',
              transition: 'all 0.2s'
            }} onClick={() => document.getElementById('selfie-uploader').click()}>
              <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Drag & Drop atau Klik untuk Upload</h4>
              <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Syarat foto: wajah terlihat jelas, pencahayaan cukup, format JPG/PNG</p>
              <input type="file" id="selfie-uploader" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div style={{ maxWidth: '440px', backgroundColor: 'rgba(245, 158, 11, 0.06)', borderLeft: '4px solid var(--warning)', padding: '12px 16px', borderRadius: '4px', fontSize: '12px' }}>
              <strong>💡 Tips Foto Selfie Terbaik:</strong>
              <p style={{ marginTop: '4px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                Pastikan wajahmu tegak lurus menatap kamera, foto tidak blur, pencahayaan alami cukup terfokus pada wajah, dan tidak menggunakan kacamata hitam/topi.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOMIZE */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }} className="md-grid-1-mobile">
            {/* Left original preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Foto Asli Anda</h4>
              <div style={{ width: '180px', height: '180px', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <img src={selectedPhoto} alt="Original Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Ganti Foto</button>
            </div>

            {/* Right customization form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Gender selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pilih Gender</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['pria', 'wanita'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        flex: 1,
                        backgroundColor: gender === g ? 'var(--primary)' : 'var(--surface-container)',
                        color: gender === g ? 'white' : 'var(--on-surface)'
                      }}
                      onClick={() => setGender(g)}
                    >
                      {g === 'pria' ? '🤵 Pria' : '👩 Wanita'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pakaian formal */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pilih Model Pakaian</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'kemeja', label: '👔 Kemeja Formal' },
                    { id: 'jas', label: '🤵 Jas Hitam' },
                    { id: 'blazer', label: '👩‍💼 Blazer Navy' },
                    { id: 'batik', label: '🎋 Batik Formal' },
                    { id: 'casual', label: '👕 Smart Casual' }
                  ].map(o => (
                    <button
                      key={o.id}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: outfit === o.id ? 'var(--primary)' : 'var(--surface-container)',
                        color: outfit === o.id ? 'white' : 'var(--on-surface)'
                      }}
                      onClick={() => setOutfit(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna Pakaian */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pilih Warna Pakaian</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {[
                    { id: 'black', hex: '#1f1b17', name: 'Hitam' },
                    { id: 'navy', hex: '#1e3a8a', name: 'Navy' },
                    { id: 'gray', hex: '#6b7280', name: 'Abu' },
                    { id: 'white', hex: '#ffffff', name: 'Putih' },
                    { id: 'blue', hex: '#2563eb', name: 'Biru' },
                    { id: 'brown', hex: '#78350f', name: 'Coklat' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: color === c.id ? '3px solid var(--primary)' : '1px solid var(--outline-variant)',
                        padding: 0
                      }}
                      onClick={() => setColor(c.id)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pilih Background</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'white', label: '⬜ Polos Putih' },
                    { id: 'gray', label: '🔲 Polos Abu' },
                    { id: 'blue', label: '🔷 Polos Biru' },
                    { id: 'office', label: '🌫️ Blur Kantor' },
                    { id: 'gradient', label: '📐 Gradient Pro' }
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: bg === b.id ? 'var(--primary)' : 'var(--surface-container)',
                        color: bg === b.id ? 'white' : 'var(--on-surface)'
                      }}
                      onClick={() => setBg(b.id)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pilihan Pencahayaan</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'studio', label: '💡 Studio (Formal)' },
                    { id: 'natural', label: '☀️ Natural (Warm)' },
                    { id: 'cool', label: '🏢 Professional (Cool)' }
                  ].map(l => (
                    <button
                      key={l.id}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        flex: 1,
                        backgroundColor: lighting === l.id ? 'var(--primary)' : 'var(--surface-container)',
                        color: lighting === l.id ? 'white' : 'var(--on-surface)'
                      }}
                      onClick={() => setLighting(l.id)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" style={{ height: '48px', marginTop: '16px' }} onClick={handleGenerate}>
                Buat Foto AI Sekarang <ArrowRight size={16} />
              </button>

            </div>
          </div>
        )}

        {/* STEP 3: LOADING */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', padding: '60px 0', gap: '16px' }}>
            <RefreshCw size={44} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>AI sedang memproses fotomu...</h4>
            <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Menyesuaikan pakaian jas formal, mengganti latar belakang, dan mengoreksi pencahayaan...</p>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <span className="badge badge-success" style={{ marginBottom: '8px' }}>Sukses Di-generate! ✨</span>
              <h3 style={{ fontSize: '18px' }}>Pilih Foto Profesional Terfavorit Anda</h3>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>AI merender 4 variasi pose dan sudut pandang pencahayaan.</p>
            </div>

            {/* Results Grid 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
              {currentPortraits.map((img, index) => (
                <div 
                  key={index}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: selectedResultIdx === index ? '4px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    boxShadow: selectedResultIdx === index ? 'var(--shadow-high)' : 'none'
                  }}
                  onClick={() => setSelectedResultIdx(index)}
                >
                  <img src={img} alt={`Result ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {selectedResultIdx === index && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Download/Action Panel */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              <a 
                className="btn btn-secondary" 
                href={currentPortraits[selectedResultIdx]} 
                download={`LolosKerja_FotoAI_${selectedResultIdx}.jpg`}
                target="_blank"
                rel="noreferrer"
              >
                <Download size={16} /> Download Resolusi Tinggi (800x800px)
              </a>
              <button className="btn btn-primary" onClick={() => {
                // mock apply to CV
                alert('Foto profesional berhasil dipasang sebagai foto profil utama di CV Builder!');
                navigate('/dashboard/cvs');
              }}>
                <Check size={16} /> Pakai di CV Saya
              </button>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                <RefreshCw size={14} /> Kustomisasi Ulang
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
