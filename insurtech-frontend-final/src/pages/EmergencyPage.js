import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyMap from '../components/EmergencyMap';
import './EmergencyPage.css';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [notifyState, setNotifyState] = useState('idle'); // idle | sending | sent | error
  const [notifyResult, setNotifyResult] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(u));
  }, [navigate]);

  const sendNotification = async () => {
    setNotifyState('sending');
    try {
      const res = await fetch('/api/emergency-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user?.name || '익명',
          userEmail: user?.email || '',
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: new Date().toISOString(),
          message: '응급 페이지에서 사용자 요청',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifyResult(data);
      setNotifyState('sent');
    } catch (e) {
      setNotifyResult({ error: e.message });
      setNotifyState('error');
    }
  };

  const goToInsuranceFlow = () => {
    localStorage.setItem(
      'emergencyContext',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        notified: notifyState === 'sent',
      })
    );
    const roomId = 'room-' + Date.now();
    localStorage.setItem('currentRoom', roomId);
    navigate('/device-check');
  };

  const callCounselor = () => {
    const roomId = 'room-' + Date.now();
    localStorage.setItem('currentRoom', roomId);
    localStorage.setItem(
      'emergencyContext',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        mode: 'emergency',
      })
    );
    navigate('/device-check?mode=emergency');
  };

  return (
    <div className="emergency-container">
      <header className="emergency-header">
        <button className="emergency-back" onClick={() => navigate('/main')}>
          ← 메인으로
        </button>
        <h1>🚨 응급상황</h1>
        <p>침착하게 단계별로 진행하세요. 위급하면 즉시 119를 누르세요.</p>
      </header>

      <section className="emergency-section call-section">
        <h2>1. 즉시 통화</h2>
        <div className="call-grid">
          <a href="tel:119" className="call-btn call-119">
            <span className="call-icon">🚑</span>
            <span className="call-label">119</span>
            <span className="call-sub">구급 / 소방</span>
          </a>
          <a href="tel:112" className="call-btn call-112">
            <span className="call-icon">🚓</span>
            <span className="call-label">112</span>
            <span className="call-sub">경찰</span>
          </a>
          <a href="tel:1339" className="call-btn call-1339">
            <span className="call-icon">🏥</span>
            <span className="call-label">1339</span>
            <span className="call-sub">응급의료정보</span>
          </a>
          <button onClick={callCounselor} className="call-btn call-counselor">
            <span className="call-icon">📞</span>
            <span className="call-label">담당 상담사</span>
            <span className="call-sub">앱 내 영상통화</span>
          </button>
        </div>
      </section>

      <section className="emergency-section notify-section">
        <h2>2. 담당자에게 알림</h2>
        <p className="notify-desc">현재 위치와 함께 담당자에게 즉시 알림을 보냅니다.</p>
        <button
          className={`notify-btn notify-${notifyState}`}
          onClick={sendNotification}
          disabled={notifyState === 'sending' || notifyState === 'sent'}
        >
          {notifyState === 'idle' && '담당자에게 즉시 알림 보내기'}
          {notifyState === 'sending' && '발송 중…'}
          {notifyState === 'sent' && '✅ 알림 발송됨'}
          {notifyState === 'error' && '⚠️ 발송 실패 — 다시 시도'}
        </button>
        {notifyResult && notifyState === 'sent' && (
          <div className="notify-result">
            <span>Telegram: {notifyResult.telegram}</span>
            <span>Email: {notifyResult.email}</span>
          </div>
        )}
        {notifyResult?.error && (
          <div className="notify-result notify-error">{notifyResult.error}</div>
        )}
      </section>

      <section className="emergency-section guide-section">
        <h2>3. 지금 해야 할 일</h2>
        <ul className="guide-list">
          <li>🟢 안전한 장소로 이동하기</li>
          <li>🟢 의식·호흡 확인 (반응 없으면 즉시 119)</li>
          <li>🟢 119 신고 시 위치·상황을 정확히 전달</li>
          <li>🟢 사진과 메모로 현장을 기록 (보험 청구에 필요)</li>
          <li>🟢 가능하면 119 도착 전까지 움직이지 않기</li>
        </ul>
        <h3>📞 도움받을 수 있는 곳</h3>
        <ul className="help-list">
          <li><a href="tel:1339">응급의료정보센터 1339</a></li>
          <li><a href="tel:1577-0990">한국교통안전공단 1577-0990</a></li>
          <li><a href="tel:120">서울시 다산콜 120</a></li>
        </ul>
      </section>

      <section className="emergency-section map-section">
        <h2>4. 주변 응급실 / 의료시설</h2>
        <EmergencyMap onLocation={setCoords} />
      </section>

      <section className="emergency-section followup-section">
        <h2>5. 응급 처리 후</h2>
        <p>응급 상황이 진정된 뒤, 보험 청구는 기존 AI 상담 플로우로 이어서 진행할 수 있습니다.</p>
        <button className="followup-btn" onClick={goToInsuranceFlow}>
          보험 청구 상담 시작하기 →
        </button>
      </section>
    </div>
  );
}
