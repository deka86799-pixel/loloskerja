import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, CheckCircle2, XCircle, AlertCircle, 
  RefreshCw, Target, HelpCircle, ArrowRight, Play 
} from 'lucide-react';
import { db } from '../utils/supabaseClient';
import { analyzeCVATS } from '../utils/gemini';
import confetti from 'canvas-confetti';

export default function ATSAnalyzer() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('keywords'); // keywords, format, sections, prediction

  useEffect(() => {
    async function load() {
      const data = await db.getCVs();
      setCvs(data);
      if (data.length > 0) {
        setSelectedCvId(data[0].id);
      }
    }
    load();
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert('Silakan masukkan Job Description terlebih dahulu.');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      let cvContent = '';
      if (selectedCvId) {
        const activeCv = cvs.find(c => c.id === selectedCvId);
        if (activeCv) {
          cvContent = `Nama: ${activeCv.profile_info?.name || ''}\n`;
          cvContent += `Tentang saya: ${activeCv.summary || ''}\n`;
          cvContent += `Pengalaman: ${activeCv.experience?.map(e => `${e.position} di ${e.company}. ${e.description}`).join('\n')}\n`;
          cvContent += `Skills: ${activeCv.skills?.join(', ')}`;
        }
      } else {
        cvContent = "Budi Santoso. Product Manager dengan keahlian riset pengguna, wireframing, dan SQL. Berpengalaman 2 tahun memimpin pengembangan produk digital di TechCorp.";
      }

      const res = await analyzeCVATS(cvContent, jobDescription);
      setResult(res);

      if (res.score >= 80) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menganalisis CV.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>🎯 ATS Analyzer</h2>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
          Analisa kecocokan CV Anda terhadap lowongan pekerjaan secara instan.
        </p>
      </div>

      {/* Main Grid: Inputs Left, Results Right */}
      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.2fr' : '1fr', gap: '30px' }} className="md-grid-1-mobile">
        
        {/* INPUTS PANEL */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Konfigurasi Analisis
          </h3>

          {/* Select CV */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>
              Pilih CV Referensi
            </label>
            {cvs.length > 0 ? (
              <select value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)}>
                {cvs.map(c => (
                  <option key={c.id} value={c.id}>{c.title} (ATS Score: {c.ats_score})</option>
                ))}
              </select>
            ) : (
              <div 
                style={{ padding: '12px', border: '1px dashed var(--border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '12px' }}
                onClick={() => navigate('/dashboard/cvs/new/edit')}
              >
                ⚠️ Belum ada CV dibuat. Klik di sini untuk membuat CV baru.
              </div>
            )}
          </div>

          {/* Job Description Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '6px' }}>
              Tempel Deskripsi Pekerjaan (Job Description)
            </label>
            <textarea
              placeholder="Tempel kualifikasi & deskripsi pekerjaan dari lowongan LinkedIn/Jobstreet di sini..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ minHeight: '220px' }}
            />
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px' }}
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Menganalisis CV Anda...
              </>
            ) : (
              <>
                <Play size={16} /> Analisa Sekarang
              </>
            )}
          </button>
        </div>

        {/* RESULTS PANEL */}
        {result && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
              <span className="badge badge-primary">Hasil Analisis ATS</span>
            </div>

            {/* Circle Score Meter */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '24px 0',
              backgroundColor: 'var(--surface-0)',
              borderRadius: '16px'
            }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                border: '8px solid',
                borderColor: getScoreColor(result.score),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '28px',
                color: getScoreColor(result.score)
              }}>
                {result.score}%
              </div>
              <div style={{ textAlign: 'center', maxWidth: '380px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{result.compatibilityText}</h4>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
              {[
                { id: 'keywords', label: 'Tab Keywords' },
                { id: 'format', label: 'Format' },
                { id: 'sections', label: 'Seksi CV' },
                { id: 'prediction', label: 'Prediksi & Aksi' }
              ].map(t => (
                <button
                  key={t.id}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    fontWeight: activeTab === t.id ? 700 : 500,
                    borderBottom: activeTab === t.id ? '2px solid var(--primary)' : 'none',
                    color: activeTab === t.id ? 'var(--primary)' : 'var(--on-surface-variant)'
                  }}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ minHeight: '180px' }}>
              
              {/* Tab 1: Keywords */}
              {activeTab === 'keywords' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <CheckCircle2 size={14} /> Kata Kunci Ditemukan ({result.keywords?.found?.length || 0})
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {result.keywords?.found?.map((kw, i) => (
                        <span key={i} style={{ fontSize: '11px', backgroundColor: 'var(--success-container)', color: 'var(--on-success-container)', padding: '4px 10px', borderRadius: '4px', fontWeight: 500 }}>{kw}</span>
                      ))}
                      {result.keywords?.found?.length === 0 && <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--outline)' }}>Tidak ada kata kunci terdeteksi.</span>}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <XCircle size={14} /> Kata Kunci Belum Ada ({result.keywords?.missing?.length || 0})
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {result.keywords?.missing?.map((kw, i) => (
                        <span key={i} style={{ fontSize: '11px', backgroundColor: 'var(--danger-container)', color: 'var(--on-danger-container)', padding: '4px 10px', borderRadius: '4px', fontWeight: 500 }}>{kw}</span>
                      ))}
                      {result.keywords?.missing?.length === 0 && <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--outline)' }}>Luar biasa! Tidak ada kata kunci penting yang terlewat.</span>}
                    </div>
                  </div>

                  {result.keywords?.recommendation && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(79, 70, 229, 0.06)', borderLeft: '3px solid var(--primary)', borderRadius: '4px', fontSize: '12px' }}>
                      <strong>Saran Kalimat Penambahan:</strong>
                      <p style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>"{result.keywords.recommendation}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Format */}
              {activeTab === 'format' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-0)', paddingBottom: '6px' }}>
                    <span>Format File Terbaca</span>
                    <span style={{ fontWeight: 600, color: result.format?.fileTypeOk ? 'var(--success)' : 'var(--danger)' }}>
                      {result.format?.fileTypeOk ? 'Sesuai (Aman) ✅' : 'Tidak Sesuai ❌'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-0)', paddingBottom: '6px' }}>
                    <span>Jenis & Keterbacaan Font</span>
                    <span style={{ fontWeight: 600, color: result.format?.fontReadable ? 'var(--success)' : 'var(--danger)' }}>
                      {result.format?.fontReadable ? 'Terbaca Baik ✅' : 'Perlu Diperbaiki ❌'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-0)', paddingBottom: '6px' }}>
                    <span>Struktur Desain & Layout</span>
                    <span style={{ fontWeight: 600, color: result.format?.layoutOk ? 'var(--success)' : 'var(--danger)' }}>
                      {result.format?.layoutOk ? 'Satu/Dua Kolom Bersih ✅' : 'Struktur Rumit ❌'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-0)', paddingBottom: '6px' }}>
                    <span>Panjang Dokumen CV</span>
                    <span style={{ fontWeight: 600, color: result.format?.lengthOk ? 'var(--success)' : 'var(--danger)' }}>
                      {result.format?.lengthOk ? 'Optimal (1-2 Halaman) ✅' : 'Terlalu Panjang ❌'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginTop: '8px' }}>
                    {result.format?.explanation}
                  </p>
                </div>
              )}

              {/* Tab 3: Sections */}
              {activeTab === 'sections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>Bagian Kuat:</span>
                    <p style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>{result.sections?.strong?.join(', ') || 'Belum dianalisa'}</p>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--warning)' }}>Bagian Lemah / Kurang Detail:</span>
                    <p style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>{result.sections?.weak?.join(', ') || 'Tidak ada'}</p>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--surface-container)', borderRadius: '6px', fontSize: '12px' }}>
                    <strong>Saran Perbaikan:</strong> {result.sections?.recommendation}
                  </div>
                </div>
              )}

              {/* Tab 4: Prediction */}
              {activeTab === 'prediction' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Kemungkinan Lolos ATS:</span>
                    <span className="badge" style={{
                      backgroundColor: result.prediction?.status === 'Tinggi' ? 'var(--success-container)' : result.prediction?.status === 'Sedang' ? 'var(--warning-container)' : 'var(--danger-container)',
                      color: result.prediction?.status === 'Tinggi' ? 'var(--on-success-container)' : result.prediction?.status === 'Sedang' ? 'var(--on-warning-container)' : 'var(--on-danger-container)',
                    }}>
                      {result.prediction?.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                    {result.prediction?.explanation}
                  </p>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '12px', display: 'block', marginBottom: '8px' }}>📋 3 Langkah Prioritas Perbaikan:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      {result.prediction?.priorityFixes?.map((fix, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{idx + 1}.</span>
                          <span>{fix}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            <button 
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', marginTop: '10px' }}
              onClick={() => navigate(`/dashboard/cvs/${selectedCvId}/edit`)}
            >
              Perbaiki CV Sekarang <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
