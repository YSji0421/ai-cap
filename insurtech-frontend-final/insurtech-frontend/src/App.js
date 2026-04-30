import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import DeviceCheckPage from './pages/DeviceCheckPage';
import ConsultationRoomPage from './pages/ConsultationRoomPage';
import SummaryPage from './pages/SummaryPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/device-check" element={<DeviceCheckPage />} />
        <Route path="/room/:roomId" element={<ConsultationRoomPage />} />
        <Route path="/summary/:roomId" element={<SummaryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
