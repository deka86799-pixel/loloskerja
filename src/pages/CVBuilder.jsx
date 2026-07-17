import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Sparkles, AlertCircle, 
  Check, Save, Download, Copy, RefreshCw, Layout, 
  Eye, ToggleLeft, ArrowUp, ArrowDown, ExternalLink, RefreshCw as Spinner
} from 'lucide-react';
import { db, isLocalMode } from '../utils/supabaseClient';
import { generateSummary, improveDescription, recommendSkills } from '../utils/gemini';
import confetti from 'canvas-confetti';

export default function CVBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(null); // 'summary' | 'experience-{index}' | 'skills'
  const [skillsInput, setSkillsInput] = useState('');
  const [targetSkillPosition, setTargetSkillPosition] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' (for mobile)

  // Load CV
  useEffect(() => {
    async function load() {
      try {
        if (id) {
          const data = await db.getCV(id);
          if (data) {
            setCv(data);
          } else {
            navigate('/dashboard/cvs');
          }
        } else {
          // Creating a new default CV
          const newCv = {
            title: 'CV Baru LolosKerja',
            template_name: 'ats-classic',
            profile_info: {
              photo_url: '',
              name: '',
              email: '',
              phone: '',
              linkedin: '',
              city: '',
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            certifications: [],
            achievements: [],
            languages: [],
            organizations: [],
            portfolio: [],
            ats_score: 0,
            is_published: false,
            version: 1
          };
          setCv(newCv);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  // Real-time ATS Score calculation
  const calculateATS = (cvData) => {
    if (!cvData) return { score: 0, details: [] };
    let score = 0;
    const details = [];

    // 1. Contact Info (Max 20)
    let contactPoints = 0;
    const info = cvData.profile_info;
    if (info.name) contactPoints += 4;
    if (info.email) contactPoints += 4;
    if (info.phone) contactPoints += 4;
    if (info.linkedin) contactPoints += 4;
    if (info.city) contactPoints += 4;
    score += contactPoints;
    details.push({ name: 'Informasi Kontak', score: contactPoints, max: 20, tip: contactPoints < 20 ? 'Lengkapi email, nomor WA, kota tinggal, dan LinkedIn.' : 'Informasi kontak lengkap!' });

    // 2. Summary (Max 15)
    let summaryPoints = 0;
    if (cvData.summary) {
      if (cvData.summary.length >= 150) summaryPoints = 15;
      else if (cvData.summary.length >= 50) summaryPoints = 10;
      else summaryPoints = 5;
    }
    score += summaryPoints;
    details.push({ name: 'Ringkasan Profesional', score: summaryPoints, max: 15, tip: summaryPoints < 15 ? 'Buat Tentang Saya yang lebih detail (min. 150 karakter) untuk menggambarkan value Anda.' : 'Ringkasan profesional sangat baik.' });

    // 3. Experience (Max 25)
    let expPoints = 0;
    let hasMetric = false;
    if (cvData.experience && cvData.experience.length > 0) {
      expPoints += 15; // base
      // check additional count
      if (cvData.experience.length >= 2) expPoints += 5;
      // check metrics (%, Rp, USD, orang, dll)
      const metricRegex = /[0-9]+%|[0-9]+\s*(orang|user|klien|miliar|juta|rupiah|Rp|tahun)/gi;
      const allDescriptions = cvData.experience.map(e => e.description).join(' ');
      if (metricRegex.test(allDescriptions)) {
        expPoints += 5;
        hasMetric = true;
      }
    }
    score += expPoints;
    details.push({ 
      name: 'Pengalaman Kerja', 
      score: expPoints, 
      max: 25, 
      tip: cvData.experience?.length === 0 
        ? 'Tambahkan minimal 1 pengalaman kerja.' 
        : !hasMetric 
          ? 'Tips: Tambahkan metrik angka/pencapaian terukur (contoh: meningkatkan penjualan 20%, memimpin 5 orang).' 
          : 'Pengalaman kerja ATS-friendly!' 
    });

    // 4. Education (Max 15)
    let eduPoints = 0;
    if (cvData.education && cvData.education.length > 0) {
      eduPoints = 15;
    }
    score += eduPoints;
    details.push({ name: 'Pendidikan', score: eduPoints, max: 15, tip: eduPoints === 0 ? 'Cantumkan minimal 1 riwayat pendidikan Anda.' : 'Pendidikan tercantum.' });

    // 5. Skills (Max 15)
    let skillPoints = 0;
    if (cvData.skills && cvData.skills.length > 0) {
      if (cvData.skills.length >= 8) skillPoints = 15;
      else if (cvData.skills.length >= 5) skillPoints = 10;
      else skillPoints = 5;
    }
    score += skillPoints;
    details.push({ name: 'Keahlian (Skills)', score: skillPoints, max: 15, tip: skillPoints < 15 ? 'Tambahkan minimal 8 keahlian (hard & soft skills) untuk mencocokkan kata kunci ATS.' : 'Pustaka keahlian lengkap.' });

    // 6. Extras (Certifications / Portfolio / Languages) (Max 10)
    let extraPoints = 0;
    if (cvData.certifications?.length > 0) extraPoints += 4;
    if (cvData.portfolio?.length > 0) extraPoints += 3;
    if (cvData.languages?.length > 0) extraPoints += 3;
    score += extraPoints;
    details.push({ name: 'Seksi Tambahan', score: extraPoints, max: 10, tip: extraPoints < 10 ? 'Tambahkan sertifikasi, bahasa, atau portofolio untuk poin ekstra.' : 'Seksi tambahan lengkap.' });

    return { score, details };
  };

  const calculated = calculateATS(cv);

  // Auto trigger confetti if score reaches 85 first time
  useEffect(() => {
    if (calculated.score >= 85 && cv && cv.ats_score < 85) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      });
    }
  }, [calculated.score]);

  // Update CV locally
  const updateField = (section, value) => {
    setCv(prev => ({ ...prev, [section]: value }));
  };

  const updateProfileInfo = (key, value) => {
    setCv(prev => ({
      ...prev,
      profile_info: { ...prev.profile_info, [key]: value }
    }));
  };

  const addArrayItem = (section, item) => {
    setCv(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), item]
    }));
  };

  const updateArrayItem = (section, index, key, value) => {
    setCv(prev => {
      const arr = [...(prev[section] || [])];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [section]: arr };
    });
  };

  const removeArrayItem = (section, index) => {
    setCv(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const moveArrayItem = (section, index, direction) => {
    setCv(prev => {
      const arr = [...(prev[section] || [])];
      if (direction === 'up' && index > 0) {
        const temp = arr[index];
        arr[index] = arr[index - 1];
        arr[index - 1] = temp;
      } else if (direction === 'down' && index < arr.length - 1) {
        const temp = arr[index];
        arr[index] = arr[index + 1];
        arr[index + 1] = temp;
      }
      return { ...prev, [section]: arr };
    });
  };

  // Skill Add helper
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (skillsInput.trim() && !cv.skills.includes(skillsInput.trim())) {
        updateField('skills', [...cv.skills, skillsInput.trim()]);
        setSkillsInput('');
      }
    }
  };

  const handleRemoveSkill = (index) => {
    updateField('skills', cv.skills.filter((_, i) => i !== index));
  };

  // AI Helpers calling gemini.js
  const handleAISummary = async () => {
    setAiLoading('summary');
    try {
      const expText = cv.experience.map(e => `${e.position} di ${e.company}`).join(', ');
      const res = await generateSummary(expText, cv.skills);
      updateField('summary', res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIExperience = async (index) => {
    setAiLoading(`experience-${index}`);
    try {
      const desc = cv.experience[index].description;
      if (!desc) return;
      const res = await improveDescription(desc);
      updateArrayItem('experience', index, 'description', res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAISkills = async () => {
    if (!targetSkillPosition) return;
    setAiLoading('skills');
    try {
      const skills = await recommendSkills(targetSkillPosition);
      updateField('skills', Array.from(new Set([...cv.skills, ...skills])));
      setTargetSkillPosition('');
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(null);
    }
  };

  // Save CV to DB/Local
  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await db.saveCV({
        ...cv,
        ats_score: calculated.score
      });
      setCv(saved);
      // alert success
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 } });
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan CV.');
    } finally {
      setSaving(false);
    }
  };

  // EXPORTS
  const handlePrint = () => {
    window.print();
  };

  const handleCopyPlainText = () => {
    const info = cv.profile_info;
    let plainText = `${info.name || ''}\n${info.email || ''} | ${info.phone || ''} | ${info.linkedin || ''} | ${info.city || ''}\n\n`;
    plainText += `TENTANG SAYA\n${cv.summary || ''}\n\n`;
    
    plainText += `PENGALAMAN KERJA\n`;
    cv.experience.forEach(e => {
      plainText += `${e.position} - ${e.company} (${e.duration})\n${e.description}\n\n`;
    });

    plainText += `PENDIDIKAN\n`;
    cv.education.forEach(e => {
      plainText += `${e.degree} - ${e.school} (${e.duration})\n${e.description || ''}\n\n`;
    });

    plainText += `KEAHLIAN\n${cv.skills.join(', ')}\n\n`;
    
    navigator.clipboard.writeText(plainText);
    alert('Plain text berhasil disalin ke clipboard!');
  };

  const handleDownloadDOCX = () => {
    // Generate a mock DOCX download (a markdown-styled rich text file named .doc)
    const info = cv.profile_info;
    let content = `LolosKerja - Exported CV\n=======================\n\n`;
    content += `NAMA: ${info.name || ''}\n`;
    content += `Email: ${info.email || ''}\nWA: ${info.phone || ''}\nLinkedIn: ${info.linkedin || ''}\nKota: ${info.city || ''}\n\n`;
    content += `RINGKASAN OPERASIONAL\n---------------------\n${cv.summary || ''}\n\n`;
    
    content += `PENGALAMAN KERJA\n----------------\n`;
    cv.experience.forEach(e => {
      content += `• ${e.position} di ${e.company} (${e.duration})\n${e.description}\n\n`;
    });

    content += `PENDIDIKAN\n----------\n`;
    cv.education.forEach(e => {
      content += `• ${e.degree} di ${e.school} (${e.duration})\n${e.description || ''}\n\n`;
    });

    content += `KEAHLIAN\n--------\n${cv.skills.join(', ')}\n`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(info.name || 'CV').replace(/\s+/g, '_')}_LolosKerja.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Spinner size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p>Memuat CV Editor...</p>
      </div>
    );
  }

  // Choose template classes
  const templateStyle = cv.template_name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="md-flex-column gap-md">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/cvs')}>
            <ArrowLeft size={16} /> Kembali
          </button>
          <input 
            type="text" 
            value={cv.title} 
            onChange={(e) => updateField('title', e.target.value)} 
            style={{ fontWeight: 'bold', fontSize: '18px', border: 'none', background: 'transparent', padding: '4px', width: '220px' }}
          />
        </div>

        {/* Desktop Controls */}
        <div style={{ display: 'flex', gap: '10px' }} className="md-hide-mobile">
          <button className="btn btn-secondary" onClick={handleCopyPlainText}>
            <Copy size={16} /> Plain Text
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadDOCX}>
            <Download size={16} /> Word (.DOC)
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Eye size={16} /> Cetak / Save PDF
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Mobile Tab toggler */}
      <div style={{ display: 'none', width: '100%', borderBottom: '1px solid var(--border)' }} className="md-flex-mobile">
        <button 
          style={{ flex: 1, padding: '12px', fontWeight: activeTab === 'edit' ? 700 : 500, color: activeTab === 'edit' ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: activeTab === 'edit' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('edit')}
        >
          Editor
        </button>
        <button 
          style={{ flex: 1, padding: '12px', fontWeight: activeTab === 'preview' ? 700 : 500, color: activeTab === 'preview' ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: activeTab === 'preview' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('preview')}
        >
          Preview & Export ({calculated.score} Score)
        </button>
      </div>

      {/* Editor Main Content Split Screen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }} className="md-grid-1-mobile">
        
        {/* LEFT PANEL: EDITOR */}
        <div style={{ display: activeTab === 'edit' ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }} className="md-flex-desktop">
          
          {/* Template Selector card */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layout size={18} /> Pilih Template CV
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>✅ ATS-Friendly (Cocok untuk BUMN & Korporasi)</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ats-classic', label: 'ATS Classic' },
                    { id: 'ats-minimal', label: 'ATS Minimal' },
                    { id: 'ats-elegant', label: 'ATS Elegant' },
                    { id: 'ats-compact', label: 'ATS Compact' },
                    { id: 'ats-professional', label: 'ATS Executive' },
                    { id: 'ats-academic', label: 'ATS Academic' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: cv.template_name === t.id ? 'var(--primary)' : 'var(--surface-container)',
                        color: cv.template_name === t.id ? 'white' : 'var(--on-surface)'
                      }}
                      onClick={() => updateField('template_name', t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px' }}>⚡ Modern Visual (Cek ATS Score dulu - Cocok untuk Tech & Startup)</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'modern-creative', label: 'Creative Accent' },
                    { id: 'modern-startup', label: 'Startup Sidebar' },
                    { id: 'modern-designer', label: 'Teal Minimalist' },
                    { id: 'modern-executive', label: 'Modern Double' },
                    { id: 'modern-portfolio', label: 'Portfolio Focus' },
                    { id: 'modern-minimal-color', label: 'Warm Sand' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: cv.template_name === t.id ? 'var(--warning)' : 'var(--surface-container)',
                        color: cv.template_name === t.id ? 'white' : 'var(--on-surface)'
                      }}
                      onClick={() => updateField('template_name', t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Informasi Kontak */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>👤 Informasi Kontak</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Nama Lengkap</label>
                <input 
                  type="text" 
                  value={cv.profile_info.name || ''} 
                  onChange={(e) => updateProfileInfo('name', e.target.value)} 
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Email</label>
                <input 
                  type="email" 
                  value={cv.profile_info.email || ''} 
                  onChange={(e) => updateProfileInfo('email', e.target.value)} 
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Nomor WA</label>
                <input 
                  type="text" 
                  value={cv.profile_info.phone || ''} 
                  onChange={(e) => updateProfileInfo('phone', e.target.value)} 
                  placeholder="081234567..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>LinkedIn URL</label>
                <input 
                  type="text" 
                  value={cv.profile_info.linkedin || ''} 
                  onChange={(e) => updateProfileInfo('linkedin', e.target.value)} 
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }} className="md-span-1-mobile">
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Kota & Provinsi</label>
                <input 
                  type="text" 
                  value={cv.profile_info.city || ''} 
                  onChange={(e) => updateProfileInfo('city', e.target.value)} 
                  placeholder="Jakarta Selatan, DKI Jakarta"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ringkasan Profesional */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>✍️ Ringkasan Profesional / Tentang Saya</h3>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleAISummary}
                disabled={aiLoading === 'summary'}
              >
                <Sparkles size={12} /> {aiLoading === 'summary' ? 'Menulis...' : 'Tulis Summary dengan AI'}
              </button>
            </div>
            <textarea 
              value={cv.summary || ''} 
              onChange={(e) => updateField('summary', e.target.value)} 
              placeholder="Tulis ringkasan singkat karir Anda, atau klik tombol AI untuk membuat draf instan berdasarkan pengalaman & keahlian Anda."
              style={{ minHeight: '120px' }}
            />
          </div>

          {/* Section 3: Pengalaman Kerja */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>💼 Pengalaman Kerja</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => addArrayItem('experience', { company: '', position: '', duration: '', description: '' })}
              >
                <Plus size={14} /> Tambah Kerja
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cv.experience?.map((exp, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  
                  {/* Reorder and Delete Controls */}
                  <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }} onClick={() => moveArrayItem('experience', idx, 'up')} disabled={idx === 0}><ArrowUp size={14} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }} onClick={() => moveArrayItem('experience', idx, 'down')} disabled={idx === cv.experience.length - 1}><ArrowDown size={14} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => removeArrayItem('experience', idx)}><Trash2 size={14} /></button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }} className="grid-2-mobile">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Nama Perusahaan</label>
                      <input 
                        type="text" 
                        value={exp.company} 
                        onChange={(e) => updateArrayItem('experience', idx, 'company', e.target.value)} 
                        placeholder="Contoh: Shopee Indonesia" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Posisi / Jabatan</label>
                      <input 
                        type="text" 
                        value={exp.position} 
                        onChange={(e) => updateArrayItem('experience', idx, 'position', e.target.value)} 
                        placeholder="Contoh: Product Associate" 
                      />
                    </div>
                    <div className="md-span-1-mobile">
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Durasi (Tahun)</label>
                      <input 
                        type="text" 
                        value={exp.duration} 
                        onChange={(e) => updateArrayItem('experience', idx, 'duration', e.target.value)} 
                        placeholder="Contoh: 2023 - Sekarang" 
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)' }}>Tanggung Jawab & Pencapaian</label>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ color: 'var(--primary)', height: '26px', fontSize: '11px', padding: '0 8px' }}
                        onClick={() => handleAIExperience(idx)}
                        disabled={aiLoading === `experience-${idx}`}
                      >
                        <Sparkles size={11} /> {aiLoading === `experience-${idx}` ? 'Mengubah...' : 'Optimalkan Deskripsi Kerja (AI)'}
                      </button>
                    </div>
                    <textarea 
                      value={exp.description} 
                      onChange={(e) => updateArrayItem('experience', idx, 'description', e.target.value)} 
                      placeholder="Masukkan deskripsi pekerjaan. Gunakan bullet points ( • ) untuk mempermudah parser ATS membaca pencapaian Anda."
                      style={{ minHeight: '80px' }}
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Pendidikan */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>🎓 Pendidikan</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => addArrayItem('education', { school: '', degree: '', duration: '', description: '' })}
              >
                <Plus size={14} /> Tambah Pendidikan
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cv.education?.map((edu, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignSelf: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => removeArrayItem('education', idx)}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '12px' }} className="grid-2-mobile">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Institusi / Sekolah</label>
                      <input 
                        type="text" 
                        value={edu.school} 
                        onChange={(e) => updateArrayItem('education', idx, 'school', e.target.value)} 
                        placeholder="Contoh: Universitas Indonesia" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Gelar & Jurusan</label>
                      <input 
                        type="text" 
                        value={edu.degree} 
                        onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)} 
                        placeholder="Contoh: S1 Teknik Informatika" 
                      />
                    </div>
                    <div className="md-span-1-mobile">
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Tahun Kelulusan</label>
                      <input 
                        type="text" 
                        value={edu.duration} 
                        onChange={(e) => updateArrayItem('education', idx, 'duration', e.target.value)} 
                        placeholder="Contoh: 2018 - 2022" 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>IPK / Deskripsi Tambahan (Opsional)</label>
                    <input 
                      type="text" 
                      value={edu.description} 
                      onChange={(e) => updateArrayItem('education', idx, 'description', e.target.value)} 
                      placeholder="Contoh: IPK 3.82. Aktif di BEM Fakultas." 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Keahlian (Skills) */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🛠️ Keahlian / Skills</h3>
            
            {/* AI Skills Recommender */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', backgroundColor: 'var(--surface-0)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', alignItems: 'center' }} className="md-flex-column align-stretch">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> AI Skill Suggest:
              </span>
              <input 
                type="text" 
                placeholder="Masukkan posisi (e.g. Product Manager)" 
                value={targetSkillPosition} 
                onChange={(e) => setTargetSkillPosition(e.target.value)}
                style={{ height: '32px', fontSize: '12px', flex: 1 }}
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleAISkills}
                disabled={aiLoading === 'skills' || !targetSkillPosition}
              >
                {aiLoading === 'skills' ? 'Menambah...' : 'Masukkan Rekomendasi'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder="Tambah keahlian manual lalu tekan Enter" 
                value={skillsInput} 
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
              <button className="btn btn-secondary" onClick={handleAddSkill} style={{ height: '42px' }}>Tambah</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cv.skills?.map((skill, index) => (
                <span 
                  key={index} 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: 'var(--primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(index)} style={{ color: 'var(--primary)', padding: 0 }}>&times;</button>
                </span>
              ))}
              {cv.skills?.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Belum ada keahlian yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* Section 6: Sertifikasi */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>📜 Sertifikasi & Lisensi</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '' })}
              >
                <Plus size={14} /> Tambah Sertifikat
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cv.certifications?.map((cert, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 40px', gap: '12px', alignItems: 'center' }}>
                  <input type="text" placeholder="Nama Sertifikasi" value={cert.name} onChange={(e) => updateArrayItem('certifications', idx, 'name', e.target.value)} />
                  <input type="text" placeholder="Penerbit" value={cert.issuer} onChange={(e) => updateArrayItem('certifications', idx, 'issuer', e.target.value)} />
                  <input type="text" placeholder="Tahun" value={cert.year} onChange={(e) => updateArrayItem('certifications', idx, 'year', e.target.value)} />
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => removeArrayItem('certifications', idx)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Portofolio & Link */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>🌐 Portofolio & Link Pendukung</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => addArrayItem('portfolio', { name: '', url: '' })}
              >
                <Plus size={14} /> Tambah Link
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cv.portfolio?.map((link, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 40px', gap: '12px', alignItems: 'center' }}>
                  <input type="text" placeholder="Contoh: Portofolio Figma" value={link.name} onChange={(e) => updateArrayItem('portfolio', idx, 'name', e.target.value)} />
                  <input type="text" placeholder="URL (e.g. behance.net/...)" value={link.url} onChange={(e) => updateArrayItem('portfolio', idx, 'url', e.target.value)} />
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => removeArrayItem('portfolio', idx)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: LIVE PREVIEW & ATS SCORE */}
        <div style={{ display: activeTab === 'preview' ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }} className="md-flex-desktop">
          
          {/* ATS Score Meter Card */}
          <div className="card" style={{
            position: 'sticky',
            top: '20px',
            zIndex: 10
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🎯 ATS Score Meter</h3>
            
            {/* Circular score view */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                border: '6px solid',
                borderColor: calculated.score >= 80 ? 'var(--success)' : calculated.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '22px',
                color: calculated.score >= 80 ? 'var(--success)' : calculated.score >= 50 ? 'var(--warning)' : 'var(--danger)'
              }}>
                {calculated.score}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>
                  {calculated.score >= 80 ? 'Sangat Baik (ATS-Ready) ✅' : calculated.score >= 55 ? 'Cukup Baik (Perlu Optimalisasi) ⚠️' : 'Kurang Optimal (Lengkapi Data) ❌'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Skor Anda dihitung berdasarkan kelengkapan resume, metrik pencapaian, dan kecocokan parser.
                </p>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              {calculated.details.map((det) => (
                <div key={det.name} style={{ borderBottom: '1px solid var(--surface-0)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>{det.name}</span>
                    <span>{det.score} / {det.max}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>{det.tip}</p>
                </div>
              ))}
            </div>

            {/* Mobile Actions in preview mode */}
            <div style={{ display: 'none', flexDirection: 'column', gap: '8px', marginTop: '16px' }} className="md-flex-mobile">
              <button className="btn btn-secondary btn-sm" onClick={handleCopyPlainText}><Copy size={14} /> Copy Plain Text</button>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadDOCX}><Download size={14} /> Download DOCX Word</button>
              <button className="btn btn-primary btn-sm" onClick={handlePrint}><Eye size={14} /> Print / Save PDF</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><Save size={14} /> Simpan CV</button>
            </div>
          </div>

          {/* CV Live Document Preview Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-high)', border: '1px solid var(--border)' }}>
            
            <div style={{ backgroundColor: '#eae1da', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>CV Real-time Preview (A4-Style)</span>
              <span className="badge badge-success" style={{ fontSize: '9px' }}>{templateStyle}</span>
            </div>

            {/* Simulated Printed CV Sheet */}
            <div id="printed-cv-sheet" className={`printed-cv ${templateStyle}`} style={{
              padding: '40px',
              backgroundColor: 'white',
              color: '#1f1b17',
              minHeight: '840px',
              fontFamily: templateStyle.startsWith('ats-') ? 'var(--font-body)' : 'var(--font-heading)',
              fontSize: '12px',
              lineHeight: 1.5
            }}>
              
              {/* Profile/Contact info */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  {cv.profile_info.name || 'NAMA LENGKAP'}
                </h2>
                <p style={{ fontSize: '11px', color: '#464555', margin: 0 }}>
                  {cv.profile_info.email || 'email@domain.com'} | {cv.profile_info.phone || '08123456...'} | {cv.profile_info.linkedin || 'linkedin.com/...'} | {cv.profile_info.city || 'Kota, Provinsi'}
                </p>
              </div>

              {/* Summary */}
              {cv.summary && (
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #1f1b17', paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    RINGKASAN PROFESIONAL
                  </h3>
                  <p style={{ margin: 0, textAlign: 'justify', fontSize: '11px' }}>{cv.summary}</p>
                </div>
              )}

              {/* Experience */}
              {cv.experience?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #1f1b17', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase' }}>
                    PENGALAMAN KERJA
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cv.experience.map((exp, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                          <span>{exp.position || 'Posisi/Jabatan'}</span>
                          <span>{exp.duration || 'Tahun'}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', fontSize: '10.5px', color: '#464555', marginBottom: '4px' }}>
                          {exp.company || 'Nama Perusahaan'}
                        </div>
                        <p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: '10.5px', textAlign: 'justify' }}>
                          {exp.description || 'Deskripsi pekerjaan'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {cv.education?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #1f1b17', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase' }}>
                    PENDIDIKAN
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cv.education.map((edu, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                          <span>{edu.degree || 'Gelar & Jurusan'}</span>
                          <span>{edu.duration || 'Tahun'}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', fontSize: '10.5px', color: '#464555' }}>
                          {edu.school || 'Institusi'}
                        </div>
                        {edu.description && <p style={{ margin: '2px 0 0 0', fontSize: '10px' }}>{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {cv.skills?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #1f1b17', paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    KEAHLIAN / SKILLS
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '500' }}>
                    {cv.skills.join('  •  ')}
                  </p>
                </div>
              )}

              {/* Certifications */}
              {cv.certifications?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #1f1b17', paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    SERTIFIKASI & LISENSI
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {cv.certifications.map((cert, idx) => (
                      <div key={idx} style={{ fontSize: '11px' }}>
                        <strong>{cert.name}</strong> - {cert.issuer} ({cert.year})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Links */}
              {cv.portfolio?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #1f1b17', paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    PORTFOLIO & TAUTAN
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {cv.portfolio.map((link, idx) => (
                      <div key={idx} style={{ fontSize: '11px' }}>
                        <strong>{link.name}:</strong> <span style={{ color: 'var(--primary)' }}>{link.url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* CSS For Printing & Template Customizer */}
      <style>{`
        @media print {
          /* Hide layout containers */
          body * {
            visibility: hidden;
          }
          #printed-cv-sheet, #printed-cv-sheet * {
            visibility: visible;
          }
          #printed-cv-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }

        /* CV Theme Custom Styles */
        .printed-cv.ats-minimal {
          font-family: 'Inter', sans-serif !important;
          line-height: 1.4;
        }
        .printed-cv.ats-minimal h3 {
          border-bottom: none !important;
          font-weight: 800;
          color: #374151;
        }

        .printed-cv.ats-elegant {
          font-family: 'DM Sans', serif !important;
        }
        .printed-cv.ats-elegant h3 {
          border-bottom: 2px solid #3525cd !important;
          color: #3525cd;
        }

        .printed-cv.modern-creative {
          border-left: 8px solid var(--primary);
        }
        .printed-cv.modern-creative h3 {
          color: var(--primary);
          border-bottom: 1px dashed var(--primary) !important;
        }

        .printed-cv.modern-startup {
          border-top: 10px solid var(--primary);
        }
        .printed-cv.modern-startup h2 {
          color: var(--primary);
        }
        
        .printed-cv.modern-designer h3 {
          border-bottom: 2px solid #14b8a6 !important;
          color: #0f766e;
        }
      `}</style>

    </div>
  );
}
