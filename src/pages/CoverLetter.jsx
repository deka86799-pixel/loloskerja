import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Plus, Trash2, Edit2, Sparkles, Copy, 
  Download, ArrowLeft, Save, FileText, RefreshCw 
} from 'lucide-react';
import { db } from '../utils/supabaseClient';
import { generateCoverLetter } from '../utils/gemini';
import confetti from 'canvas-confetti';

export default function CoverLetter() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedCvId, setSelectedCvId] = useState('');
  const [tone, setTone] = useState('semi-formal'); // formal, semi-formal, conversational
  const [customNotes, setCustomNotes] = useState('');
  
  // Editor states
  const [activeLetter, setActiveLetter] = useState(null); // active letter data
  const [isEditing, setIsEditing] = useState(false); // editor mode
  const [editorContent, setEditorContent] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const loadData = async () => {
    try {
      const cvData = await db.getCVs();
      setCvs(cvData);
      if (cvData.length > 0) setSelectedCvId(cvData[0].id);

      const letterData = await db.getCoverLetters();
      setLetters(letterData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!companyName || !position) {
      alert('Nama perusahaan dan posisi harus diisi.');
      return;
    }

    setGenerating(true);
    try {
      let cvSummary = 'Budi Santoso, Product Manager berpengalaman.';
      if (selectedCvId) {
        const refCv = cvs.find(c => c.id === selectedCvId);
        if (refCv) {
          cvSummary = refCv.summary || `Budi Santoso. Keahlian: ${refCv.skills.join(', ')}`;
        }
      }

      const resContent = await generateCoverLetter({
        companyName,
        position,
        tone,
        jobDescription,
        cvSummary,
        customNotes
      });

      setEditorContent(resContent);
      setIsEditing(true);
      setActiveLetter({
        company_name: companyName,
        position: position,
        tone: tone,
        job_description: jobDescription,
        content: resContent
      });

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
      alert('Gagal membuat cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editorContent.trim() || !activeLetter) return;
    setSaving(true);
    try {
      const payload = {
        ...activeLetter,
        content: editorContent
      };
      const saved = await db.saveCoverLetter(payload);
      
      // Update list
      await loadData();
      setActiveLetter(saved);
      alert('Surat lamaran berhasil disimpan ke pustaka!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat lamaran ini?')) {
      try {
        await db.deleteCoverLetter(id);
        if (activeLetter?.id === id) {
          setActiveLetter(null);
          setIsEditing(false);
        }
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDuplicate = async (letter) => {
    try {
      const dup = {
        ...letter,
        id: `cl-${Date.now()}`,
        company_name: `${letter.company_name} (Salinan)`,
        created_at: new Date().toISOString()
      };
      await db.saveCoverLetter(dup);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    alert('Cover letter disalin ke clipboard!');
  };

  const handleDownloadPDF = () => {
    // Standard print PDF trigger
    window.print();
  };

  const handleDownloadDOCX = () => {
    const blob = new Blob([editorContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${activeLetter.company_name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLetters = letters.filter(l => 
    l.company_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    l.position.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>✉️ AI Cover Letter Writer</h2>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
          Tulis surat lamaran yang persuasif, dinamis, dan relevan dengan Job Description.
        </p>
      </div>

      {isEditing && activeLetter ? (
        /* EDITOR/VIEW PANEL */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="md-flex-column gap-md">
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
              <ArrowLeft size={16} /> Kembali ke List / Form
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}><Copy size={14} /> Salin</button>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadDOCX}><Download size={14} /> Word</button>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}><Download size={14} /> Print PDF</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan ke Library'}
              </button>
            </div>
          </div>

          <div className="grid grid-2" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '30px' }} className="md-grid-1-mobile">
            {/* Main Rich text editor */}
            <div className="card" id="printed-cl-sheet" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                Surat Lamaran - {activeLetter.position} di {activeLetter.company_name}
              </h3>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                style={{
                  minHeight: '440px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  border: 'none',
                  outline: 'none',
                  padding: 0,
                  backgroundColor: 'transparent'
                }}
              />
            </div>

            {/* Quick settings change sidebar */}
            <div className="card" style={{ height: 'fit-content' }} className="md-hide-mobile">
              <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>⚙️ Kustomisasi Ulang</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Ubah Tone Surat</label>
                  <select 
                    value={tone} 
                    onChange={(e) => {
                      setTone(e.target.value);
                    }}
                  >
                    <option value="formal">🎩 Formal (BUMN/Korporat)</option>
                    <option value="semi-formal">👔 Semi-formal (Swasta)</option>
                    <option value="conversational">💬 Conversational (Startup)</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', display: 'flex', gap: '4px' }}
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                  {generating ? 'Membuat Ulang...' : 'Generate Ulang dengan Tone Baru'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIBRARY & GENERATOR WIZARD SPLIT PANEL */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }} className="md-grid-1-mobile">
          
          {/* GENERATOR WIZARD */}
          <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }} onSubmit={handleGenerate}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} /> Buat Surat Lamaran AI
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Nama Perusahaan</label>
                <input type="text" placeholder="Contoh: Shopee Indonesia" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Posisi Lowongan</label>
                <input type="text" placeholder="Contoh: Product Manager" value={position} onChange={(e) => setPosition(e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Pilih CV Referensi</label>
              <select value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)}>
                {cvs.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Tone Surat</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'formal', label: '🎩 Formal', tip: 'Korporat/BUMN' },
                  { id: 'semi-formal', label: '👔 Semi-formal', tip: 'Swasta Menengah' },
                  { id: 'conversational', label: '💬 Casual', tip: 'Startup Kreatif' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className="btn btn-sm"
                    style={{
                      flexDirection: 'column',
                      height: '52px',
                      backgroundColor: tone === t.id ? 'var(--primary)' : 'var(--surface-container)',
                      color: tone === t.id ? 'white' : 'var(--on-surface)'
                    }}
                    onClick={() => setTone(t.id)}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.label}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>{t.tip}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Job Description (Opsional)</label>
              <textarea 
                placeholder="Tempel deskripsi kerja agar AI dapat memadukan keahlian spesifik Anda." 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ minHeight: '80px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Hal Spesifik yang Mau Ditekankan (Opsional)</label>
              <textarea 
                placeholder="Contoh: Sebutkan bahwa saya fasih berbahasa Mandarin dan memiliki sertifikat Scrum." 
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                style={{ minHeight: '60px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Menulis Surat Lamaran...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Tulis Surat Lamaran AI
                </>
              )}
            </button>
          </form>

          {/* LIBRARY / PUSTAKA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px' }}>Library Cover Letter ({filteredLetters.length})</h3>
              <input 
                type="text" 
                placeholder="Cari perusahaan/posisi..." 
                value={filterQuery} 
                onChange={(e) => setFilterQuery(e.target.value)}
                style={{ width: '160px', height: '32px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLetters.map((l) => (
                <div key={l.id} className="card card-hover" style={{ backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{l.company_name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                        {l.position} · Tone: {l.tone}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDelete(l.id)}>
                      <Trash2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={() => handleDuplicate(l)}>
                      <Copy size={14} />
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      setActiveLetter(l);
                      setEditorContent(l.content);
                      setIsEditing(true);
                    }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}

              {filteredLetters.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: '12px', backgroundColor: 'white' }}>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Belum ada surat lamaran yang dibuat.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Printing style overlay */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printed-cl-sheet, #printed-cl-sheet * {
            visibility: visible;
          }
          #printed-cl-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

    </div>
  );
}
