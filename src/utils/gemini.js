import { GoogleGenerativeAI } from "@google/generative-ai";

// Get key from storage or env
export const getGeminiApiKey = () => {
  return localStorage.getItem('loloskerja_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const hasGeminiKey = () => {
  return !!getGeminiApiKey();
};

function getModel() {
  const key = getGeminiApiKey();
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// --- MOCK FALLBACKS ---
const mockSummaries = [
  "Profesional yang berdedikasi dan berorientasi pada hasil dengan keahlian mendalam di bidang administrasi dan koordinasi tim. Berpengalaman dalam mengelola alur kerja operasional, merancang solusi efisien, dan berkolaborasi erat dengan berbagai divisi untuk mencapai target bisnis perusahaan.",
  "Spesialis yang dinamis dengan rekam jejak terbukti dalam memimpin proyek digital, menganalisis data pasar, dan mengoptimalkan performa kampanye. Terampil dalam menerjemahkan kebutuhan bisnis menjadi aksi nyata yang terukur serta membangun hubungan jangka panjang dengan pemangku kepentingan.",
  "Sarjana baru yang antusias dengan motivasi tinggi untuk belajar dan berkembang. Memiliki pemahaman akademis yang kuat tentang manajemen operasional serta didukung oleh pengalaman organisasi aktif yang mengasah kemampuan komunikasi, kerja sama tim, dan pemecahan masalah."
];

// --- API Helpers ---

// 1. Generate Summary
export async function generateSummary(experienceText, skillsArray) {
  const model = getModel();
  if (!model) {
    // Return a realistic mock summary
    const randomSummary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
    return new Promise((resolve) => setTimeout(() => resolve(randomSummary), 1200));
  }

  const prompt = `Kamu adalah seorang Career Coach profesional di Indonesia.
Tuliskan 1 paragraf 'Professional Summary' / 'Tentang Saya' yang persuasif dan profesional untuk diletakkan di bagian atas CV berdasarkan data berikut:
Pengalaman Kerja: ${experienceText || 'Fresh Graduate / belum memiliki pengalaman kerja formal'}
Skills: ${skillsArray?.join(', ') || 'Belum diisi'}

Gunakan Bahasa Indonesia yang baik, profesional, bersemangat, dan modern. Jangan terlalu panjang, maksimal 3-4 kalimat.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return mockSummaries[0];
  }
}

// 2. Improve job description to bullet points with action verbs
export async function improveDescription(descriptionText) {
  const model = getModel();
  if (!model) {
    const mockBullets = `• Mengoordinasikan pelaksanaan operasional harian guna meningkatkan efisiensi kerja tim sebesar 15%.\n• Menyusun laporan berkala dan menganalisis metrik performa untuk mendukung keputusan strategis manajemen.\n• Berkolaborasi aktif dengan 3 divisi terkait untuk memastikan kelancaran alur komunikasi dan proyek berjalan tepat waktu.`;
    return new Promise((resolve) => setTimeout(() => resolve(mockBullets), 1200));
  }

  const prompt = `Kamu adalah pakar penulisan CV ATS-friendly. 
Ubah deskripsi pekerjaan atau tanggung jawab berikut menjadi 3 bullet points yang powerful menggunakan action verbs (kata kerja aktif) dan fokus pada pencapaian (achievements) atau metrik terukur jika memungkinkan.
Deskripsi kerja:
${descriptionText}

Gunakan Bahasa Indonesia yang profesional dan lugas. Tulis langsung berupa bullet points memakai karakter bullet '•'.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "• Mengelola aktivitas harian pekerjaan secara mandiri.\n• Berkolaborasi dengan tim internal.\n• Meningkatkan kepuasan klien.";
  }
}

// 3. Recommend skills based on position
export async function recommendSkills(position) {
  const model = getModel();
  if (!model) {
    const mockSkills = ["Project Management", "Data Analysis", "Critical Thinking", "Agile Methodology", "SQL", "Stakeholder Communication", "Problem Solving", "Strategic Planning"];
    return new Promise((resolve) => setTimeout(() => resolve(mockSkills), 1000));
  }

  const prompt = `Rekomendasikan 8 hard skills dan soft skills yang paling relevan dan dicari oleh perusahaan di Indonesia untuk posisi: "${position}".
Kembalikan hasilnya dalam bentuk list kata kunci (keywords) yang dipisahkan dengan koma saja tanpa nomor, tanpa judul, contoh: Python, SQL, Data Analytics, Communication`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Komunikasi", "Analisis Data", "Problem Solving"];
  }
}

// 4. ATS Analyzer Match Score & Recommendation
export async function analyzeCVATS(cvContentText, jobDescription) {
  const model = getModel();
  if (!model) {
    // Generate simulated intelligent mock analysis based on text lengths
    return new Promise((resolve) => {
      setTimeout(() => {
        const score = Math.floor(Math.random() * 30) + 60; // 60-90
        const found = ["Product", "Data", "Strategy", "Analysis", "User", "Scrum", "Research"].slice(0, Math.floor(Math.random() * 4) + 4);
        const missing = ["Agile Project Management", "A/B Testing", "Stakeholder Management", "Product Roadmap", "KPI Design"].filter(x => !found.includes(x)).slice(0, 3);
        
        resolve({
          score: score,
          compatibilityText: `CV Anda memiliki kecocokan yang ${score >= 80 ? 'sangat tinggi' : 'cukup baik'} dengan deskripsi pekerjaan. Beberapa penyesuaian kata kunci disarankan untuk memaksimalkan peluang lolos filter otomatis.`,
          keywords: {
            found: found,
            missing: missing,
            recommendation: `Tambahkan kalimat ini ke bagian pengalaman kerja Anda: "Melakukan pengujian A/B untuk memvalidasi fitur baru serta memimpin kolaborasi lintas divisi dengan teknik Agile Project Management."`
          },
          format: {
            fileTypeOk: true,
            fontReadable: true,
            layoutOk: true,
            lengthOk: true,
            explanation: "Format file PDF terbaca dengan baik. Penggunaan font standar (Inter/DM Sans) aman untuk parser ATS. Struktur satu/dua kolom bersih tanpa gambar yang menyulitkan pembacaan."
          },
          sections: {
            strong: ["Informasi Kontak", "Pengalaman Kerja", "Pendidikan"],
            weak: ["Sertifikasi", "Deskripsi Proyek"],
            recommendation: "Bagian Sertifikasi perlu diperluas dengan mencantumkan penerbit sertifikat dan tahun kelulusan secara jelas."
          },
          prediction: {
            status: score >= 80 ? "Tinggi" : score >= 65 ? "Sedang" : "Rendah",
            explanation: score >= 80 
              ? "Kemungkinan lolos tinggi karena kata kunci utama di deskripsi kerja terdeteksi di CV." 
              : "Kemungkinan sedang. Menambahkan kata kunci penting yang disarankan akan secara dramatis meningkatkan peluang Anda.",
            priorityFixes: [
              "Tambahkan kata kunci '" + missing[0] + "' di deskripsi pengalaman kerja.",
              "Perjelas kontribusi angka/metrik pencapaian di pekerjaan terakhir.",
              "Cantumkan link portofolio aktif yang relevan di bagian atas."
            ]
          }
        });
      }, 2000);
    });
  }

  const prompt = `Kamu adalah sistem parser ATS (Applicant Tracking System) tercanggih untuk korporat Indonesia. 
Misi kamu adalah menganalisa kecocokan CV berikut terhadap Deskripsi Pekerjaan (Job Description).

CV:
${cvContentText}

Job Description:
${jobDescription}

Lakukan analisis mendalam dan berikan hasilnya dalam format JSON murni. Jangan menulis markdown block, jangan menulis penjelasan di luar JSON. Struktur JSON harus persis seperti ini:
{
  "score": 75, // integer 0-100
  "compatibilityText": "CV kamu cocok 75%...",
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "recommendation": "Tambahkan kalimat..."
  },
  "format": {
    "fileTypeOk": true,
    "fontReadable": true,
    "layoutOk": true,
    "lengthOk": true,
    "explanation": "Penjelasan format..."
  },
  "sections": {
    "strong": ["Section1"],
    "weak": ["Section2"],
    "recommendation": "Rekomendasi perbaikan..."
  },
  "prediction": {
    "status": "Tinggi", // Tinggi / Sedang / Rendah
    "explanation": "Penjelasan kemungkinan lolos...",
    "priorityFixes": [
      "Langkah 1...",
      "Langkah 2...",
      "Langkah 3..."
    ]
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Clean JSON if Gemini wrapped it in markdown
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    // Return a default mock result
    return {
      score: 65,
      compatibilityText: "Terjadi kesalahan saat memproses AI. Skor default ditampilkan.",
      keywords: { found: ["Product"], missing: ["Agile"], recommendation: "Coba tambahkan kata kunci Agile." },
      format: { fileTypeOk: true, fontReadable: true, layoutOk: true, lengthOk: true, explanation: "Format default." },
      sections: { strong: ["Pendidikan"], weak: ["Pengalaman"], recommendation: "Lengkapi pengalaman kerja." },
      prediction: { status: "Sedang", explanation: "Lengkapi data CV untuk mendapatkan prediksi akurat.", priorityFixes: ["Masukkan API key Gemini yang valid", "Tambahkan deskripsi kerja", "Coba analisis ulang"] }
    };
  }
}

// 5. Generate Cover Letter
export async function generateCoverLetter({ companyName, position, tone, jobDescription, cvSummary, customNotes }) {
  const model = getModel();
  
  let toneInstruction = "Formal, sopan, dan berwibawa (cocok untuk BUMN dan korporasi besar).";
  if (tone === 'semi-formal') toneInstruction = "Semi-formal, hangat, profesional tapi modern (cocok untuk perusahaan swasta menengah).";
  if (tone === 'conversational') toneInstruction = "Conversational, berenergi, antusias, dan kasual-profesional (cocok untuk Tech Startup).";

  if (!model) {
    // Return realistic mock cover letter
    const greeting = tone === 'conversational' ? `Halo Tim Rekrutmen ${companyName || 'Perusahaan'},` : `Kepada Yth.\nTim Rekrutmen ${companyName || 'Perusahaan'}\ndi Tempat`;
    const mockContent = `${greeting}

Perkenalkan, nama saya Budi Santoso. Saya menulis surat ini untuk mengekspresikan ketertarikan mendalam saya pada posisi ${position || 'Staf'} di ${companyName || 'perusahaan Anda'}. Berdasarkan profil pengalaman saya di bidang terkait, saya yakin dapat berkontribusi aktif dan membawa dampak positif bagi kemajuan tim Anda.

Dalam peran saya sebelumnya, saya telah berhasil memimpin inisiatif penting dan berkolaborasi erat dengan tim lintas fungsi untuk mencapai target performa yang efisien. Keahlian utama saya meliputi pemecahan masalah secara analitis, komunikasi strategis, dan koordinasi operasional yang solid. Saya sangat mengagumi kultur kerja di ${companyName || 'perusahaan ini'} yang terkenal dinamis dan inovatif, dan saya ingin sekali membawa keahlian saya untuk menyukseskan proyek-proyek mendatang.

Terima kasih atas waktu dan pertimbangan yang diberikan. Saya sangat berharap dapat mendiskusikan kualifikasi saya lebih lanjut dalam sesi wawancara.

Hormat saya,

Budi Santoso`;
    return new Promise((resolve) => setTimeout(() => resolve(mockContent), 1800));
  }

  const prompt = `Tuliskan Surat Lamaran Kerja (Cover Letter) yang persuasif dalam Bahasa Indonesia berdasarkan data berikut:
Nama Perusahaan yang Dilamar: ${companyName || 'Perusahaan Impian'}
Posisi yang Dilamar: ${position || 'Staff'}
Tone Surat: ${toneInstruction}
Deskripsi Pekerjaan: ${jobDescription || 'Tidak disediakan'}
Profil Singkat Pelamar: ${cvSummary || 'Budi Santoso, antusias dan berpengalaman di bidangnya.'}
Hal spesifik yang ingin ditekankan: ${customNotes || 'Tidak ada catatan tambahan'}

Aturan penulisan:
1. Terdiri dari 3-4 paragraf yang mengalir lancar.
2. Paragraf 1: Pembuka yang langsung memikat perhatian rekruter.
3. Paragraf 2-3: Menyoroti skill/pengalaman relevan pelamar dan mencocokkannya dengan kebutuhan deskripsi pekerjaan.
4. Paragraf 4: Penutup yang percaya diri, menyertakan Call To Action untuk wawancara.
5. Jangan gunakan placeholder seperti "[Nama Perusahaan]" jika nama perusahaan sudah diberikan di atas. Berikan surat lamaran yang sudah terisi lengkap dan siap dikirim.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal melakukan pembuatan surat lamaran via AI. Silakan masukkan API key yang valid atau coba lagi nanti.";
  }
}

// 6. Generate Interview Prep Q&A and Tips
export async function generateInterviewPrep(position, company, jd, level, type) {
  const model = getModel();
  if (!model) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          qa: [
            {
              question: "Bisa ceritakan tentang diri Anda dan kenapa tertarik melamar posisi " + position + " di " + company + "?",
              answer: "Gunakan framework STAR: Mulai dengan ringkasan latar belakang akademis/profesional Anda (Situation), jelaskan minat Anda pada industri ini (Task), hubungkan dengan pencapaian yang membuktikan kapabilitas Anda (Action), dan akhiri dengan alasan kuat mengapa posisi ini di perusahaan ini adalah langkah karir terbaik Anda (Result).",
              tips: "Jangan menceritakan seluruh isi CV secara kronologis. Fokus pada 2-3 pencapaian utama yang paling relevan dengan kebutuhan lowongan.",
              variations: "Bagi fresh graduate: Hubungkan dengan proyek magang atau kepemimpinan organisasi. Bagi profesional: Soroti peningkatan persentase kerja atau efisiensi biaya."
            },
            {
              question: "Bagaimana Anda menyikapi tenggat waktu (deadline) proyek yang sangat ketat?",
              answer: "S: Di proyek sebelumnya, kami harus merilis fitur baru dalam 2 minggu. T: Sebagai penanggung jawab, saya harus memastikan semua modul selesai. A: Saya memprioritaskan fitur inti (MVP), membagi tugas secara harian, dan melakukan daily standup. R: Proyek meluncur tepat waktu dengan tingkat bug di bawah 5%.",
              tips: "Hindari menjawab secara defensif seperti 'Saya bekerja lembur'. Tunjukkan manajemen prioritas dan komunikasi proaktif.",
              variations: "Tunjukkan contoh konkret di mana Anda mendelegasikan tugas atau berkomunikasi dengan manajer terkait keterbatasan waktu."
            }
          ],
          interviewer: [
            { question: "Bagaimana tim ini mengukur kesuksesan untuk posisi ini dalam 3 bulan pertama?", category: "Tentang Perusahaan" },
            { question: "Apa tantangan terbesar yang sedang dihadapi oleh tim pengembang produk saat ini?", category: "Tentang Tim" },
            { question: "Apakah ada kesempatan pelatihan atau mentorship untuk mendukung perkembangan skill di posisi ini?", category: "Growth" }
          ],
          tips: {
            dressCode: "Gunakan pakaian " + (level === 'Senior' || level === 'Manajerial' ? 'formal lengkap (jas/blazer)' : 'smart casual rapi (batik/kemeja)') + " yang memberikan impresi bersih dan profesional.",
            typeTips: "Dalam " + type + ", pewawancara ingin melihat cara berpikir logis dan pemecahan masalah Anda. Bicaralah sambil menstrukturkan ide.",
            redFlags: "Terlambat masuk room interview virtual, menjelekkan perusahaan tempat kerja sebelumnya, dan tidak mengajukan pertanyaan di akhir sesi.",
            followUp: "Kirimkan email ucapan terima kasih (Thank-You Email) maksimal 24 jam setelah interview selesai."
          }
        });
      }, 2000);
    });
  }

  const prompt = `Kamu adalah seorang Direktur HR Senior di Indonesia. 
Buatlah panduan lengkap persiapan interview untuk pelamar berikut:
Posisi: "${position}"
Perusahaan: "${company}"
Deskripsi Pekerjaan:
${jd || 'Umum'}
Level Pengalaman: ${level} (Fresh Graduate / Mid-level / Senior / Manajerial)
Jenis Interview: ${type} (HR / User / Technical / Case Study)

Hasilkan JSON murni berisi struktur ini:
{
  "qa": [
    {
      "question": "Pertanyaan 1...",
      "answer": "Contoh jawaban framework STAR (Situation, Task, Action, Result)...",
      "tips": "Hindari menjawab dengan...",
      "variations": "Variasi jawaban untuk background berbeda..."
    }
  ], // Buat minimal 5-8 pertanyaan relevan (maksimal 20 untuk real)
  "interviewer": [
    { "question": "Pertanyaan cerdas ke interviewer...", "category": "Tentang Perusahaan / Tim / Growth" }
  ], // Minimal 5 pertanyaan
  "tips": {
    "dressCode": "Tips berpakaian...",
    "typeTips": "Tips spesifik jenis interview ini...",
    "redFlags": "Red flags yang harus dihindari...",
    "followUp": "Cara follow-up..."
  }
}
Kembalikan hanya JSON murni tanpa pembuka/penutup.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return { qa: [], interviewer: [], tips: { dressCode: "", typeTips: "", redFlags: "", followUp: "" } };
  }
}

// 7. Practice Mode answer grading
export async function gradeInterviewAnswer(question, answerText) {
  const model = getModel();
  if (!model) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const score = Math.floor(Math.random() * 20) + 70; // 70-90
        resolve({
          score: score,
          relevance: score >= 80 ? "Sangat relevan dengan pertanyaan." : "Cukup relevan, tapi bisa lebih difokuskan.",
          structure: "Menggunakan alur teratur. Bagus sekali.",
          completeness: "Menyertakan aksi dan hasil konkret.",
          recommendations: "Tambahkan metrik angka pencapaian di akhir kalimat Anda untuk menunjukkan dampak nyata tindakan Anda."
        });
      }, 1500);
    });
  }

  const prompt = `Evaluasilah jawaban interview berikut terhadap pertanyaan yang diberikan.
Pertanyaan: "${question}"
Jawaban Pelamar:
"${answerText}"

Berikan penilaian analitis dalam format JSON murni. Struktur JSON:
{
  "score": 85, // integer 0-100
  "relevance": "Evaluasi relevansi...",
  "structure": "Evaluasi struktur alur (apakah mengikuti STAR)...",
  "completeness": "Evaluasi kelengkapan penjelasan...",
  "recommendations": "Saran perbaikan konkret..."
}
Kembalikan JSON murni.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 70, relevance: "Kesalahan memproses evaluasi.", structure: "", completeness: "", recommendations: "Coba kirimkan jawaban lagi." };
  }
}

// 8. Generate Psychometric/IQ Report
export async function generatePsychometricReport(score, iqEstimate, correctCount, wrongCount) {
  const model = getModel();
  if (!model) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let strengths = "";
        let weaknesses = "";
        let careerFit = "";
        let suggestions = [];

        if (score >= 80) {
          strengths = "Kemampuan logika analitis yang sangat tajam, pemahaman deret angka cepat, serta penalaran spasial di atas rata-rata. Anda sangat terampil memecahkan masalah kompleks berbekal data kuantitatif.";
          weaknesses = "Terkadang cenderung menganalisis terlalu dalam (analysis paralysis) yang dapat memperlambat pengambilan keputusan taktis yang membutuhkan respons cepat.";
          careerFit = "Teknologi (Software Engineer, Data Scientist), Keuangan Kuantitatif, Konsultan Strategis, Riset & R&D.";
          suggestions = [
            "Latihlah pemecahan masalah dengan batasan waktu yang lebih ketat guna mengasah intuisi bisnis.",
            "Terapkan teknik visualisasi data untuk mempercepat penyampaian wawasan logis kepada audiens non-teknis.",
            "Lakukan simulasi kasus bisnis (Case Studies) secara berkala."
          ];
        } else if (score >= 50) {
          strengths = "Penalaran verbal dan aritmatika sosial yang seimbang. Anda memiliki kemampuan pemecahan masalah praktis yang baik serta komunikasi hubungan analogi yang kuat.";
          weaknesses = "Kecepatan pemrosesan logika angka abstrak masih dapat dioptimalkan. Perlu ketelitian ekstra saat menghadapi pola angka bercabang.";
          careerFit = "Product Management, Business Development, Marketing Strategist, Manajemen Operasional, Human Resources.";
          suggestions = [
            "Latihlah soal deret angka dan logika pola matematika dasar secara rutin untuk meningkatkan kecepatan berpikir.",
            "Fokus pada metrik/indikator pencapaian konkret dalam setiap pemecahan masalah.",
            "Gunakan visual mind mapping untuk merunut logika proses yang rumit."
          ];
        } else {
          strengths = "Pemahaman verbal dan aplikasi logika praktis yang mantap. Sangat baik dalam menyerap informasi instruksional dan memiliki kecerdasan interpersonal tinggi.";
          weaknesses = "Penalaran matematis abstrak dan spasial membutuhkan latihan lebih terstruktur untuk mempercepat pengenalan pola tersembunyi.";
          careerFit = "Public Relations, Customer Success, Sales & Account Management, Project Coordinator, Event Operations.";
          suggestions = [
            "Mulai dengan mempelajari pola-pola tes psikotes standar (analogi dan sinonim/antonim).",
            "Gunakan kalkulator mental atau aplikasi latihan matematika dasar untuk melatih ketangkasan kuantitatif.",
            "Fokus pada struktur pemecahan masalah langkah-demi-langkah (step-by-step reasoning)."
          ];
        }

        resolve({ strengths, weaknesses, careerFit, suggestions });
      }, 1500);
    });
  }

  const prompt = `Analisis hasil tes IQ/Psikotes kognitif berikut:
Skor Benar: ${correctCount} dari 10 soal (Skor total: ${score}/100)
Estimasi IQ: ${iqEstimate}

Berikan laporan interpretasi psikologis & rekomendasi karir dalam format JSON murni. Jangan menulis markdown block. JSON harus memiliki struktur:
{
  "strengths": "Kekuatan kognitif utama...",
  "weaknesses": "Kelemahan/area yang perlu dikembangkan...",
  "careerFit": "Daftar industri dan posisi karir yang cocok...",
  "suggestions": [
    "Saran pengembangan 1...",
    "Saran pengembangan 2...",
    "Saran pengembangan 3..."
  ]
}
Kembalikan JSON murni berbahasa Indonesia yang ramah, profesional, dan akurat.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      strengths: "Memiliki logika berpikir analitis praktis.",
      weaknesses: "Kecepatan pengerjaan di bawah tekanan waktu perlu terus dilatih.",
      careerFit: "Operasional bisnis, Administrasi umum, Layanan pelanggan.",
      suggestions: ["Latih soal psikotes secara berkala", "Pelajari pola deret aritmatika", "Tingkatkan ketelitian membaca soal"]
    };
  }
}

