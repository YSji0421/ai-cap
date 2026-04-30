import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SummaryPage.css';

export default function SummaryPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('consultHistory') || '[]');
    const found = h.find(x => x.roomId === roomId);
    setData(found || { roomId, date: new Date().toLocaleString('ko-KR'), title: 'AI 상담 요약', transcript: [], analysis: null, duration: 0 });
  }, [roomId]);

  const fmtDur = s => s ? `${Math.floor(s/60)}분 ${s%60}초` : '-';
  const riskColor = { '높음': '#ef4444', '보통': '#f59e0b', '낮음': '#10b981' };
  const toneColor = { '불안': '#7c3aed', '불만': '#ef4444', '차분': '#10b981', '적극적': '#3b82f6' };

  return (
    <div className="summary-container">
      <div className="summary-card">
        <div className="summary-success">
          <div className="success-icon">✅</div>
          <h2>상담이 성공적으로 종료되었습니다</h2>
          <p>AI가 분석한 상담 내용을 확인하세요</p>
        </div>

        <div className="summary-meta">
          <span>📅 {data?.date}</span>
          <span>⏱ {fmtDur(data?.duration)}</span>
          <span>🆔 {roomId?.slice(-8)}</span>
        </div>

        {data?.analysis ? (
          <>
            <div className="summary-section">
              <h3>📝 상담 요약</h3>
              <p className="summary-text">{data.analysis.summary}</p>
            </div>

            <div className="summary-section">
              <h3>🔍 분석 결과</h3>
              <div className="badge-row">
                <span className="s-badge" style={{background: toneColor[data.analysis.customerTone] || '#6b7280'}}>
                  감정: {data.analysis.customerTone}
                </span>
                <span className="s-badge" style={{background: riskColor[data.analysis.riskLevel] || '#6b7280'}}>
                  위험도: {data.analysis.riskLevel}
                </span>
              </div>
              <div className="kw-row">
                {data.analysis.keywords?.map((k,i) => <span key={i} className="kw-tag">{k}</span>)}
              </div>
            </div>

            <div className="summary-section">
              <h3>✅ 후속 조치</h3>
              <ul className="action-list">
                {data.analysis.actionItems?.map((a,i) => <li key={i}>{a}</li>)}
              </ul>
            </div>

            <div className="hint-box">
              <h3>💡 합의 방향</h3>
              <p>{data.analysis.settlementHint}</p>
            </div>
          </>
        ) : (
          <div className="no-analysis">
            <p>AI 분석 결과가 없습니다.</p>
            <p>상담 중 'AI 분석' 버튼을 클릭하면 Gemini가 분석합니다.</p>
          </div>
        )}

        <div className="summary-actions">
          <button onClick={() => navigate('/main')} className="btn-primary">🏠 메인으로</button>
          <button onClick={() => navigate('/dashboard')} className="btn-dashboard">📊 대시보드 보기</button>
          <button onClick={() => { navigate('/device-check'); }} className="btn-secondary">📹 새 상담 시작</button>
        </div>
      </div>
    </div>
  );
}
