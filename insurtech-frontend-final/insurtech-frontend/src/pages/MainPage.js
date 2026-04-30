import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

export default function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { navigate('/login'); return; }
    setUser(JSON.parse(u));
    setHistory(JSON.parse(localStorage.getItem('consultHistory') || '[]'));
  }, [navigate]);

  const startNew = () => {
    const roomId = 'room-' + Date.now();
    localStorage.setItem('currentRoom', roomId);
    navigate('/device-check');
  };

  const logout = () => { localStorage.removeItem('user'); navigate('/login'); };

  const riskColor = { '높음': '#ef4444', '보통': '#f59e0b', '낮음': '#10b981' };

  return (
    <div className="main-container">
      <nav className="main-nav">
        <div className="nav-logo">📹 AI 상담 플랫폼</div>
        <div className="nav-right">
          <button onClick={() => navigate('/dashboard')} className="btn-dash">📊 대시보드</button>
          <span>{user?.name}님</span>
          <button onClick={logout} className="btn-logout">로그아웃</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="main-left">
          <div className="new-consult-card" onClick={startNew}>
            <div className="plus-icon">+</div>
            <h3>새로운 AI 상담 시작</h3>
            <p>WebRTC 화상 + Gemini AI 실시간 분석</p>
            <button className="btn-primary">새로운 AI 상담 방 생성</button>
          </div>
          <div className="info-cards">
            <div className="info-card">
              <span>📹</span>
              <div>
                <strong>WebRTC 화상통화</strong>
                <p>1:1 실시간 화상 상담</p>
              </div>
            </div>
            <div className="info-card">
              <span>🎙️</span>
              <div>
                <strong>STT 음성인식</strong>
                <p>음성 자동 텍스트 변환</p>
              </div>
            </div>
            <div className="info-card">
              <span>🤖</span>
              <div>
                <strong>Gemini AI 분석</strong>
                <p>약관 추출 · 감정 분석 · 후속조치</p>
              </div>
            </div>
          </div>
        </div>

        <div className="main-right">
          <div className="right-header">
            <h2>이전 상담 기록</h2>
            <button onClick={() => navigate('/dashboard')} className="view-all-btn">전체 보기 →</button>
          </div>
          {history.length === 0 ? (
            <div className="empty-history"><p>상담 기록이 없습니다.</p></div>
          ) : (
            <div className="history-list">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="history-item" onClick={() => navigate(`/summary/${h.roomId}`)}>
                  <div className="h-left">
                    <div className="h-title">{h.title}</div>
                    <div className="h-date">{h.date}</div>
                  </div>
                  <div className="h-right">
                    {h.analysis && (
                      <span className="h-risk" style={{background: riskColor[h.analysis.riskLevel] || '#6b7280'}}>
                        {h.analysis.riskLevel}
                      </span>
                    )}
                    <span className="h-badge">요약 보기</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
