import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Play, RefreshCw, HelpCircle, AlertOctagon, 
  Timer, Award, ArrowRight, BookOpen, User, CheckCircle 
} from 'lucide-react';
import { generateInterviewPrep, gradeInterviewAnswer } from '../utils/gemini';
import confetti from 'canvas-confetti';

export default function InterviewPrep() {
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [level, setLevel] = useState('Fresh Graduate'); // Fresh Graduate, Mid-level, Senior, Manajerial
  const [type, setType] = useState('HR Interview'); // HR Interview, User Interview, Technical, Case Study
  
  const [generating, setGenerating] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [activeTab, setActiveTab] = useState('qa'); // qa, interviewer, tips

  // Practice Mode states
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceQIdx, setPracticeQIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Timer States
  const [timerMaxSeconds, setTimerMaxSeconds] = useState(120); // default 2 minutes (120s)
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Grading states
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);

  // Handle Prep Generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!position || !company) {
      alert('Nama posisi dan perusahaan wajib diisi.');
      return;
    }
    setGenerating(true);
    setPrepData(null);
    setIsPracticeMode(false);
    setGradeResult(null);

    try {
      const res = await generateInterviewPrep(position, company, jd, level, type);
      setPrepData(res);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan panduan interview.');
    } finally {
      setGenerating(false);
    }
  };

  // Timer Management
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      clearInterval(timerRef.current);
      alert('Waktu latihan menjawab telah habis! Silakan kirimkan jawaban Anda untuk dievaluasi.');
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timeLeft]);

  const handleStartPractice = (idx) => {
    setPracticeQIdx(idx);
    setUserAnswer('');
    setGradeResult(null);
    setTimeLeft(timerMaxSeconds);
    setTimerRunning(true);
    setIsPracticeMode(true);
  };

  const handleStopPractice = () => {
    setTimerRunning(false);
    clearInterval(timerRef.current);
    setIsPracticeMode(false);
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      alert('Ketikkan jawaban Anda terlebih dahulu sebelum dievaluasi.');
      return;
    }
    setTimerRunning(false);
    clearInterval(timerRef.current);
    setGrading(true);
    setGradeResult(null);

    try {
      const questionText = prepData.qa[practiceQIdx].question;
      const res = await gradeInterviewAnswer(questionText, userAnswer);
      setGradeResult(res);

      if (res.score >= 80) {
        confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengevaluasi jawaban.');
    } finally {
      setGrading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>🎤 Persiapan Interview AI</h2>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
          Latih kepercayaan diri dan kuasai draf jawaban interview menggunakan framework STAR.
        </p>
      </div>

      {/* Main Grid: Input Left, Results/Practice Right */}
      <div style={{ display: 'grid', gridTemplateColumns: prepData ? '1fr 1.3fr' : '1fr', gap: '30px' }} className="md-grid-1-mobile">
        
        {/* INPUT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleGenerate}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} /> Detail Sesi Interview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Posisi Pekerjaan</label>
                <input type="text" placeholder="Contoh: Product Manager" value={position} onChange={(e) => setPosition(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Nama Perusahaan</label>
                <input type="text" placeholder="Contoh: GoTo Group" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Level Pengalaman</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="Fresh Graduate">Fresh Graduate / Pemula</option>
                  <option value="Mid-level">Mid-level (1-3 tahun)</option>
                  <option value="Senior">Senior (3-5+ tahun)</option>
                  <option value="Manajerial">Manajerial / Lead</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Jenis Interview</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="HR Interview">HR Interview</option>
                  <option value="User Interview">User / Hiring Manager Interview</option>
                  <option value="Technical">Technical Interview</option>
                  <option value="Case Study">Case Study / Portfolio Presentation</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Job Description (Opsional)</label>
              <textarea 
                placeholder="Tempel Job Description di sini agar pertanyaan & jawaban yang dihasilkan 100% akurat dan relevan dengan kualifikasi perusahaan."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                style={{ minHeight: '120px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px' }} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Meramu Pertanyaan AI...
                </>
              ) : (
                <>
                  <Play size={16} /> Mulai Persiapan AI
                </>
              )}
            </button>
          </form>

          {/* Simple Tip Box */}
          <div className="card" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px dashed var(--primary)' }}>
            <h4 style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>💡 Tentang Framework STAR:</h4>
            <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
              STAR adalah cara terbaik menyusun jawaban interview perilaku (behavioral):
              <br />
              <strong>S (Situation):</strong> Konteks kejadian/latar belakang masalah.
              <br />
              <strong>T (Task):</strong> Tanggung jawab/tugas yang harus Anda selesaikan.
              <br />
              <strong>A (Action):</strong> Langkah taktis/tindakan konkret yang Anda lakukan.
              <br />
              <strong>R (Result):</strong> Hasil/dampak positif (sangat baik jika dalam persentase/angka).
            </p>
          </div>
        </div>

        {/* RESULTS PANEL & PRACTICE MODE */}
        {prepData && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* PRACTICE MODE ACTIVE */}
            {isPracticeMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <span className="badge badge-warning">Practice Mode Aktif 🎤</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600 }}>Durasi Latihan:</label>
                    <select 
                      value={timerMaxSeconds} 
                      onChange={(e) => {
                        const sec = parseInt(e.target.value);
                        setTimerMaxSeconds(sec);
                        setTimeLeft(sec);
                      }}
                      disabled={timerRunning}
                      style={{ width: '80px', height: '28px', padding: '2px 6px', fontSize: '11px' }}
                    >
                      <option value={60}>1 Menit</option>
                      <option value={120}>2 Menit</option>
                      <option value={180}>3 Menit</option>
                      <option value={300}>5 Menit</option>
                    </select>
                  </div>
                </div>

                {/* Question Area */}
                <div style={{ padding: '16px', backgroundColor: 'var(--surface-0)', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--outline)', fontWeight: 'bold' }}>Pertanyaan {practiceQIdx + 1}:</span>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, marginTop: '4px' }}>{prepData.qa[practiceQIdx]?.question}</h4>
                </div>

                {/* Timer Counter */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '20px', fontWeight: 'bold', color: timeLeft <= 15 ? 'var(--danger)' : 'var(--on-surface)' }}>
                    <Timer size={24} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                </div>

                {/* User Answer Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Ketikkan Jawaban Anda Di Sini</label>
                  <textarea
                    placeholder="Simulasikan jawaban Anda secara detail menggunakan framework STAR. Gunakan kalimat 'Saya menghadapi situasi...', 'Tugas saya...', 'Tindakan yang saya ambil...', dan 'Hasilnya adalah...'."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    style={{ minHeight: '160px' }}
                  />
                </div>

                {/* Submit Grading button */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={handleStopPractice}>Keluar Latihan</button>
                  <button className="btn btn-primary" onClick={handleEvaluate} disabled={grading || !userAnswer.trim()}>
                    {grading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Mengevaluasi...
                      </>
                    ) : (
                      <>
                        <Award size={14} /> Evaluasi Jawaban AI
                      </>
                    )}
                  </button>
                </div>

                {/* EVALUATION RESULTS */}
                {gradeResult && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--surface-0)', padding: '16px', borderRadius: '12px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        border: '5px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: 'var(--primary)'
                      }}>
                        {gradeResult.score}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>Hasil Evaluasi Jawaban</h4>
                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Skor kelayakan dan alur STAR yang disarankan.</p>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div><strong>🎯 Relevansi Jawaban:</strong> <span style={{ color: 'var(--on-surface-variant)' }}>{gradeResult.relevance}</span></div>
                      <div><strong>🧱 Struktur STAR:</strong> <span style={{ color: 'var(--on-surface-variant)' }}>{gradeResult.structure}</span></div>
                      <div><strong>📦 Kelengkapan:</strong> <span style={{ color: 'var(--on-surface-variant)' }}>{gradeResult.completeness}</span></div>
                      <div style={{ padding: '12px', backgroundColor: 'var(--warning-container)', borderLeft: '3px solid var(--warning)', borderRadius: '4px' }}>
                        <strong>💡 Saran Perbaikan Utama:</strong>
                        <p style={{ marginTop: '4px', color: 'var(--on-warning-container)' }}>{gradeResult.recommendations}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* PREP TABS LISTS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Tabs selection */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <button 
                    style={{ flex: 1, padding: '10px 4px', fontWeight: activeTab === 'qa' ? 700 : 500, borderBottom: activeTab === 'qa' ? '2px solid var(--primary)' : 'none', color: activeTab === 'qa' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setActiveTab('qa')}
                  >
                    Pertanyaan & Jawaban
                  </button>
                  <button 
                    style={{ flex: 1, padding: '10px 4px', fontWeight: activeTab === 'interviewer' ? 700 : 500, borderBottom: activeTab === 'interviewer' ? '2px solid var(--primary)' : 'none', color: activeTab === 'interviewer' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setActiveTab('interviewer')}
                  >
                    Tanya Interviewer
                  </button>
                  <button 
                    style={{ flex: 1, padding: '10px 4px', fontWeight: activeTab === 'tips' ? 700 : 500, borderBottom: activeTab === 'tips' ? '2px solid var(--primary)' : 'none', color: activeTab === 'tips' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                    onClick={() => setActiveTab('tips')}
                  >
                    Tips Spesifik
                  </button>
                </div>

                <div style={{ minHeight: '320px' }}>
                  
                  {/* TAB 1: QA List */}
                  {activeTab === 'qa' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {prepData.qa?.map((item, idx) => (
                        <div key={idx} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                            <h4 style={{ fontSize: '13.5px', fontWeight: 700 }}>{idx + 1}. {item.question}</h4>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ height: '26px', fontSize: '10px', padding: '0 8px' }}
                              onClick={() => handleStartPractice(idx)}
                            >
                              Latih 🎤
                            </button>
                          </div>
                          <div style={{ padding: '10px 14px', backgroundColor: 'var(--surface-0)', borderRadius: '8px', fontSize: '12px', borderLeft: '3px solid var(--primary)', lineHeight: 1.5 }}>
                            <strong>Contoh Jawaban (STAR):</strong>
                            <p style={{ marginTop: '4px', color: 'var(--on-surface-variant)' }}>{item.answer}</p>
                          </div>
                          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--on-surface-variant)' }}>
                            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠️ Tips: {item.tips}</span>
                            <span>🔄 Variasi: {item.variations}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: Interviewer Questions */}
                  {activeTab === 'interviewer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontStyle: 'italic', marginBottom: '8px' }}>
                        Ajukan pertanyaan cerdas ini di akhir sesi interview ketika rekruter menanyakan "Ada pertanyaan untuk kami?". Ini menunjukkan Anda antusias dan kritis.
                      </p>
                      {prepData.interviewer?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'white' }}>
                          <span className="badge badge-primary" style={{ fontSize: '9px', width: '90px', justifyContent: 'center' }}>{item.category}</span>
                          <span style={{ fontSize: '12.5px', fontWeight: 500 }}>{item.question}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: Tips Spesifik */}
                  {activeTab === 'tips' && prepData.tips && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <User size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>👔 Pakaian & Impresi:</strong>
                          <p style={{ fontSize: '11.5px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{prepData.tips.dressCode}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>🎯 Tips Sukses Jenis Interview:</strong>
                          <p style={{ fontSize: '11.5px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{prepData.tips.typeTips}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <AlertOctagon size={18} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>🚨 Red Flags yang Harus Dihindari:</strong>
                          <p style={{ fontSize: '11.5px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{prepData.tips.redFlags}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <MessageSquare size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>🤝 Strategi Follow-up:</strong>
                          <p style={{ fontSize: '11.5px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{prepData.tips.followUp}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
