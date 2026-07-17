import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import CVsList from './pages/CVsList';
import CVBuilder from './pages/CVBuilder';
import ATSAnalyzer from './pages/ATSAnalyzer';
import CoverLetter from './pages/CoverLetter';
import FotoProfesional from './pages/FotoProfesional';
import JobTracker from './pages/JobTracker';
import InterviewPrep from './pages/InterviewPrep';
import PsychometricTest from './pages/PsychometricTest';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard Workspace */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Main overview */}
          <Route index element={<DashboardOverview />} />
          
          {/* CVs Section */}
          <Route path="cvs" element={<CVsList />} />
          <Route path="cvs/:id/edit" element={<CVBuilder />} />
          <Route path="cvs/new/edit" element={<CVBuilder />} />

          {/* ATS Analyzer */}
          <Route path="ats-analyzer" element={<ATSAnalyzer />} />

          {/* Cover Letters */}
          <Route path="cover-letters" element={<CoverLetter />} />

          {/* Foto Profesional */}
          <Route path="foto" element={<FotoProfesional />} />

          {/* Tracker Kanban */}
          <Route path="tracker" element={<JobTracker />} />

          {/* Interview Preparation */}
          <Route path="interview" element={<InterviewPrep />} />

          {/* Psikotes */}
          <Route path="psikotes" element={<PsychometricTest />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
