# Panduan Utama - LolosKerja Career Platform

LolosKerja adalah platform karir terintegrasi terlengkap (SaaS) yang dirancang khusus untuk mempermudah talenta Indonesia dalam melamar pekerjaan. Platform ini memadukan pembuatan CV ramah ATS, analisis kecocokan pekerjaan, penulisan surat lamaran cerdas, simulasi wawancara dengan evaluasi STAR, generator potret profesional AI, dan tes kognitif/IQ psikotes.

---

## 🌟 Fitur Utama

1. **CV Builder & Editor:** Pembuat resume interaktif dengan 12 pilihan template (6 ATS-Safe, 6 Modern Visual). Dilengkapi alat bantu AI untuk menulis ringkasan dan deskripsi kerja serta kalkulator ATS Score *real-time*.
2. **ATS Analyzer:** Menganalisis kecocokan isi CV dengan deskripsi lowongan kerja untuk menemukan kata kunci yang hilang (*missing keywords*).
3. **AI Cover Letter Writer:** Membuat draf surat lamaran kerja kustom dalam 3 pilihan tone (*Formal, Semi-Formal, Conversational*).
4. **Foto Profesional AI:** Simulasi generator foto formal studio menggunakan AI (pilihan setelan jas, batik, blazer, dan berbagai background studio).
5. **Job Application Tracker:** Papan kanban penjejak lamaran kerja terorganisir untuk memantau kemajuan lamaran (*Wishlist, Applied, Interview, Offer*).
6. **Persiapan Interview & Practice Mode:** Latihan tanya jawab interview perilaku dengan *live timer* dan evaluasi umpan balik penilaian alur STAR bertenaga AI.
7. **Psikotes AI (Tes IQ):** Tes potensi kognitif umum 10 soal dengan visualisasi skor IQ, kekuatan-kelemahan, dan kecocokan jenis karir berdasarkan kecerdasan kognitif.

---

## 🛠️ Tech Stack & Dependensi

* **Frontend:** React.js (Vite) + React Router DOM (Single Page Application)
* **Ikon:** Lucide Icons
* **Animasi & Grafis:** Canvas Confetti
* **Integrasi AI:** Google Gemini Generative AI SDK (`gemini-1.5-flash` model)
* **Database & Autentikasi:** Supabase (Auth + PostgreSQL) dengan opsi *Local Mode* otomatis (menggunakan browser `localStorage`).

---

## 🚀 Cara Menjalankan Secara Lokal

1. Buka folder proyek di terminal Anda:
   ```bash
   cd C:\Users\UC\.gemini\antigravity\scratch\loloskerja
   ```
2. Jalankan perintah server pengembangan:
   ```bash
   npm run dev
   ```
3. Akses aplikasi melalui browser di: [http://localhost:5173/](http://localhost:5173/)

---

## ☁️ Petunjuk Deployment & Konfigurasi API

Aplikasi ini dapat dihubungkan ke akun database Supabase & API Gemini Anda sendiri melalui menu **Settings (Kunci API & Dev)** di dasbor aplikasi atau dengan membuat berkas `.env.local` pada direktori root proyek:

```env
VITE_GEMINI_API_KEY=Kunci_API_Gemini_Anda
VITE_SUPABASE_URL=URL_Proyek_Supabase_Anda
VITE_SUPABASE_ANON_KEY=Kunci_Anon_Publik_Supabase_Anda
```
