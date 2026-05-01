import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SCENARIOS } from '../data/educationData';
import './EducationPage.css';
import './EducationScenarioPage.css';

export default function EducationScenarioPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const scenario = SCENARIOS[id];
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [currentStage, setCurrentStage] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [firstTryCorrect, setFirstTryCorrect] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (scenario) {
      const len = scenario.stages.length;
      setAttempts(new Array(len).fill(0));
      setFirstTryCorrect(new Array(len).fill(false));
      setCurrentStage(0);
      setSelectedIdx(null);
      setCompleted(false);
    }
  }, [id, scenario]);

  const Navbar = () => (
    <nav className="edu-nav">
      <div className="edu-nav-logo">📹 AI 약관 도우미</div>
      <div className="edu-nav-right">
        {user?.roleLabel && <span className="edu-role-badge">{user.roleLabel}</span>}
        <span className="edu-nav-user">👤 {user?.name || '데모 사용자'}님</span>
        <button onClick={() => navigate('/main')} className="edu-btn-back">← 메인으로</button>
      </div>
    </nav>
  );

  if (!scenario) {
    return (
      <div className="edu-container">
        <Navbar />
        <div className="edu-not-found">
          <div className="edu-not-found-card">
            <div className="edu-not-found-emoji">🤔</div>
            <h2>시나리오를 찾을 수 없습니다</h2>
            <p>존재하지 않는 시나리오 ID입니다.</p>
            <button onClick={() => navigate('/education')} className="edu-btn-primary">
              시나리오 목록으로 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stage = scenario.stages[currentStage];
  const totalStages = scenario.stages.length;
  const isCorrect = selectedIdx !== null && selectedIdx === stage.correctIndex;
  const showWrong = selectedIdx !== null && !isCorrect;
  const progressPct = (currentStage / totalStages) * 100;

  const handleSelect = (idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    const newAttempts = [...attempts];
    newAttempts[currentStage] += 1;
    setAttempts(newAttempts);
    if (idx === stage.correctIndex && newAttempts[currentStage] === 1) {
      const newFirst = [...firstTryCorrect];
      newFirst[currentStage] = true;
      setFirstTryCorrect(newFirst);
    }
  };

  const handleRetry = () => setSelectedIdx(null);

  const handleNext = () => {
    if (currentStage < totalStages - 1) {
      setCurrentStage(currentStage + 1);
      setSelectedIdx(null);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentStage(0);
    setSelectedIdx(null);
    setAttempts(new Array(totalStages).fill(0));
    setFirstTryCorrect(new Array(totalStages).fill(false));
    setCompleted(false);
  };

  if (completed) {
    const perfect = firstTryCorrect.filter(Boolean).length;
    const totalAttempts = attempts.reduce((a, b) => a + b, 0);
    let subtitle;
    if (perfect === totalStages) subtitle = "완벽합니다! 모든 단계를 한 번에 통과하셨어요. 🏆";
    else if (perfect >= Math.ceil(totalStages / 2)) subtitle = "잘하셨습니다! 몇 번의 시도 끝에 모든 단계를 통과했어요.";
    else subtitle = "수고하셨습니다. 오답을 통해 더 많이 배우셨을 거예요. 한 번 더 도전해 보세요!";

    return (
      <div className="edu-container">
        <Navbar />
        <div className="edu-player-wrap">
          <div className="edu-result-card">
            <div className="edu-result-emoji">🎉</div>
            <h1 className="edu-result-title">시나리오 완료!</h1>
            <p className="edu-result-subtitle">{subtitle}</p>

            <div className="edu-result-stats">
              <div className="edu-stat-box">
                <div className="edu-stat-num">{totalStages}</div>
                <div className="edu-stat-label">총 단계</div>
              </div>
              <div className="edu-stat-box">
                <div className="edu-stat-num good">{perfect}</div>
                <div className="edu-stat-label">한 번에 정답</div>
              </div>
              <div className="edu-stat-box">
                <div className="edu-stat-num warn">{totalAttempts}</div>
                <div className="edu-stat-label">총 시도 횟수</div>
              </div>
            </div>

            <div className="edu-summary-list">
              {scenario.stages.map((s, i) => {
                const correct = s.choices[s.correctIndex];
                return (
                  <div
                    key={i}
                    className={'edu-summary-item' + (firstTryCorrect[i] ? '' : ' imperfect')}
                  >
                    <div className="edu-summary-meta">
                      단계 {i + 1} · {firstTryCorrect[i] ? '한 번에 정답 ✅' : `시도 ${attempts[i]}회`}
                    </div>
                    <div className="edu-summary-answer">
                      정답: {correct.label}. {correct.text}
                    </div>
                    <div className="edu-summary-feedback">{correct.feedback}</div>
                  </div>
                );
              })}
            </div>

            <div className="edu-result-actions">
              <button onClick={handleRestart} className="edu-btn-outline">🔄 처음부터 다시</button>
              <button onClick={() => navigate('/education')} className="edu-btn-primary">
                시나리오 목록 →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edu-container">
      <Navbar />
      <div className="edu-player-wrap">
        <div className="edu-player-header">
          <h1 className="edu-player-title">
            <span className="edu-player-emoji">{scenario.emoji}</span>
            {scenario.title}
          </h1>
          <div className="edu-stage-indicator">
            단계 <strong>{currentStage + 1}</strong> / {totalStages}
          </div>
        </div>

        <div className="edu-progress-bar">
          <div className="edu-progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>

        <div className="edu-situation-card">
          <div className="edu-situation-label">📍 상황</div>
          <p className="edu-situation-text">{stage.situation}</p>
        </div>

        <div className="edu-choices-card">
          <div className="edu-choices-title">👉 어떻게 하시겠습니까?</div>
          {stage.choices.map((choice, idx) => {
            const isSelected = selectedIdx === idx;
            const thisIsCorrect = idx === stage.correctIndex;
            let cls = 'edu-choice-btn';
            if (isSelected) cls += thisIsCorrect ? ' correct' : ' wrong';
            return (
              <button
                key={idx}
                className={cls}
                disabled={selectedIdx !== null}
                onClick={() => handleSelect(idx)}
              >
                <span className="edu-choice-label">{choice.label}</span>
                <span className="edu-choice-text">{choice.text}</span>
              </button>
            );
          })}
        </div>

        {selectedIdx !== null && (
          <div className={'edu-feedback-box ' + (isCorrect ? 'correct' : 'wrong')}>
            <div className="edu-feedback-header">
              {isCorrect ? '✅ 정답!' : '❌ 다시 생각해 보세요'}
            </div>
            <div className="edu-feedback-body">{stage.choices[selectedIdx].feedback}</div>
          </div>
        )}

        <div className="edu-action-row">
          {showWrong && (
            <button onClick={handleRetry} className="edu-btn-outline">🔄 다시 시도</button>
          )}
          {isCorrect && (
            <button onClick={handleNext} className="edu-btn-primary">
              {currentStage < totalStages - 1 ? '다음 단계 →' : '결과 보기 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
