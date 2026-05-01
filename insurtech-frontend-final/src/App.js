import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import DeviceCheckPage from './pages/DeviceCheckPage';
import ConsultationRoomPage from './pages/ConsultationRoomPage';
import SummaryPage from './pages/SummaryPage';
import DashboardPage from './pages/DashboardPage';
import RecommendationPage from './pages/RecommendationPage';
import BookingPage from './pages/BookingPage';
import BookingManagementPage from './pages/BookingManagementPage';
import EmergencyPage from './pages/EmergencyPage';
import EducationPage from './pages/EducationPage';
import EducationScenarioPage from './pages/EducationScenarioPage';

// 로그인/회원가입 기능 제거 — 모듈 로드 시 데모 사용자를 자동 주입.
if (typeof window !== 'undefined' && !localStorage.getItem('user')) {
  localStorage.setItem('user', JSON.stringify({
    email: 'demo@adjuster.com',
    name: '데모 사용자',
    role: 'adjuster',
    roleLabel: '손해사정사',
    serverRole: 'ADJUSTER',
    demo: true
  }));
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/device-check" element={<DeviceCheckPage />} />
        <Route path="/room/:roomId" element={<ConsultationRoomPage />} />
        <Route path="/summary/:roomId" element={<SummaryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-manage" element={<BookingManagementPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/education/:id" element={<EducationScenarioPage />} />
        {/* 기존 /login, /register 로의 직접 접근/리다이렉트는 메인으로 보낸다. */}
        <Route path="/login" element={<Navigate to="/main" replace />} />
        <Route path="/register" element={<Navigate to="/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
