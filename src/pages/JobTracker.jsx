import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Table, Columns, Trash2, Edit2, 
  ExternalLink, Calendar, MapPin, DollarSign, FileText, 
  Check, X, AlertCircle, ChevronRight, ChevronLeft, Link as LinkIcon
} from 'lucide-react';
import { db } from '../utils/supabaseClient';

const COLUMNS = [
  { id: 'wishlist', label: '💡 Wishlist', color: '#6b7280' },
  { id: 'applied', label: '📤 Sudah Apply', color: 'var(--primary)' },
  { id: 'interview', label: '📞 Interview', color: 'var(--warning)' },
  { id: 'offer', label: '🤝 Proses Offer', color: '#a855f7' },
  { id: 'accepted', label: '✅ Diterima', color: 'var(--success)' },
  { id: 'rejected', label: '❌ Ditolak', color: 'var(--danger)' }
];

export default function JobTracker() {
  const [apps, setApps] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // kanban | list
  const [loading, setLoading] = useState(true);

  // Filter & Sort states (for List View)
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, company
  
  // Modal & Form state
  const [showModal, setShowModal] = useState(false);
  const [activeApp, setActiveApp] = useState(null); // null means adding new

  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('wishlist');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [importUrl, setImportUrl] = useState('');

  const loadData = async () => {
    try {
      const appData = await db.getApplications();
      setApps(appData);

      const cvData = await db.getCVs();
      setCvs(cvData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setActiveApp(null);
    setCompanyName('');
    setPosition('');
    setStatus('wishlist');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setSelectedCvId(cvs[0]?.id || '');
    setSalary('');
    setNotes('');
    setFollowUpDate('');
    setImportUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (app) => {
    setActiveApp(app);
    setCompanyName(app.company_name);
    setPosition(app.position);
    setStatus(app.status);
    setAppliedDate(app.applied_date);
    setSelectedCvId(app.cv_id || '');
    setSalary(app.salary || '');
    setNotes(app.notes || '');
    setFollowUpDate(app.follow_up_date || '');
    setImportUrl('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyName || !position) {
      alert('Nama perusahaan dan posisi wajib diisi.');
      return;
    }

    try {
      const payload = {
        company_name: companyName,
        position,
        status,
        applied_date: appliedDate,
        cv_id: selectedCvId || null,
        salary: salary ? parseFloat(salary) : null,
        notes,
        follow_up_date: followUpDate || null,
        id: activeApp?.id
      };
      await db.saveApplication(payload);
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus lamaran ini dari tracker?')) {
      try {
        await db.deleteApplication(id);
        setShowModal(false);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Move status quick selector (mobile friendly columns transition)
  const moveAppStatus = async (app, newStatus) => {
    try {
      await db.saveApplication({
        ...app,
        status: newStatus
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Import from Job Link Mock parser
  const handleImportUrl = () => {
    if (!importUrl) return;
    // Mock parsing some company name
    let parsedCompany = "Startup Indonesia";
    let parsedPosition = "Product Associate";
    
    if (importUrl.includes('linkedin.com')) {
      parsedCompany = "LinkedIn Network Company";
      parsedPosition = "LinkedIn Sourced PM";
    } else if (importUrl.includes('jobstreet')) {
      parsedCompany = "Jobstreet Partner Enterprise";
      parsedPosition = "Specialist Staff";
    }

    setCompanyName(parsedCompany);
    setPosition(parsedPosition);
    setStatus('applied');
    setNotes(`Diimpor otomatis dari tautan lowongan: ${importUrl}`);
    setImportUrl('');
    alert('Tautan lowongan terisi otomatis. Anda dapat menyesuaikannya sebelum menyimpan.');
  };

  // STATS calculations
  const totalApplied = apps.filter(a => a.status !== 'wishlist').length;
  const inInterview = apps.filter(a => a.status === 'interview').length;
  const inOffer = apps.filter(a => a.status === 'offer').length;
  const responseRate = totalApplied > 0 
    ? Math.round(((inInterview + inOffer + apps.filter(a => a.status === 'accepted').length) / totalApplied) * 100) 
    : 0;

  // Sorting / Filtering for list view
  const filteredApps = apps.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.applied_date) - new Date(a.applied_date);
    if (sortBy === 'company') return a.company_name.localeCompare(b.company_name);
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="md-flex-column gap-md">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>📋 Job Application Tracker</h2>
          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
            Pantau dan kelola proses lamaran pekerjaan Anda di seluruh perusahaan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* View Toggler */}
          <div style={{ display: 'flex', backgroundColor: 'var(--surface-container)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button 
              className="btn btn-sm" 
              style={{ backgroundColor: viewMode === 'kanban' ? 'white' : 'transparent', borderRadius: '6px' }}
              onClick={() => setViewMode('kanban')}
            >
              <Columns size={14} /> Kanban
            </button>
            <button 
              className="btn btn-sm" 
              style={{ backgroundColor: viewMode === 'list' ? 'white' : 'transparent', borderRadius: '6px' }}
              onClick={() => setViewMode('list')}
            >
              <Table size={14} /> List
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Tambah Lamaran
          </button>
        </div>
      </div>

      {/* STATS SUMMARY BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
        <div className="card" style={{ padding: '16px', backgroundColor: 'white' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Total Apply Bulan Ini</span>
          <h4 style={{ fontSize: '24px', marginTop: '4px' }}>{totalApplied} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--outline)' }}>posisi</span></h4>
        </div>
        <div className="card" style={{ padding: '16px', backgroundColor: 'white' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Response Rate</span>
          <h4 style={{ fontSize: '24px', marginTop: '4px', color: 'var(--primary)' }}>{responseRate}%</h4>
        </div>
        <div className="card" style={{ padding: '16px', backgroundColor: 'white' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Dalam Proses</span>
          <h4 style={{ fontSize: '24px', marginTop: '4px', color: 'var(--warning)' }}>{inInterview + inOffer} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--outline)' }}>lamaran</span></h4>
        </div>
        <div className="card" style={{ padding: '16px', backgroundColor: 'white' }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Rata Call Back</span>
          <h4 style={{ fontSize: '24px', marginTop: '4px', color: 'var(--success)' }}>5-7 <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--outline)' }}>hari</span></h4>
        </div>
      </div>

      {/* VIEW PANEL: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
          alignItems: 'start',
          overflowX: 'auto',
          paddingBottom: '20px'
        }} className="md-grid-1-mobile">
          {COLUMNS.map(col => {
            const colApps = apps.filter(a => a.status === col.id);
            return (
              <div 
                key={col.id} 
                style={{
                  backgroundColor: 'var(--surface-0)',
                  borderRadius: '16px',
                  padding: '16px 12px',
                  border: '1px solid var(--border)',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minWidth: '200px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid', borderBottomColor: col.color, paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{col.label}</span>
                  <span style={{ fontSize: '11px', backgroundColor: 'white', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '10px' }}>
                    {colApps.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {colApps.map(app => {
                    const cv = cvs.find(c => c.id === app.cv_id);
                    return (
                      <div 
                        key={app.id} 
                        className="card" 
                        style={{
                          padding: '12px', 
                          borderRadius: '12px', 
                          backgroundColor: 'white', 
                          borderLeft: '4px solid', 
                          borderLeftColor: col.color,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleOpenEdit(app)}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ fontSize: '12.5px', fontWeight: 'bold' }}>{app.company_name}</h4>
                            <span style={{ fontSize: '9px', color: 'var(--outline)' }}>{app.applied_date}</span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{app.position}</p>
                        </div>

                        {cv && (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '9.5px', color: 'var(--primary)', backgroundColor: 'rgba(79, 70, 229, 0.05)', padding: '3px 6px', borderRadius: '4px', width: 'fit-content' }}>
                            <FileText size={10} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{cv.title}</span>
                          </div>
                        )}

                        {app.follow_up_date && (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '9.5px', color: 'var(--warning)', backgroundColor: 'var(--warning-container)', padding: '3px 6px', borderRadius: '4px', width: 'fit-content' }}>
                            <Calendar size={10} />
                            <span>Remind: {app.follow_up_date}</span>
                          </div>
                        )}

                        {/* Status Mover Arrow Controls (mobile-friendly helper) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', borderTop: '1px solid var(--surface-0)', paddingTop: '6px' }} onClick={e => e.stopPropagation()}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '2px 6px', height: '20px', fontSize: '9px' }}
                            disabled={col.id === 'wishlist'}
                            onClick={() => {
                              const idx = COLUMNS.findIndex(c => c.id === col.id);
                              moveAppStatus(app, COLUMNS[idx - 1].id);
                            }}
                          >
                            <ChevronLeft size={10} /> Move Left
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '2px 6px', height: '20px', fontSize: '9px' }}
                            disabled={col.id === 'rejected'}
                            onClick={() => {
                              const idx = COLUMNS.findIndex(c => c.id === col.id);
                              moveAppStatus(app, COLUMNS[idx + 1].id);
                            }}
                          >
                            Move Right <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div style={{
                      flex: 1,
                      border: '1px dashed var(--border)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--outline)',
                      fontSize: '11px',
                      fontStyle: 'italic',
                      padding: '24px 0'
                    }}>
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW PANEL: LIST VIEW TABLE */
        <div className="card" style={{ padding: '20px', overflowX: 'auto', backgroundColor: 'white' }}>
          
          {/* Filters header bar */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }} className="md-flex-column align-stretch">
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, marginRight: '8px' }}>Filter Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '140px', height: '34px', padding: '4px 8px' }}>
                <option value="all">Semua Status</option>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, marginRight: '8px' }}>Urutkan:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '140px', height: '34px', padding: '4px 8px' }}>
                <option value="date">Tanggal Terkini</option>
                <option value="company">Nama Perusahaan</option>
              </select>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                <th style={{ padding: '12px 8px' }}>Perusahaan</th>
                <th style={{ padding: '12px 8px' }}>Posisi</th>
                <th style={{ padding: '12px 8px' }}>Tanggal Apply</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Gaji Penawaran</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const col = COLUMNS.find(c => c.id === app.status);
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleOpenEdit(app)}>
                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>{app.company_name}</td>
                    <td style={{ padding: '12px 8px' }}>{app.position}</td>
                    <td style={{ padding: '12px 8px' }}>{app.applied_date}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className="badge" style={{ backgroundColor: col.color + '20', color: col.color, fontSize: '10px' }}>{col.label}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {app.salary ? `Rp ${app.salary.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(app)}><Edit2 size={12} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(app.id)}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--outline)', fontStyle: 'italic' }}>Tidak ada data lamaran yang sesuai filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK ADD / EDIT MODAL DIALOG */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              {activeApp ? 'Edit Detail Lamaran' : 'Tambah Lamaran Baru'}
            </h3>

            {/* Job link importer widget (ONLY in Add Mode) */}
            {!activeApp && (
              <div style={{ backgroundColor: 'var(--surface-0)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LinkIcon size={12} /> Impor dari Tautan Loker LinkedIn / Jobstreet:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="https://www.linkedin.com/jobs/view/..." 
                    value={importUrl} 
                    onChange={(e) => setImportUrl(e.target.value)}
                    style={{ fontSize: '12px', height: '32px' }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleImportUrl}>Impor</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Nama Perusahaan</label>
                <input type="text" placeholder="Contoh: Tokopedia" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Posisi Pekerjaan</label>
                <input type="text" placeholder="Contoh: Associate Product Manager" value={position} onChange={(e) => setPosition(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Tanggal Apply</label>
                <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Status Saat Ini</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Tautkan dengan CV</label>
                <select value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)}>
                  <option value="">-- Pilih CV Versi --</option>
                  {cvs.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Gaji Penawaran (Opsional)</label>
                <input type="number" placeholder="Contoh: 15000000" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Tanggal Follow-up Reminder (Opsional)</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Catatan / Notes</label>
              <textarea placeholder="Tulis catatan penting, nama interviewer, link tes kognitif, dll..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: '60px' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              {activeApp && (
                <button type="button" className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }} onClick={() => handleDelete(activeApp.id)}>
                  Hapus
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Batal</button>
              <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
