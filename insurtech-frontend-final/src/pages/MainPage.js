import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi, authApi } from '../services/api';
import './MainPage.css';

export default function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { navigate('/login'); return; }
    const userData = JSON.parse(u);
    setUser(userData);

    // Load history from backend first, fallback to localStorage
    const loadHistory = async () => {
      try {
        const response = await sessionApi.getSessions();
        if (response.data && response.data.length > 0) {
          setHistory(response.data.map(s => ({
            roomId: s.roomId,
            title: s.title || `상담 - ${s.insuranceType}`,
            date: s.sessionDate || s.createdAt,
            keywords: s.keywords ? s.keywords.split(',') : [],
            insuranceType: s.insuranceType,
            duration: s.duration
          })));
          return;
        }
      } catch (e) {
        console.log('Backend history load failed, using localStorage');
      }
      setHistory(JSON.parse(localStorage.getItem('consultHistory') || '[]'));
    };
    loadHistory();
  }, [navigate]);

  const startNewConsult = () => {
    const roomId = 'room-' + Date.now();
    localStorage.setItem('currentRoom', roomId);
    navigate('/device-check');
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="main-container">
      <nav className="main-nav">
        <div className="nav-logo">📹 AI 약관 도우미</div>
        <div className="nav-right">
          {user?.roleLabel && <span className="role-badge">{user.roleLabel}</span>}
          <span className="nav-user">👤 {user?.name}님</span>
          <button onClick={() => navigate('/dashboard')} className="btn-dashboard">📊 대시보드</button>
          <button onClick={logout} className="btn-logout">로그아웃</button>
        </div>
      </nav>

      <div className="main-hero">
        <h1>AI 보험 약관 상담 시스템</h1>
        <p>Gemini AI가 실시간으로 보험 약관을 분석하고 상담해드립니다</p>
      </div>

      <button
        type="button"
        className="emergency-banner"
        onClick={() => navigate('/emergency')}
      >
        <span className="emergency-icon">🚨</span>
        <span className="emergency-text">
          <strong>응급상황입니까?</strong>
          <span>119/112 즉시 통화 · 담당자 알림 · 주변 응급실 안내</span>
        </span>
        <span className="emergency-arrow">즉시 도움받기 →</span>
      </button>

      <div className="main-content">
        <div className="main-left">
          <div className="new-consult-card" onClick={startNewConsult}>
            <div className="plus-icon">+</div>
            <h3>새로운 AI 상담 시작</h3>
            <p>AI 기반 실시간 약관 상담을 시작하세요</p>
            <button className="btn-start">새로운 AI 상담 방 생성 →</button>
          </div>

          {/* New Feature Buttons */}
          <div className="action-cards">
            <div className="action-card recommend" onClick={() => navigate('/recommend')}>
              <span className="action-icon">🛡️</span>
              <div>
                <strong>AI 보험 추천</strong>
                <p>고민/취약점 분석으로 맞춤 보험 추천</p>
              </div>
            </div>
            <div className="action-card booking" onClick={() => navigate('/booking')}>
              <span className="action-icon">📅</span>
              <div>
                <strong>상담 예약</strong>
                <p>원하는 날짜/시간에 상담 예약</p>
              </div>
            </div>
            <div className="action-card manage" onClick={() => navigate('/booking-manage')}>
              <span className="action-icon">📋</span>
              <div>
                <strong>예약 관리</strong>
                <p>예약 확인/취소/관리</p>
              </div>
            </div>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span>🤖</span>
              <div>
                <strong>Gemini AI 실시간 분석</strong>
                <p>약관 내용 즉시 요약 및 설명</p>
              </div>
            </div>
            <div className="feature-item">
              <span>📚</span>
              <div>
                <strong>FAQ/법률조항 즉시 조회</strong>
                <p>사전 데이터로 빠른 답변 제공</p>
              </div>
            </div>
            <div className="feature-item">
              <span>📄</span>
              <div>
                <strong>상담 문서 자동 생성</strong>
                <p>DOCX/PDF로 내보내기 및 이메일 전송</p>
              </div>
            </div>
            <div className="feature-item">
              <span>🛡️</span>
              <div>
                <strong>AI 보험 추천</strong>
                <p>고객 상황에 맞는 보험 상품 추천</p>
              </div>
            </div>
          </div>
        </div>

        <div className="main-right">
          <div className="history-header">
            <h2>이전 상담 기록</h2>
            <span className="history-count">{history.length}건</span>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">💬</div>
              <p>아직 상담 기록이 없습니다.</p>
              <p className="empty-sub">새로운 AI 상담을 시작해보세요!</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((h, i) => (
                <div key={i} className="history-item" onClick={() => navigate(`/summary/${h.roomId}`)}>
                  <div className="history-left">
                    <div className="history-icon">🤖</div>
                    <div>
                      <p className="history-title">{h.title}</p>
                      <p className="history-date">{h.date}</p>
                      {h.keywords?.length > 0 && (
                        <div className="history-keywords">
                          {h.keywords.slice(0, 3).map((kw, j) => (
                            <span key={j} className="mini-tag">{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="history-arrow">요약 보기 →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
