import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({ total: 0, avgDuration: 0, toneMap: {}, riskMap: {}, topKeywords: [] });

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('consultHistory') || '[]');
    setHistory(h);
    if (h.length > 0) {
      const toneMap = {}, riskMap = {}, kwCount = {};
      let totalDur = 0;
      h.forEach(c => {
        totalDur += c.duration || 0;
        const a = c.analysis;
        if (a) {
          toneMap[a.customerTone] = (toneMap[a.customerTone] || 0) + 1;
          riskMap[a.riskLevel] = (riskMap[a.riskLevel] || 0) + 1;
          (a.keywords || []).forEach(k => { kwCount[k] = (kwCount[k] || 0) + 1; });
        }
      });
      const topKeywords = Object.entries(kwCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ k, v }));
      setStats({ total: h.length, avgDuration: Math.round(totalDur / h.length), toneMap, riskMap, topKeywords });
      setSelected(h[0]);
    }
  }, []);

  const fmtDur = s => s ? `${Math.floor(s/60)}분 ${s%60}초` : '-';
  const riskColor = { '높음': '#ef4444', '보통': '#f59e0b', '낮음': '#10b981' };
  const toneColor = { '불안': '#7c3aed', '불만': '#ef4444', '차분': '#10b981', '적극적': '#3b82f6' };

  return (
    <div className="dash-wrap">
      {/* 사이드바 */}
      <nav className="dash-nav">
        <div className="nav-logo">📊 분석 대시보드</div>
        <button className="nav-item active">📈 전체 현황</button>
        <button className="nav-item" onClick={() => navigate('/main')}>🏠 메인으로</button>
        <button className="nav-item" onClick={() => navigate('/device-check')}>📹 새 상담</button>
      </nav>

      <div className="dash-main">
        {/* 상단 통계 카드 */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{stats.total}</div>
            <div className="stat-label">총 상담 건수</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{fmtDur(stats.avgDuration)}</div>
            <div className="stat-label">평균 상담 시간</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{color:'#ef4444'}}>{stats.riskMap['높음'] || 0}</div>
            <div className="stat-label">고위험 케이스</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{color:'#10b981'}}>{stats.riskMap['낮음'] || 0}</div>
            <div className="stat-label">저위험 케이스</div>
          </div>
        </div>

        <div className="dash-body">
          {/* 좌: 상담 목록 + 차트 */}
          <div className="dash-left">
            {/* 고객 감정 분포 */}
            <div className="card">
              <h3>고객 감정 분포</h3>
              <div className="bar-chart">
                {Object.entries(stats.toneMap).map(([tone, cnt]) => (
                  <div key={tone} className="bar-row">
                    <span className="bar-label">{tone}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(cnt / stats.total) * 100}%`, background: toneColor[tone] || '#6b7280' }} />
                    </div>
                    <span className="bar-cnt">{cnt}건</span>
                  </div>
                ))}
                {Object.keys(stats.toneMap).length === 0 && <p className="empty">데이터 없음</p>}
              </div>
            </div>

            {/* 위험도 분포 */}
            <div className="card">
              <h3>위험도 분포</h3>
              <div className="risk-pills">
                {['높음','보통','낮음'].map(r => (
                  <div key={r} className="risk-pill" style={{borderColor: riskColor[r]}}>
                    <span className="risk-dot" style={{background: riskColor[r]}} />
                    <span>{r}</span>
                    <span className="risk-count">{stats.riskMap[r] || 0}건</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 자주 등장 키워드 */}
            <div className="card">
              <h3>주요 키워드 TOP 8</h3>
              <div className="kw-cloud">
                {stats.topKeywords.map((item, i) => (
                  <span key={i} className="kw-chip" style={{ fontSize: `${12 + item.v * 2}px`, opacity: 0.7 + item.v * 0.1 }}>
                    {item.k} <em>{item.v}</em>
                  </span>
                ))}
                {stats.topKeywords.length === 0 && <p className="empty">데이터 없음</p>}
              </div>
            </div>

            {/* 상담 목록 */}
            <div className="card">
              <h3>상담 이력</h3>
              <div className="consult-list">
                {history.map((h, i) => (
                  <div key={i} className={`consult-row ${selected?.roomId === h.roomId ? 'selected' : ''}`} onClick={() => setSelected(h)}>
                    <div className="c-info">
                      <span className="c-title">{h.title}</span>
                      <span className="c-date">{h.date}</span>
                    </div>
                    <div className="c-badges">
                      {h.analysis && (
                        <>
                          <span className="tone-mini" style={{background: toneColor[h.analysis.customerTone]}}>{h.analysis.customerTone}</span>
                          <span className="risk-mini" style={{background: riskColor[h.analysis.riskLevel]}}>{h.analysis.riskLevel}</span>
                        </>
                      )}
                      <span className="dur-mini">{fmtDur(h.duration)}</span>
                    </div>
                  </div>
                ))}
                {history.length === 0 && <p className="empty">상담 이력이 없습니다</p>}
              </div>
            </div>
          </div>

          {/* 우: 선택 상담 상세 분석 */}
          <div className="dash-right">
            {selected ? (
              <>
                <div className="card detail-header">
                  <h2>{selected.title}</h2>
                  <p className="detail-date">{selected.date} · {fmtDur(selected.duration)}</p>
                </div>

                {selected.analysis ? (
                  <>
                    <div className="card">
                      <h3>📝 AI 요약</h3>
                      <p className="summary-text">{selected.analysis.summary}</p>
                    </div>

                    <div className="card">
                      <h3>🔍 분석 지표</h3>
                      <div className="metric-grid">
                        <div className="metric">
                          <span className="metric-label">고객 감정</span>
                          <span className="metric-val" style={{color: toneColor[selected.analysis.customerTone]}}>{selected.analysis.customerTone}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">위험도</span>
                          <span className="metric-val" style={{color: riskColor[selected.analysis.riskLevel]}}>{selected.analysis.riskLevel}</span>
                        </div>
                      </div>
                      <div className="kw-cloud" style={{marginTop:12}}>
                        {selected.analysis.keywords?.map((k,i) => <span key={i} className="kw-chip">{k}</span>)}
                      </div>
                    </div>

                    <div className="card">
                      <h3>📋 관련 약관</h3>
                      <div className="clause-list">
                        {selected.analysis.clauseRefs?.map((c,i) => <div key={i} className="clause-item">📌 {c}</div>)}
                      </div>
                    </div>

                    <div className="card">
                      <h3>✅ 후속 조치 항목</h3>
                      <ul className="action-ul">
                        {selected.analysis.actionItems?.map((a,i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>

                    <div className="card settlement-card">
                      <h3>💡 합의 방향 제안</h3>
                      <p>{selected.analysis.settlementHint}</p>
                    </div>
                  </>
                ) : (
                  <div className="card">
                    <p className="empty">AI 분석 결과가 없습니다. 상담 중 AI 분석을 실행해주세요.</p>
                  </div>
                )}

                {/* 대화 기록 */}
                {selected.transcript?.length > 0 && (
                  <div className="card">
                    <h3>🎙️ 대화 기록</h3>
                    <div className="transcript-detail">
                      {selected.transcript.map((t,i) => (
                        <div key={i} className={`td-row ${t.isAi ? 'ai' : ''}`}>
                          <span className="td-speaker">{t.speaker}</span>
                          <span className="td-time">{t.time}</span>
                          <p className="td-text">{t.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card empty-detail">
                <p>좌측에서 상담 이력을 선택하면 상세 분석을 확인할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
