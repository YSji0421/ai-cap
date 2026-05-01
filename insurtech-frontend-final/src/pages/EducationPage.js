import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIOS } from '../data/educationData';
import './EducationPage.css';

export default function EducationPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="edu-container">
      <nav className="edu-nav">
        <div className="edu-nav-logo">📹 AI 약관 도우미</div>
        <div className="edu-nav-right">
          {user?.roleLabel && <span className="edu-role-badge">{user.roleLabel}</span>}
          <span className="edu-nav-user">👤 {user?.name || '데모 사용자'}님</span>
          <button onClick={() => navigate('/main')} className="edu-btn-back">← 메인으로</button>
        </div>
      </nav>

      <div className="edu-hero">
        <h1>🛡️ 안전교육 체험</h1>
        <p>실제 위기 상황을 단계별로 시뮬레이션하며 안전한 판단을 연습해 보세요.</p>
      </div>

      <div className="edu-content">
        <div className="edu-intro">
          <div className="edu-intro-title">📖 진행 방식</div>
          <p>각 시나리오는 여러 단계로 구성됩니다. 상황에 맞는 선택지를 고르면 즉시 피드백이 표시되며, 정답을 맞히면 다음 단계로 진행합니다. 부담 없이 여러 번 시도해 보세요!</p>
        </div>

        <div className="edu-grid">
          {Object.entries(SCENARIOS).map(([id, scenario]) => (
            <div
              key={id}
              className="edu-card"
              onClick={() => navigate(`/education/${id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="edu-card-emoji">{scenario.emoji}</div>
              <h3 className="edu-card-title">{scenario.title}</h3>
              <p className="edu-card-summary">{scenario.summary}</p>
              <div className="edu-card-footer">
                <span className="edu-card-meta">총 {scenario.stages.length}단계</span>
                <span className="edu-card-cta">체험 시작 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
