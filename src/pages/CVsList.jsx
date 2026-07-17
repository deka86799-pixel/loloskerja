import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Copy, Trash2, ExternalLink, Download, FileText, Layout } from 'lucide-react';
import { db } from '../utils/supabaseClient';
import confetti from 'canvas-confetti';

export default function CVsList() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, ats, modern
  const [loading, setLoading] = useState(true);

  const loadCVs = async () => {
    try {
      const data = await db.getCVs();
      setCvs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCVs();
  }, []);

  const handleCreateNew = () => {
    navigate('/dashboard/cvs/new/edit');
  };

  const handleDuplicate = async (cv) => {
    try {
      const dup = {
        ...cv,
        id: `cv-${Date.now()}`,
        title: `${cv.title} (Salinan)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.saveCV(dup);
      loadCVs();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus CV ini?')) {
      try {
        await db.deleteCV(id);
        loadCVs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredCvs = cvs.filter(cv => {
    if (filter === 'all') return true;
    if (filter === 'ats') return cv.template_name.startsWith('ats-');
    if (filter === 'modern') return cv.template_name.startsWith('modern-');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="md-flex-column gap-md">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>📄 CV Saya</h2>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>Kelola seluruh versi dokumen CV lamaran kerja Anda.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> Buat CV Baru
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        {[
          { id: 'all', label: 'Semua CV' },
          { id: 'ats', label: '✅ ATS-Safe' },
          { id: 'modern', label: '⚡ Modern Visual' }
        ].map(t => (
          <button
            key={t.id}
            className="btn btn-ghost btn-sm"
            style={{
              backgroundColor: filter === t.id ? 'var(--surface-container)' : 'transparent',
              color: filter === t.id ? 'var(--primary)' : 'var(--on-surface-variant)',
              fontWeight: filter === t.id ? 600 : 400
            }}
            onClick={() => setFilter(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse" style={{ height: '180px', backgroundColor: '#eae1da' }}></div>
          ))}
        </div>
      ) : (
        <>
          {/* CVs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="grid-2-mobile">
            {filteredCvs.map((cv) => {
              const isAts = cv.template_name.startsWith('ats-');
              return (
                <div key={cv.id} className="card card-hover" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'white',
                  borderLeft: `4px solid ${isAts ? 'var(--success)' : 'var(--warning)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{cv.title}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                        Template: {cv.template_name}
                      </p>
                    </div>
                    <span className={`badge ${cv.ats_score >= 80 ? 'badge-success' : cv.ats_score >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                      ATS: {cv.ats_score}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                    <FileText size={14} />
                    <span>{cv.experience?.length || 0} Pengalaman · {cv.skills?.length || 0} Skills</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginTop: 'auto' }} />

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => handleDelete(cv.id)} title="Hapus">
                      <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => handleDuplicate(cv)} title="Duplikat">
                      <Copy size={14} />
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/dashboard/cvs/${cv.id}/edit`)}>
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCvs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: '16px', backgroundColor: 'white' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Belum ada CV</h3>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '4px', maxWidth: '380px', margin: '4px auto 16px auto' }}>
                Ayo buat CV ATS-friendly pertamamu sekarang untuk memperbesar peluang dilirik HR perusahaan impian.
              </p>
              <button className="btn btn-primary" onClick={handleCreateNew}>Buat CV Sekarang</button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
