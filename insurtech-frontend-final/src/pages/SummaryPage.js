import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionApi, exportApi, notificationApi } from '../services/api';
import './SummaryPage.css';

const INSURANCE_LABELS = { TRAFFIC: '교통사고', INJURY: '상해', FIRE: '화재', LIFE: '생명' };

export default function SummaryPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));

    // Try backend first, then localStorage
    const loadData = async () => {
      try {
        const response = await sessionApi.getSession(roomId);
        if (response.data) {
          const s = response.data;
          setData({
            roomId: s.roomId,
            title: s.title,
            date: s.sessionDate || s.createdAt,
            insuranceType: s.insuranceType,
            duration: s.duration,
            transcript: s.transcript ? JSON.parse(s.transcript) : [],
            analysis: s.aiAnalysis ? JSON.parse(s.aiAnalysis) : null,
            keywords: s.keywords ? s.keywords.split(',') : []
          });
          return;
        }
      } catch (e) {
        console.log('Backend session load failed, using localStorage');
      }

      // Fallback to localStorage
      const history = JSON.parse(localStorage.getItem('consultHistory') || '[]');
      const found = history.find(h => h.roomId === roomId);
      setData(found || null);
    };
    loadData();
  }, [roomId]);

  const formatDuration = (s) => {
    if (!s) return '-';
    return `${Math.floor(s / 60)}분 ${s % 60}초`;
  };

  const analysis = data?.analysis || null;
  const transcriptEntries = data?.transcript || [];

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await exportApi.downloadPdf(roomId);
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `consultation-report-${roomId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showNotif('success', 'PDF 다운로드 완료');
    } catch (e) {
      console.error('PDF download failed:', e);
      // Fallback to print
      window.print();
      showNotif('info', 'PDF 생성 실패 - 인쇄 모드로 대체합니다');
    }
  };

  const handleDownloadDocx = () => {
    // Client-side DOCX generation using existing data
    const content = generateDocxContent();
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-report-${roomId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotif('success', '문서 다운로드 완료');
  };

  const generateDocxContent = () => {
    let content = '=== AI 보험 상담 보고서 ===\n\n';
    content += `상담 일시: ${data?.date || '-'}\n`;
    content += `담당자: ${user?.name || '-'} (${user?.roleLabel || '-'})\n`;
    content += `보험 유형: ${INSURANCE_LABELS[data?.insuranceType] || '교통사고'}\n`;
    content += `상담 시간: ${formatDuration(data?.duration)}\n\n`;

    if (analysis) {
      content += '--- AI 분석 요약 ---\n';
      content += `${analysis.summary}\n\n`;
      content += `고객 감정: ${analysis.customerTone}\n`;
      content += `위험도: ${analysis.riskLevel}\n`;
      content += `합의 방향: ${analysis.settlementHint}\n\n`;

      if (analysis.keywords?.length) {
        content += `핵심 키워드: ${analysis.keywords.join(', ')}\n\n`;
      }
      if (analysis.actionItems?.length) {
        content += '후속 조치:\n';
        analysis.actionItems.forEach((a, i) => content += `  ${i + 1}. ${a}\n`);
        content += '\n';
      }
      if (analysis.clauseRefs?.length) {
        content += `관련 약관: ${analysis.clauseRefs.join(', ')}\n\n`;
      }
    }

    if (transcriptEntries.length > 0) {
      content += '--- 상담 대화 내역 ---\n';
      transcriptEntries.forEach(t => {
        content += `[${t.time}] ${t.speaker}: ${t.text}\n`;
      });
    }

    content += `\n---\n본 보고서는 AI에 의해 자동 생성되었습니다.\n생성일: ${new Date().toLocaleString('ko-KR')}`;
    return content;
  };

  const handleSendEmail = async () => {
    if (!emailTo) return;
    setSending(true);
    try {
      const response = await notificationApi.sendEmail({
        to: emailTo,
        subject: `AI 보험 상담 보고서 - ${data?.title || roomId}`,
        roomId: roomId
      });
      if (response.data.success) {
        showNotif('success', '이메일이 발송되었습니다');
      } else {
        showNotif('warning', response.data.message || '이메일 발송 실패 - SMTP 설정을 확인하세요');
      }
    } catch (e) {
      showNotif('error', '이메일 발송 실패');
    }
    setSending(false);
    setShowEmailModal(false);
  };

  const handleSendTelegram = async () => {
    if (!telegramChatId) return;
    setSending(true);
    try {
      const message = `📋 AI 보험 상담 보고서\n\n` +
        `📅 일시: ${data?.date || '-'}\n` +
        `🏷️ 유형: ${INSURANCE_LABELS[data?.insuranceType] || '교통사고'}\n` +
        `⏱ 시간: ${formatDuration(data?.duration)}\n\n` +
        (analysis ? `📊 요약: ${analysis.summary}\n\n` +
        `💡 합의 방향: ${analysis.settlementHint}\n` +
        `⚠️ 위험도: ${analysis.riskLevel}` : '분석 데이터 없음');

      const response = await notificationApi.sendTelegram({
        chatId: telegramChatId,
        message: message
      });
      if (response.data.success) {
        showNotif('success', '텔레그램 발송 완료');
      } else {
        showNotif('warning', response.data.message || '텔레그램 발송 실패 - 봇 토큰을 확인하세요');
      }
    } catch (e) {
      showNotif('error', '텔레그램 발송 실패');
    }
    setSending(false);
    setShowTelegramModal(false);
  };

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="summary-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`notif-toast notif-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>📧 이메일로 보고서 전송</h3>
            <input type="email" placeholder="수신자 이메일" value={emailTo}
              onChange={e => setEmailTo(e.target.value)} />
            <div className="modal-actions">
              <button onClick={handleSendEmail} disabled={sending || !emailTo}>
                {sending ? '발송 중...' : '전송'}
              </button>
              <button onClick={() => setShowEmailModal(false)} className="btn-cancel-modal">취소</button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Modal */}
      {showTelegramModal && (
        <div className="modal-overlay" onClick={() => setShowTelegramModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>📱 텔레그램으로 보고서 전송</h3>
            <input type="text" placeholder="텔레그램 Chat ID" value={telegramChatId}
              onChange={e => setTelegramChatId(e.target.value)} />
            <div className="modal-actions">
              <button onClick={handleSendTelegram} disabled={sending || !telegramChatId}>
                {sending ? '발송 중...' : '전송'}
              </button>
              <button onClick={() => setShowTelegramModal(false)} className="btn-cancel-modal">취소</button>
            </div>
          </div>
        </div>
      )}

      <nav className="summary-nav no-print">
        <span className="nav-logo">📹 AI 약관 도우미</span>
        <button onClick={() => navigate('/main')} className="back-btn">← 메인으로</button>
      </nav>

      <div className="summary-content">
        {/* 상단 성공 배너 */}
        <div className="success-banner no-print">
          <div className="success-icon">✅</div>
          <div>
            <h2>상담이 성공적으로 종료되었습니다</h2>
            <p>AI가 분석한 상담 내용을 확인하세요</p>
          </div>
          <div className="summary-meta-right">
            <span>📅 {data?.date || '-'}</span>
            <span>⏱ {formatDuration(data?.duration)}</span>
          </div>
        </div>

        {/* ── 인쇄용 보고서 영역 ── */}
        <div className="print-report">
          <div className="report-header">
            <h1>AI 보험 상담 보고서</h1>
            <div className="report-meta">
              <div className="report-meta-row">
                <span className="meta-label">상담 일시</span>
                <span className="meta-value">{data?.date || '-'}</span>
              </div>
              <div className="report-meta-row">
                <span className="meta-label">담당자</span>
                <span className="meta-value">{user?.name || '-'} ({user?.roleLabel || '-'})</span>
              </div>
              <div className="report-meta-row">
                <span className="meta-label">보험 유형</span>
                <span className="meta-value">{INSURANCE_LABELS[data?.insuranceType] || '교통사고'}</span>
              </div>
              <div className="report-meta-row">
                <span className="meta-label">상담 시간</span>
                <span className="meta-value">{formatDuration(data?.duration)}</span>
              </div>
            </div>
          </div>

          {analysis && (
            <>
              <div className="report-section">
                <h2>1. AI 분석 요약</h2>
                <p className="report-summary-text">{analysis.summary}</p>
              </div>
              <div className="report-section">
                <h2>2. 핵심 키워드</h2>
                <div className="report-keywords">
                  {analysis.keywords?.map((kw, i) => <span key={i} className="report-kw">{kw}</span>)}
                </div>
              </div>
              <div className="report-section">
                <h2>3. 관련 약관 조항</h2>
                <ul className="report-list">
                  {analysis.clauseRefs?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div className="report-section report-two-col">
                <div>
                  <h2>4. 고객 감정 상태</h2>
                  <span className={`report-badge tone-print-${analysis.customerTone}`}>{analysis.customerTone}</span>
                </div>
                <div>
                  <h2>5. 위험도</h2>
                  <span className={`report-badge risk-print-${analysis.riskLevel}`}>{analysis.riskLevel}</span>
                </div>
              </div>
              <div className="report-section">
                <h2>6. 후속 조치 항목</h2>
                <ul className="report-list">
                  {analysis.actionItems?.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
              <div className="report-section">
                <h2>7. 합의 방향 제안</h2>
                <p className="report-settlement">{analysis.settlementHint}</p>
              </div>
            </>
          )}

          {!analysis && (
            <div className="report-section">
              <p>AI 분석 데이터가 없습니다. 상담 중 AI 분석을 실행해주세요.</p>
            </div>
          )}

          <div className="report-footer">
            <p>본 보고서는 AI(Gemini)에 의해 자동 생성되었으며, 참고 용도로만 사용하시기 바랍니다.</p>
            <p>생성일: {new Date().toLocaleString('ko-KR')}</p>
          </div>
        </div>

        <div className="summary-grid no-print">
          {/* 상담 통계 */}
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-num">{transcriptEntries.filter(t => !t.isAi).length}</span>
              <span className="stat-label">음성 인식 수</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{transcriptEntries.filter(t => t.isAi).length}</span>
              <span className="stat-label">AI 분석 수</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{analysis?.keywords?.length || 0}</span>
              <span className="stat-label">감지 키워드</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{formatDuration(data?.duration)}</span>
              <span className="stat-label">상담 시간</span>
            </div>
          </div>

          {analysis?.keywords?.length > 0 && (
            <div className="card">
              <h3>🔍 감지된 키워드</h3>
              <div className="keyword-list">
                {analysis.keywords.map((kw, i) => <span key={i} className="kw-badge">{kw}</span>)}
              </div>
            </div>
          )}

          {analysis && (
            <div className="card">
              <h3>📊 AI 분석 리포트</h3>
              <div className="analysis-items">
                <div className="analysis-row"><span className="analysis-label">고객 감정</span><span className="analysis-value">{analysis.customerTone}</span></div>
                <div className="analysis-row"><span className="analysis-label">위험도</span><span className="analysis-value">{analysis.riskLevel}</span></div>
                <div className="analysis-row"><span className="analysis-label">합의 방향</span><span className="analysis-value">{analysis.settlementHint}</span></div>
                <div className="analysis-row"><span className="analysis-label">보험 유형</span><span className="analysis-value">{INSURANCE_LABELS[data?.insuranceType] || '교통사고'}</span></div>
              </div>
              {analysis.actionItems?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>후속 조치</h4>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {analysis.actionItems.map((a, i) => <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="card chat-record">
            <h3>💬 상담 대화 내역</h3>
            <div className="chat-log">
              {transcriptEntries.length > 0 ? (
                transcriptEntries.map((t, i) => (
                  <div key={i} className={`log-row ${t.isAi ? 'ai' : 'user'}`}>
                    <span className="log-role">{t.speaker}</span>
                    <p className="log-text">{t.text}</p>
                  </div>
                ))
              ) : (
                <p className="empty-text">대화 내역이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="summary-actions no-print">
          <button onClick={() => navigate('/main')} className="btn-primary">🏠 메인으로</button>
          <button onClick={handleDownloadPdf} className="btn-report">📄 PDF 다운로드</button>
          <button onClick={handleDownloadDocx} className="btn-report">📝 텍스트 문서</button>
          <button onClick={handlePrintReport} className="btn-report">🖨️ 인쇄</button>
          <button onClick={() => setShowEmailModal(true)} className="btn-email">📧 이메일 전송</button>
          <button onClick={() => setShowTelegramModal(true)} className="btn-telegram">📱 텔레그램 전송</button>
        </div>
      </div>
    </div>
  );
}
