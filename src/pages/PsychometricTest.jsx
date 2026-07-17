import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, Play, HelpCircle, Brain, RefreshCw, Timer, 
  CheckCircle2, AlertTriangle, BookOpen, ChevronRight, ChevronLeft,
  ArrowRight, ShieldCheck, Heart, Sparkles, History
} from 'lucide-react';
import { db } from '../utils/supabaseClient';
import { generatePsychometricReport } from '../utils/gemini';
import confetti from 'canvas-confetti';

const QUESTIONS = [
  {
    question: "Kertas : Pena = Dinding : ...?",
    options: ["Rumah", "Cat", "Kuas", "Semen"],
    correctIdx: 2, // Kuas
    category: "Analogi Verbal"
  },
  {
    question: "Deret angka: 2, 4, 8, 16, ... Angka berikutnya adalah:",
    options: ["20", "24", "32", "64"],
    correctIdx: 2, // 32
    category: "Deret Numerik"
  },
  {
    question: "Jika 3 kucing menangkap 3 tikus dalam 3 menit, maka 10 kucing menangkap 10 tikus dalam ... menit.",
    options: ["10 menit", "3 menit", "30 menit", "1 menit"],
    correctIdx: 1, // 3 menit
    category: "Logika Matematika"
  },
  {
    question: "Sendok : Makan = Pisau : ...?",
    options: ["Tajam", "Dapur", "Memotong", "Besi"],
    correctIdx: 2, // Memotong
    category: "Analogi Verbal"
  },
  {
    question: "Deret huruf: A, C, E, G, ... Huruf berikutnya adalah:",
    options: ["H", "I", "J", "K"],
    correctIdx: 1, // I
    category: "Deret Huruf"
  },
  {
    question: "Semua manusia fana. Socrates adalah manusia. Maka:",
    options: ["Socrates tidak fana", "Socrates fana", "Manusia adalah Socrates", "Socrates abadi"],
    correctIdx: 1, // Socrates fana
    category: "Logika Analitis"
  },
  {
    question: "Tentukan nilai X pada pola deret berikut: 3, 6, X, 24, 48.",
    options: ["10", "12", "15", "18"],
    correctIdx: 1, // 12
    category: "Deret Numerik"
  },
  {
    question: "Manakah kata yang merupakan lawan kata dari 'Apatis'?",
    options: ["Acuh", "Peduli", "Dingin", "Pasif"],
    correctIdx: 1, // Peduli
    category: "Verbal Antonim"
  },
  {
    question: "Jika seekor semut berjalan ke arah barat laut, kemudian berputar balik 180 derajat, ke arah manakah ia sekarang berjalan?",
    options: ["Tenggara", "Timur Laut", "Barat Daya", "Selatan"],
    correctIdx: 0, // Tenggara
    category: "Penalaran Spasial"
  },
  {
    question: "Sebuah toko baju memberi diskon 20%. Budi membeli baju seharga Rp 100.000 sebelum diskon. Berapa yang harus dibayar Budi?",
    options: ["Rp 20.000", "Rp 80.000", "Rp 90.000", "Rp 120.000"],
    correctIdx: 1, // Rp 80.000
    category: "Aritmatika Sosial"
  }
];

export default function PsychometricTest() {
  const [step, setStep] = useState('intro'); // 'intro', 'test', 'loading', 'result'
  const [history, setHistory] = useState([]);
  
  // Test-taking states
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // idx: optionIdx
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Result display states
  const [currentResult, setCurrentResult] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState('report'); // 'report', 'review'

  // Load history
  const loadHistory = async () => {
    try {
      const list = await db.getPsychometricTests();
      setHistory(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Timer hook
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      handleSubmitTest();
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  const handleStartTest = () => {
    setSelectedAnswers({});
    setCurrentQ(0);
    setTimeLeft(600);
    setStep('test');
    setIsTimerRunning(true);
  };

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
    setStep('loading');

    // Calculate score
    let correctCount = 0;
    QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIdx) {
        correctCount += 1;
      }
    });

    const score = correctCount * 10;
    const iqEstimate = Math.round(score * 0.5 + 80); // IQ formula: 80 - 130
    const wrongCount = QUESTIONS.length - correctCount;

    try {
      // Get AI interpretation
      const report = await generatePsychometricReport(score, iqEstimate, correctCount, wrongCount);
      
      const newTest = {
        score,
        iq_estimate: iqEstimate,
        answers: selectedAnswers,
        ai_report: report
      };

      // Save to database
      const saved = await db.savePsychometricTest(newTest);
      setCurrentResult(saved);
      
      // Upgrade history
      await loadHistory();
      
      setStep('result');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
      alert('Gagal mengevaluasi tes.');
      setStep('intro');
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
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>🧠 Tes Kognitif & Psikotes AI</h2>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
          Uji logika analitis, deret angka, kemampuan spasial, dan analogi verbal terstandardisasi seleksi kerja.
        </p>
      </div>

      {/* STEP 1: INTRO / DASHBOARD */}
      {step === 'intro' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }} className="md-grid-1-mobile">
          
          {/* Rules & Start Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Siap untuk Mengukur Potensi Anda?</h3>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Tes ini mencakup 5 area kognitif utama rekrutmen perusahaan.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>
              <div><strong>⏱️ Batasan Waktu:</strong> 10 menit untuk menyelesaikan seluruh soal.</div>
              <div><strong>❓ Jumlah Soal:</strong> 10 Pertanyaan Pilihan Ganda (Analogi, Spasial, Deret, Aritmatika).</div>
              <div><strong>🤖 Laporan Karir AI:</strong> Gemini AI akan menganalisis kecerdasan dominan Anda setelah tes selesai.</div>
            </div>

            <button className="btn btn-primary" style={{ height: '48px', marginTop: '10px' }} onClick={handleStartTest}>
              <Play size={16} /> Mulai Tes Sekarang
            </button>

            <div style={{ fontSize: '11px', color: 'var(--outline)', textAlign: 'center' }}>
              🔒 Hasil tes bersifat pribadi dan hanya dapat diakses oleh Anda di akun LolosKerja.
            </div>
          </div>

          {/* Test History List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} /> Riwayat Tes Anda
            </h3>
            
            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                {history.map((t, idx) => (
                  <div 
                    key={t.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 14px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px', 
                      backgroundColor: 'var(--surface-0)',
                      cursor: 'pointer' 
                    }}
                    onClick={() => {
                      setCurrentResult(t);
                      setStep('result');
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>Tes #{history.length - idx}</h4>
                      <p style={{ fontSize: '10.5px', color: 'var(--outline)', marginTop: '2px' }}>
                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>IQ {t.iq_estimate}</div>
                      <span className="badge badge-success" style={{ fontSize: '9px', marginTop: '2px' }}>Skor: {t.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px 0', color: 'var(--outline)' }}>
                <Brain size={32} style={{ opacity: 0.5 }} />
                <p style={{ fontSize: '12px', fontStyle: 'italic' }}>Belum ada riwayat tes. Silakan mulai tes pertama Anda!</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* STEP 2: TEST TAKING PANEL */}
      {step === 'test' && (
        <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Progress Header */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '14px 20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--outline)' }}>
              Soal {currentQ + 1} dari {QUESTIONS.length}
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', color: timeLeft <= 60 ? 'var(--danger)' : 'var(--on-surface)' }}>
              <Timer size={20} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question area */}
          <div className="card" style={{ backgroundColor: 'white', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Category tag */}
            <span className="badge badge-primary" style={{ width: 'fit-content', fontSize: '10px' }}>
              {QUESTIONS[currentQ].category}
            </span>

            {/* Question Text */}
            <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.5 }}>
              {QUESTIONS[currentQ].question}
            </h3>

            {/* Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {QUESTIONS[currentQ].options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQ] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.04)' : 'white',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--primary)' : 'var(--on-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleSelectOption(oIdx)}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid ' + (isSelected ? 'var(--primary)' : 'var(--outline)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      color: 'white',
                      fontSize: '10px'
                    }}>
                      {isSelected && '✓'}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handlePrev}
                disabled={currentQ === 0}
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>

              {currentQ === QUESTIONS.length - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitTest}
                  style={{ backgroundColor: 'var(--success)' }}
                >
                  Selesaikan Tes <CheckCircle2 size={16} style={{ marginLeft: '6px' }} />
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext}
                >
                  Selanjutnya <ChevronRight size={16} />
                </button>
              )}
            </div>

          </div>

          {/* Quick Grid Nav Soal */}
          <div className="card" style={{ backgroundColor: 'white', padding: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {QUESTIONS.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isActive = currentQ === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isActive 
                      ? 'rgba(79, 70, 229, 0.08)' 
                      : isAnswered ? 'var(--surface-container)' : 'white',
                    color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentQ(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* STEP 3: LOADING REPORT */}
      {step === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '20px', textAlign: 'center' }}>
          <RefreshCw size={44} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>AI Sedang Merumuskan Analisis Karir Anda...</h3>
            <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Membaca pola logika kognitif Anda untuk memetakan kekuatan & kelemahan industri kerja.
            </p>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT DASHBOARD */}
      {step === 'result' && currentResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep('intro')}>
              ← Kembali ke Menu Utama
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleStartTest}>
              Ulangi Tes 🔄
            </button>
          </div>

          {/* Quick Score Metrics Card */}
          <div className="card" style={{ backgroundColor: 'white', padding: '24px', display: 'flex', gap: '30px', alignItems: 'center' }} className="md-grid-1-mobile">
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '8px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '10px', color: 'var(--outline)', fontWeight: 'bold', textTransform: 'uppercase' }}>Estimasi IQ</span>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{currentResult.iq_estimate}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>Skor Tes: {currentResult.score}/100</span>
                <span style={{ fontSize: '11.5px', color: 'var(--outline)' }}>
                  Diselesaikan pada {new Date(currentResult.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {currentResult.score >= 80 
                  ? "Sangat Baik! Anda memiliki daya nalar analitis tingkat tinggi." 
                  : currentResult.score >= 50
                    ? "Baik! Anda memiliki penalaran kognitif seimbang & praktis."
                    : "Cukup! Logika penalaran praktis tergolong memadai."
                }
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                IQ estimasi kognitif ini disesuaikan dengan kurva standardisasi tes potensi akademik seleksi kerja nasional. Gunakan laporan AI di bawah untuk pengembangan karir strategis.
              </p>
            </div>
          </div>

          {/* Result Tabs Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', fontSize: '13px', marginTop: '10px' }}>
            <button 
              style={{ padding: '10px 16px', fontWeight: activeReportTab === 'report' ? 700 : 500, borderBottom: activeReportTab === 'report' ? '2px solid var(--primary)' : 'none', color: activeReportTab === 'report' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
              onClick={() => setActiveReportTab('report')}
            >
              📊 Analisis Karir AI
            </button>
            <button 
              style={{ padding: '10px 16px', fontWeight: activeReportTab === 'review' ? 700 : 500, borderBottom: activeReportTab === 'review' ? '2px solid var(--primary)' : 'none', color: activeReportTab === 'review' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
              onClick={() => setActiveReportTab('review')}
            >
              🔍 Review Kunci Jawaban
            </button>
          </div>

          <div>
            {/* TAB A: REPORT AI */}
            {activeReportTab === 'report' && currentResult.ai_report && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }} className="md-grid-1-mobile">
                
                {/* Strengths / Weaknesses */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Kekuatan Kognitif Anda
                    </h4>
                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
                      {currentResult.ai_report.strengths}
                    </p>
                  </div>

                  <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} /> Area Pengembangan (Kelemahan)
                    </h4>
                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
                      {currentResult.ai_report.weaknesses}
                    </p>
                  </div>

                  <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} /> Saran Tindakan Pengembangan Karir:
                    </h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--on-surface-variant)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentResult.ai_report.suggestions?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Career Fit Side block */}
                <div className="card" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px dashed var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Brain size={18} /> Rekomendasi Karir AI
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--on-surface)', lineHeight: 1.5 }}>
                    Berdasarkan kecenderungan kecepatan kognitif, berikut industri dan posisi pekerjaan yang paling cocok untuk gaya kerja logis Anda:
                  </p>
                  
                  <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {currentResult.ai_report.careerFit}
                  </div>
                  
                  <p style={{ fontSize: '11px', color: 'var(--outline)', fontStyle: 'italic', marginTop: '6px' }}>
                    *Hasil analisis ini merupakan rekomendasi kognitif kualitatif dan bukan merupakan batasan mutlak minat bakat kerja Anda.
                  </p>
                </div>

              </div>
            )}

            {/* TAB B: KEY ANSWER REVIEW */}
            {activeReportTab === 'review' && (
              <div className="card" style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Review Pertanyaan & Jawaban</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {QUESTIONS.map((q, idx) => {
                    const chosen = currentResult.answers[idx];
                    const isCorrect = chosen === q.correctIdx;
                    return (
                      <div key={idx} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--outline)', fontWeight: 'bold' }}>SOAL {idx + 1} ({q.category})</span>
                          <span className={"badge " + (isCorrect ? "badge-success" : "badge-danger")} style={{ fontSize: '9px' }}>
                            {isCorrect ? "Benar ✅" : "Salah ❌"}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{q.question}</p>
                        
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                          <div style={{ color: 'var(--success)' }}>
                            <strong>✓ Kunci Jawaban:</strong> {q.options[q.correctIdx]}
                          </div>
                          {!isCorrect && (
                            <div style={{ color: 'var(--danger)' }}>
                              <strong>✗ Jawaban Anda:</strong> {chosen !== undefined ? q.options[chosen] : 'Tidak dijawab'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
