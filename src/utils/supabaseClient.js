import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isLocalMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isLocalMode 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);

// --- Offline / localStorage Fallback Database Helpers ---
const LOCAL_STORAGE_KEYS = {
  PROFILE: 'loloskerja_profile',
  CVS: 'loloskerja_cvs',
  COVER_LETTERS: 'loloskerja_cover_letters',
  APPLICATIONS: 'loloskerja_applications',
  PHOTOS: 'loloskerja_photos',
  INTERVIEWS: 'loloskerja_interviews',
  PSYCHOMETRIC: 'loloskerja_psychometric',
};

// Initial data templates
const getInitialProfile = () => ({
  id: 'local-user-id',
  name: 'Budi Santoso',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  target_industry: 'Teknologi / Startup',
  target_position: 'Product Manager',
  subscription_tier: 'free', // 'free', 'pro', 'lifetime'
  created_at: new Date().toISOString(),
});

const getInitialCVs = () => [
  {
    id: 'cv-shopee-pm',
    title: 'CV Shopee PM 2025',
    template_name: 'ats-classic',
    profile_info: {
      photo_url: '',
      name: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      phone: '081234567890',
      linkedin: 'linkedin.com/in/budisantoso',
      city: 'Jakarta Selatan',
    },
    summary: 'Product Manager berpengalaman yang berfokus pada pengembangan produk mobile app dan e-commerce. Memiliki latar belakang kuat dalam analisis data, riset pengguna, dan agile project management.',
    experience: [
      {
        company: 'TechCorp Indonesia',
        position: 'Associate Product Manager',
        duration: '2023 - Sekarang',
        description: '• Mengelola siklus hidup produk mobile app dari fase ideasi hingga peluncuran, meningkatkan retensi pengguna sebesar 15%.\n• Bekerja sama dengan tim engineer untuk merilis 5 fitur utama menggunakan metodologi Scrum.'
      },
      {
        company: 'Startup X',
        position: 'Product Operations Analyst',
        duration: '2022 - 2023',
        description: '• Menganalisis data perilaku pengguna untuk mengidentifikasi bottleneck pada corong konversi pembayaran.\n• Menyusun dokumentasi kebutuhan produk (PRD) dan berkolaborasi dengan QA untuk pengujian regresi.'
      }
    ],
    education: [
      {
        school: 'Universitas Indonesia',
        degree: 'Sarjana Ilmu Komputer',
        duration: '2018 - 2022',
        description: 'IPK: 3.75 / 4.00. Aktif dalam organisasi Himpunan Mahasiswa.'
      }
    ],
    skills: ['Product Strategy', 'Data Analysis', 'User Research', 'Scrum', 'Wireframing', 'SQL', 'Product Roadmap', 'Agile'],
    certifications: [
      { name: 'Google Project Management Certificate', issuer: 'Coursera', year: '2023' }
    ],
    achievements: [
      { title: 'Juara 1 Hackathon Nasional', year: '2022' }
    ],
    languages: [
      { name: 'Bahasa Indonesia', proficiency: 'Native' },
      { name: 'Bahasa Inggris', proficiency: 'Professional' }
    ],
    organizations: [
      { name: 'Himpunan Mahasiswa Fasilkom UI', role: 'Kepala Divisi Hubungan Luar', year: '2020 - 2021' }
    ],
    portfolio: [
      { name: 'Redesign Fitur Checkout App', url: 'behance.net/budisantoso' }
    ],
    ats_score: 87,
    is_published: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const getInitialApplications = () => [
  {
    id: 'app-shopee',
    company_name: 'Shopee',
    position: 'Product Manager',
    status: 'interview', // wishlist, applied, interview, offer, accepted, rejected
    applied_date: '2026-07-10',
    cv_id: 'cv-shopee-pm',
    salary: 15000000,
    notes: 'Interview Tahap 2 dengan Head of Product hari Selasa jam 14:00.',
    follow_up_date: '2026-07-20',
    attachments: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'app-gojek',
    company_name: 'Gojek',
    position: 'Associate Product Manager',
    status: 'applied',
    applied_date: '2026-07-15',
    cv_id: 'cv-shopee-pm',
    salary: 14000000,
    notes: 'Sudah submit tes kognitif.',
    follow_up_date: null,
    attachments: [],
    created_at: new Date().toISOString()
  },
  {
    id: 'app-traveloka',
    company_name: 'Traveloka',
    position: 'Junior PM',
    status: 'wishlist',
    applied_date: '2026-07-16',
    cv_id: null,
    salary: null,
    notes: 'Kualifikasi cocok banget, perlu siapin CV versi bahasa Inggris.',
    follow_up_date: null,
    attachments: [],
    created_at: new Date().toISOString()
  }
];

// Helper to safely parse localStorage
function getLocalItem(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Database Layer Interface
export const db = {
  // --- Profiles ---
  async getProfile() {
    if (isLocalMode) {
      let profile = getLocalItem(LOCAL_STORAGE_KEYS.PROFILE, null);
      if (!profile) {
        profile = getInitialProfile();
        setLocalItem(LOCAL_STORAGE_KEYS.PROFILE, profile);
      }
      return profile;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error && error.code === 'PGRST116') {
      // Create profile if not exists
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || '',
        target_industry: '',
        target_position: '',
        subscription_tier: 'free'
      };
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      if (insertError) throw insertError;
      return inserted;
    }
    return data;
  },

  async updateProfile(profileData) {
    if (isLocalMode) {
      const profile = { ...this.getProfileSync(), ...profileData };
      setLocalItem(LOCAL_STORAGE_KEYS.PROFILE, profile);
      return profile;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  getProfileSync() {
    let profile = getLocalItem(LOCAL_STORAGE_KEYS.PROFILE, null);
    if (!profile) {
      profile = getInitialProfile();
      setLocalItem(LOCAL_STORAGE_KEYS.PROFILE, profile);
    }
    return profile;
  },

  // --- CVs ---
  async getCVs() {
    if (isLocalMode) {
      let cvs = getLocalItem(LOCAL_STORAGE_KEYS.CVS, null);
      if (!cvs) {
        cvs = getInitialCVs();
        setLocalItem(LOCAL_STORAGE_KEYS.CVS, cvs);
      }
      return cvs;
    }
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getCV(id) {
    if (isLocalMode) {
      const cvs = await this.getCVs();
      return cvs.find(c => c.id === id) || null;
    }
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async saveCV(cvData) {
    if (isLocalMode) {
      const cvs = await this.getCVs();
      const idx = cvs.findIndex(c => c.id === cvData.id);
      const now = new Date().toISOString();
      let updatedCV;
      
      if (idx > -1) {
        updatedCV = { ...cvs[idx], ...cvData, updated_at: now };
        cvs[idx] = updatedCV;
      } else {
        updatedCV = {
          ...cvData,
          id: cvData.id || `cv-${Date.now()}`,
          created_at: now,
          updated_at: now
        };
        cvs.unshift(updatedCV);
      }
      setLocalItem(LOCAL_STORAGE_KEYS.CVS, cvs);
      return updatedCV;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...cvData, user_id: user.id, updated_at: new Date().toISOString() };
    
    let query;
    if (cvData.id && cvData.id.length > 20) { // Supabase UUID lengths
      query = supabase.from('cvs').update(payload).eq('id', cvData.id);
    } else {
      delete payload.id;
      query = supabase.from('cvs').insert(payload);
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },

  async deleteCV(id) {
    if (isLocalMode) {
      const cvs = await this.getCVs();
      const filtered = cvs.filter(c => c.id !== id);
      setLocalItem(LOCAL_STORAGE_KEYS.CVS, filtered);
      return true;
    }
    const { error } = await supabase.from('cvs').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- Cover Letters ---
  async getCoverLetters() {
    if (isLocalMode) {
      return getLocalItem(LOCAL_STORAGE_KEYS.COVER_LETTERS, []);
    }
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveCoverLetter(clData) {
    if (isLocalMode) {
      const letters = await this.getCoverLetters();
      const idx = letters.findIndex(l => l.id === clData.id);
      const now = new Date().toISOString();
      let updated;
      if (idx > -1) {
        updated = { ...letters[idx], ...clData, updated_at: now };
        letters[idx] = updated;
      } else {
        updated = {
          ...clData,
          id: clData.id || `cl-${Date.now()}`,
          created_at: now,
          updated_at: now
        };
        letters.unshift(updated);
      }
      setLocalItem(LOCAL_STORAGE_KEYS.COVER_LETTERS, letters);
      return updated;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...clData, user_id: user.id, updated_at: new Date().toISOString() };
    
    let query;
    if (clData.id && clData.id.length > 20) {
      query = supabase.from('cover_letters').update(payload).eq('id', clData.id);
    } else {
      delete payload.id;
      query = supabase.from('cover_letters').insert(payload);
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },

  async deleteCoverLetter(id) {
    if (isLocalMode) {
      const letters = await this.getCoverLetters();
      const filtered = letters.filter(l => l.id !== id);
      setLocalItem(LOCAL_STORAGE_KEYS.COVER_LETTERS, filtered);
      return true;
    }
    const { error } = await supabase.from('cover_letters').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- Applications Tracker ---
  async getApplications() {
    if (isLocalMode) {
      let apps = getLocalItem(LOCAL_STORAGE_KEYS.APPLICATIONS, null);
      if (!apps) {
        apps = getInitialApplications();
        setLocalItem(LOCAL_STORAGE_KEYS.APPLICATIONS, apps);
      }
      return apps;
    }
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveApplication(appData) {
    if (isLocalMode) {
      const apps = await this.getApplications();
      const idx = apps.findIndex(a => a.id === appData.id);
      let updated;
      if (idx > -1) {
        updated = { ...apps[idx], ...appData };
        apps[idx] = updated;
      } else {
        updated = {
          ...appData,
          id: appData.id || `app-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        apps.unshift(updated);
      }
      setLocalItem(LOCAL_STORAGE_KEYS.APPLICATIONS, apps);
      return updated;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...appData, user_id: user.id };
    
    let query;
    if (appData.id && appData.id.length > 20) {
      query = supabase.from('applications').update(payload).eq('id', appData.id);
    } else {
      delete payload.id;
      query = supabase.from('applications').insert(payload);
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },

  async deleteApplication(id) {
    if (isLocalMode) {
      const apps = await this.getApplications();
      const filtered = apps.filter(a => a.id !== id);
      setLocalItem(LOCAL_STORAGE_KEYS.APPLICATIONS, filtered);
      return true;
    }
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- Professional Photos (UI Mocked) ---
  async getPhotos() {
    return getLocalItem(LOCAL_STORAGE_KEYS.PHOTOS, []);
  },

  async savePhoto(photoData) {
    const photos = await this.getPhotos();
    const newPhoto = {
      ...photoData,
      id: `photo-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    photos.unshift(newPhoto);
    setLocalItem(LOCAL_STORAGE_KEYS.PHOTOS, photos);
    return newPhoto;
  },

  // --- Interview Prep ---
  async getInterviews() {
    return getLocalItem(LOCAL_STORAGE_KEYS.INTERVIEWS, []);
  },

  async saveInterview(prepData) {
    const preps = await this.getInterviews();
    const idx = preps.findIndex(p => p.id === prepData.id);
    let updated;
    if (idx > -1) {
      updated = { ...preps[idx], ...prepData };
      preps[idx] = updated;
    } else {
      updated = {
        ...prepData,
        id: `prep-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      preps.unshift(updated);
    }
    setLocalItem(LOCAL_STORAGE_KEYS.INTERVIEWS, preps);
    return updated;
  },

  // --- Psychometric (IQ Test) ---
  async getPsychometricTests() {
    if (isLocalMode) {
      return getLocalItem(LOCAL_STORAGE_KEYS.PSYCHOMETRIC, []);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('psychometric_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async savePsychometricTest(testData) {
    if (isLocalMode) {
      const tests = await this.getPsychometricTests();
      const newTest = {
        ...testData,
        id: `test-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      tests.unshift(newTest);
      setLocalItem(LOCAL_STORAGE_KEYS.PSYCHOMETRIC, tests);
      return newTest;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('psychometric_tests')
      .insert({
        ...testData,
        user_id: user.id
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
