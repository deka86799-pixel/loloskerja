import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Target, Mail, Camera, List, 
  ArrowRight, Award, Briefcase, Zap, Calendar 
} from 'lucide-react';
import { db } from '../utils/supabaseClient';

const MOTIVATIONAL_QUOTES = [
  "Setiap lamaran adalah satu langkah lebih dekat ke karir impianmu.",
  "Fokus pada proses, tingkatkan kualitas dokumenmu, hasil terbaik akan mengikuti.",
  "Keberhasilan berpihak pada mereka yang bersiap. Mari periksa kesiapan ATS CV-mu!",
  "Kesempatan emas menanti talenta yang tak kenal lelah berbenah diri.",
  "Impian besar tidak dibangun dalam sehari, tetapi dimulai dari langkah kecil hari ini."
];

const MOCK_TIPS = [
  "Cantumkan pencapaian berupa angka metrik (contoh: 'Menaikkan efisiensi sebesar 20%') pada CV Anda agar terlihat berdampak dan ATS-friendly.",
  "Gunakan kata kerja aksi seperti 'Memimpin', 'Mengembangkan', atau 'Merancang' di awal setiap bullet point deskripsi pengalaman Anda.",
  "Sesuaikan CV Anda untuk setiap posisi dengan memasukkan 3-5 kata kunci penting yang tercantum di deskripsi lowongan kerja.",
  "Kirimkan ucapan terima kasih (Thank-You Email) maksimal 24 jam setelah sesi wawancara selesai untuk memberikan impresi profesional."
];

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [apps, setApps] = useState([]);
  const [quote, setQuote] = useState('');
  const [tip, setTip] = useState('');

  useEffect(() => {
    // Load quote and tip
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    setTip(MOCK_TIPS[Math.floor(Math.random() * MOCK_TIPS.length)]);

    async function load() {
      const p = await db.getProfile();
      setProfile(p);

      const c = await db.getCVs();
      setCvs(c);

      const a = await db.getApplications();
      setApps(a);
    }
    load();
  }, []);

  const totalApplied = apps.filter(a => a.status !== 'wishlist').length;
  const inInterview = apps.filter(a => a.status === 'interview').length;
  const inOffer = apps.filter(a => a.status === 'offer').length;
  const responseRate = totalApplied > 0 
    ? Math.round(((inInterview + inOffer + apps.filter(a => a.status === 'accepted').length) / totalApplied) * 100) 
    : 0;

  const bestCv = cvs.reduce((prev, current) => (prev.ats_score > current.ats_score) ? prev : current, { ats_score: 0 });
  const recentCv = cvs[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      
      {/* Greeting */}
      {profile && (
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--on-surface)' }}>
            Halo, {profile.name}! 👋
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            "{quote}"
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="grid-2-mobile">
        <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>📄 CV Dibuat</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{cvs.length} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--outline)' }}>versi</span></h3>
        </div>
        <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>🎯 Skor ATS Terbaik</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>{bestCv.ats_score || 0}<span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--outline)' }}>/100</span></h3>
        </div>
        <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>📤 Total Lamaran</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{apps.length} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--outline)' }}>posisi</span></h3>
        </div>
        <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>📞 Panggilan (Response)</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
            {inInterview} <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 8px' }}>{responseRate}% rate</span>
          </h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '14px', fontWeight: 700 }}>Aksi Cepat</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
          {[
            { label: 'Buat CV Baru', desc: 'Buat CV ATS-Safe / Modern', icon: <FileText size={20} />, path: '/dashboard/cvs/new/edit', color: 'rgba(79, 70, 229, 0.08)' },
            { label: 'Cek ATS', desc: 'Analisa kata kunci lowongan', icon: <Target size={20} />, path: '/dashboard/ats-analyzer', color: 'rgba(16, 185, 129, 0.08)' },
            { label: 'Cover Letter', desc: 'Tulis surat lamaran AI', icon: <Mail size={20} />, path: '/dashboard/cover-letters', color: 'rgba(168, 85, 247, 0.08)' },
            { label: 'Foto AI', desc: 'Selfie jadi foto formal', icon: <Camera size={20} />, path: '/dashboard/foto', color: 'rgba(245, 158, 11, 0.08)' },
          ].map((act, i) => (
            <div 
              key={i} 
              className="card card-hover" 
              style={{ padding: '16px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}
              onClick={() => navigate(act.path)}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: act.color, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {act.icon}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{act.label}</h4>
                <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Section layout: Recent Activity Left, Career Tip Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }} className="md-grid-1-mobile">
        
        {/* Recent CV Activity */}
        <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Aktivitas Terakhir</h3>
          {recentCv ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'var(--surface-0)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{recentCv.title}</h4>
                  <span className="badge badge-success" style={{ fontSize: '9px', marginTop: '4px' }}>Skor ATS: {recentCv.ats_score}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/cvs/${recentCv.id}/edit`)}>Edit</button>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--outline)', fontStyle: 'italic' }}>Belum ada aktivitas CV dibuat.</p>
          )}

          {apps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--on-surface-variant)', marginTop: '8px' }}>Lamaran Terkini di Tracker:</h4>
              {apps.slice(0, 2).map((app, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12.5px' }}>
                  <span><strong>{app.company_name}</strong> - {app.position}</span>
                  <span className="badge" style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontSize: '10px' }}>{app.status}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Tip of the day */}
        <div className="card" style={{ backgroundColor: 'white', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em' }}>💡 Tip Hari Ini dari Coach</span>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
            "{tip}"
          </p>
          <button className="btn btn-ghost btn-sm" style={{ padding: 0, justifyContent: 'flex-start', color: 'var(--primary)', fontWeight: 600 }} onClick={() => navigate('/dashboard/cvs')}>
            Perbaiki CV Anda sekarang <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>

      </div>

    </div>
  );
}
