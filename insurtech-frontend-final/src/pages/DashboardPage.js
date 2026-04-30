import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const ROLE_TITLES = {
  adjuster: '사건 분석 대시보드',
  planner: '영업 상담 대시보드',
  cs: '민원 처리 대시보드',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { navigate('/login'); return; }
    setUser(JSON.parse(u));
    setHistory(JSON.parse(localStorage.getItem('consultHistory') || '[]'));
  }, [navigate]);

  const title = ROLE_TITLES[user?.role] || '분석 대시보드';

  // 통계 계산
  const totalConsults = history.length;
  const totalDuration = history.reduce((sum, h) => sum + (h.duration || 0), 0);
  const avgDuration = totalConsults > 0 ? Math.round(totalDuration / totalConsults) : 0;

  // 감정 분석 통계
  const toneCount = {};
  const riskCount = {};
  const keywordCount = {};
  const typeCount = {};

  history.forEach(h => {
    const a = h.analysis;
    if (a?.customerTone) toneCount[a.customerTone] = (toneCount[a.customerTone] || 0) + 1;
    if (a?.riskLevel) riskCount[a.riskLevel] = (riskCount[a.riskLevel] || 0) + 1;
    if (h.insuranceType) typeCount[h.insuranceType] = (typeCount[h.insuranceType] || 0) + 1;
    (a?.keywords || h.keywords || []).forEach(kw => {
      keywordCount[kw] = (keywordCount[kw] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const INSURANCE_LABELS = { TRAFFIC: '교통사고', INJURY: '상해', FIRE: '화재', LIFE: '생명' };

  const fmtDur = (s) => s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`;

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <span className="nav-logo">📹 AI 약관 도우미</span>
        <div className="nav-right">
          {user?.roleLabel && <span className="role-badge">{user.roleLabel}</span>}
          <button onClick={() => navigate('/main')} className="back-btn">← 메인으로</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📊 {title}</h1>
          <p>{user?.name}님의 상담 분석 현황</p>
        </div>

        {/* 상단 통계 카드 */}
        <div className="dash-stat-cards">
          <div className="dash-stat-card">
            <span className="dash-stat-num">{totalConsults}</span>
            <span className="dash-stat-label">총 상담 건수</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-num">{fmtDur(totalDuration)}</span>
            <span className="dash-stat-label">총 상담 시간</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-num">{fmtDur(avgDuration)}</span>
            <span className="dash-stat-label">평균 상담 시간</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-num">{topKeywords.length}</span>
            <span className="dash-stat-label">감지 키워드 종류</span>
          </div>
        </div>

        <div className="dash-grid">
          {/* 감정 분석 */}
          <div className="dash-card">
            <h3>😊 고객 감정 분포</h3>
            {Object.keys(toneCount).length > 0 ? (
              <div className="bar-chart">
                {Object.entries(toneCount).map(([tone, count]) => (
                  <div key={tone} className="bar-row">
                    <span className="bar-label">{tone}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill tone-bar-${tone}`}
                        style={{ width: `${(count / totalConsults) * 100}%` }}
                      />
                    </div>
                    <span className="bar-count">{count}건</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-dash">상담 데이터가 없습니다.</p>
            )}
          </div>

          {/* 위험도 분포 */}
          <div className="dash-card">
            <h3>⚠️ 위험도 분포</h3>
            {Object.keys(riskCount).length > 0 ? (
              <div className="bar-chart">
                {Object.entries(riskCount).map(([risk, count]) => (
                  <div key={risk} className="bar-row">
                    <span className="bar-label">{risk}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill risk-bar-${risk}`}
                        style={{ width: `${(count / totalConsults) * 100}%` }}
                      />
                    </div>
                    <span className="bar-count">{count}건</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-dash">상담 데이터가 없습니다.</p>
            )}
          </div>

          {/* 보험 유형별 통계 */}
          <div className="dash-card">
            <h3>📋 보험 유형별 상담</h3>
            {Object.keys(typeCount).length > 0 ? (
              <div className="bar-chart">
                {Object.entries(typeCount).map(([type, count]) => (
                  <div key={type} className="bar-row">
                    <span className="bar-label">{INSURANCE_LABELS[type] || type}</span>
                    <div className="bar-track">
                      <div className="bar-fill type-bar" style={{ width: `${(count / totalConsults) * 100}%` }} />
                    </div>
                    <span className="bar-count">{count}건</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-dash">상담 데이터가 없습니다.</p>
            )}
          </div>

          {/* 핵심 키워드 */}
          <div className="dash-card">
            <h3>🔑 핵심 키워드 TOP 10</h3>
            {topKeywords.length > 0 ? (
              <div className="keyword-cloud">
                {topKeywords.map(([kw, count], i) => (
                  <span key={kw} className={`kw-chip ${i < 3 ? 'top' : ''}`}>
                    {kw} <small>({count})</small>
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-dash">키워드 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
