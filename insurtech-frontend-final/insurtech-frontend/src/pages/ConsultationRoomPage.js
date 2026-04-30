import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { analyzeConsultation } from '../services/gemini';
import './ConsultationRoomPage.css';

export default function ConsultationRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPdf, setShowPdf] = useState(true);
  const transcriptRef = useRef(null);
  const fullTextRef = useRef('');

  const onTranscript = useCallback((text) => {
    fullTextRef.current += ' ' + text;
    setTranscript(prev => [...prev, { speaker: '🎙️', text, time: new Date().toLocaleTimeString('ko-KR') }]);
  }, []);

  const { localVideoRef, remoteVideoRef, isConnected, isMicOn, isCamOn,
    networkStatus, sttActive, toggleMic, toggleCam, startSTT, stopSTT, hangup
  } = useWebRTC(roomId, onTranscript);

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleAnalyze = async () => {
    const text = fullTextRef.current.trim() || "고객 박지훈씨가 1월 8일 신호 대기 중 후방 추돌 사고를 설명함. 경추 및 요추 통증으로 정형외과 치료 중. 보험사의 조기 합의 요청에 대한 검토를 의뢰함.";
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeConsultation(text);
      setAiAnalysis(result);
      setTranscript(prev => [...prev, { speaker: '🤖 AI', text: result.summary, time: new Date().toLocaleTimeString('ko-KR'), isAi: true }]);
    } catch (e) { console.error(e); }
    setIsAnalyzing(false);
  };

  const endCall = () => {
    hangup();
    const history = JSON.parse(localStorage.getItem('consultHistory') || '[]');
    history.unshift({
      roomId, date: new Date().toLocaleString('ko-KR'),
      title: `AI 상담 - ${new Date().toLocaleDateString('ko-KR')}`,
      transcript: transcript, analysis: aiAnalysis, duration: elapsed
    });
    localStorage.setItem('consultHistory', JSON.stringify(history));
    navigate(`/summary/${roomId}`);
  };

  const statusColor = { connected: '#10b981', connecting: '#f59e0b', local_only: '#6b7280', disconnected: '#ef4444', error: '#ef4444' };
  const statusLabel = { connected: '연결됨', connecting: '연결 중...', local_only: '로컬 모드', disconnected: '연결 끊김', error: '오류' };

  return (
    <div className="room-wrap">
      {/* ── 좌: PDF 약관 패널 ── */}
      {showPdf && (
        <aside className="panel-pdf">
          <div className="panel-hdr">
            <span>📄 약관 문서</span>
            <button className="close-btn" onClick={() => setShowPdf(false)}>✕</button>
          </div>
          <div className="pdf-scroll">
            <div className="pdf-doc">
              <h4>자동차보험 약관</h4>
              <h5>제12조 (계약의 해지)</h5>
              <p>① 계약은 아래와 같은 경우에 해지할 수 있습니다.</p>
              <p>② 제동차보험 합정한 인력이나 주자하는, 필요인에서 해제지 않을 적합 관 공고의 정확하고, 합한 고객님이 파력인에 있습니다.</p>
              <h5>제15조 (보험금 청구)</h5>
              <p>① 보험금 청구권자는 다음의 서류를 첨부하여 회사에 청구하여야 합니다.</p>
              <p>② 회사는 제출서류를 접수한 날로부터 30일 이내에 보험금을 지급합니다.</p>
              <h5>제18조 (손해배상)</h5>
              <p>① 손해배상금은 실제 발생한 손해액을 기준으로 산정합니다.</p>
              <p>② 치료비, 휴업손해, 위자료, 향후치료비 등을 포함합니다.</p>
            </div>
            {aiAnalysis?.clauseRefs && (
              <div className="clause-highlight">
                <p className="clause-title">🔍 AI 추출 관련 약관</p>
                {aiAnalysis.clauseRefs.map((c, i) => (
                  <span key={i} className="clause-tag">{c}</span>
                ))}
              </div>
            )}
          </div>
          <div className="panel-foot">
            <button className="btn-upload">📁 PDF 업로드</button>
          </div>
        </aside>
      )}

      {/* ── 중: 화상 통화 ── */}
      <main className="panel-video">
        <div className="video-topbar">
          {!showPdf && <button className="icon-btn" onClick={() => setShowPdf(true)}>📄</button>}
          <span className="room-label">방 {roomId.slice(-8)}</span>
          <span className="timer-badge">⏱ {fmt(elapsed)}</span>
          <span className="status-dot" style={{ background: statusColor[networkStatus] || '#6b7280' }}>
            ● {statusLabel[networkStatus] || networkStatus}
          </span>
          {isConnected && <span className="connected-badge">🟢 상대방 연결됨</span>}
        </div>

        {/* 원격 비디오 */}
        <div className="remote-area">
          <video ref={remoteVideoRef} autoPlay playsInline className="video-remote" />
          {!isConnected && (
            <div className="waiting-overlay">
              <div className="waiting-avatar">👤</div>
              <p>상대방 입장 대기 중...</p>
              <p className="waiting-sub">같은 방 ID를 공유해 입장하면 자동 연결됩니다</p>
              <div className="room-id-box">방 ID: <strong>{roomId}</strong></div>
            </div>
          )}
          {networkStatus === 'local_only' && (
            <div className="ws-warning">⚠️ 시그널링 서버 미연결 — 로컬 카메라만 표시</div>
          )}
        </div>

        {/* 로컬 비디오 (PIP) */}
        <div className="local-pip">
          <video ref={localVideoRef} autoPlay muted playsInline className="video-local" />
          {!isCamOn && <div className="cam-off">📷 OFF</div>}
        </div>

        {/* 컨트롤 바 */}
        <div className="ctrl-bar">
          <button className={`ctrl-btn ${isMicOn ? '' : 'off'}`} onClick={toggleMic} title="마이크">
            {isMicOn ? '🎤' : '🔇'}
          </button>
          <button className={`ctrl-btn ${isCamOn ? '' : 'off'}`} onClick={toggleCam} title="카메라">
            {isCamOn ? '📹' : '🚫'}
          </button>
          <button
            className={`ctrl-btn stt-btn ${sttActive ? 'active' : ''}`}
            onClick={sttActive ? stopSTT : startSTT}
            title="음성 인식"
          >
            {sttActive ? '🔴 STT 중지' : '🎙️ STT 시작'}
          </button>
          <button className="ctrl-btn analyze-btn" onClick={handleAnalyze} disabled={isAnalyzing} title="AI 분석">
            {isAnalyzing ? '⏳ 분석 중...' : '🤖 AI 분석'}
          </button>
          <button className="ctrl-btn end-btn" onClick={endCall} title="통화 종료">📵 종료</button>
        </div>
      </main>

      {/* ── 우: AI 분석 패널 ── */}
      <aside className="panel-ai">
        <div className="panel-hdr">🤖 AI 실시간 분석</div>

        {/* 실시간 STT 스크립트 */}
        <div className="ai-section">
          <div className="section-title">📝 실시간 대화 기록</div>
          <div className="transcript-box" ref={transcriptRef}>
            {transcript.length === 0 ? (
              <p className="empty-msg">STT 시작 버튼을 누르면 음성이 자동으로 텍스트로 변환됩니다</p>
            ) : transcript.map((t, i) => (
              <div key={i} className={`transcript-row ${t.isAi ? 'ai-row' : ''}`}>
                <span className="t-speaker">{t.speaker}</span>
                <span className="t-time">{t.time}</span>
                <p className="t-text">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 분석 결과 */}
        {aiAnalysis && (
          <div className="analysis-box">
            <div className="section-title">✦ Gemini 분석 결과</div>

            <div className="analysis-summary">{aiAnalysis.summary}</div>

            <div className="analysis-row">
              <span className="a-label">고객 감정</span>
              <span className={`tone-badge tone-${aiAnalysis.customerTone}`}>{aiAnalysis.customerTone}</span>
              <span className="a-label" style={{marginLeft:8}}>위험도</span>
              <span className={`risk-badge risk-${aiAnalysis.riskLevel}`}>{aiAnalysis.riskLevel}</span>
            </div>

            <div className="keywords-wrap">
              {aiAnalysis.keywords?.map((k, i) => <span key={i} className="kw-tag">{k}</span>)}
            </div>

            <div className="a-label" style={{marginTop:8}}>후속 조치</div>
            <ul className="action-list">
              {aiAnalysis.actionItems?.map((a, i) => <li key={i}>→ {a}</li>)}
            </ul>

            <div className="settlement-hint">
              💡 {aiAnalysis.settlementHint}
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="analyzing-spinner">
            <div className="spinner" />
            <p>Gemini AI 분석 중...</p>
          </div>
        )}

        <button className="btn-analyze-full" onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? '분석 중...' : '✦ AI 전체 분석 실행'}
        </button>
      </aside>
    </div>
  );
}
