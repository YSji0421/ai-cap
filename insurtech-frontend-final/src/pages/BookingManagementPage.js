import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationApi, notificationApi } from '../services/api';
import './BookingPage.css';

const STATUS_LABELS = {
  PENDING: { text: '대기중', color: '#f59e0b', bg: '#fefce8' },
  CONFIRMED: { text: '확정', color: '#10b981', bg: '#f0fdf4' },
  CANCELLED: { text: '취소됨', color: '#ef4444', bg: '#fef2f2' },
  COMPLETED: { text: '완료', color: '#6b7280', bg: '#f9fafb' },
};

const TYPE_LABELS = { TRAFFIC: '교통사고', INJURY: '상해', FIRE: '화재', LIFE: '생명' };

export default function BookingManagementPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReservations(); }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const response = await reservationApi.getAll();
      setReservations(response.data || []);
    } catch (e) {
      console.error('Failed to load reservations:', e);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await reservationApi.updateStatus(id, status);

      // Send Telegram notification on confirmation
      if (status === 'CONFIRMED') {
        const res = reservations.find(r => r.id === id);
        if (res?.customerTelegramChatId) {
          try {
            await notificationApi.sendTelegram({
              chatId: res.customerTelegramChatId,
              message: `✅ 상담 예약이 확정되었습니다!\n📅 ${res.reservationDate} ${res.timeSlot}\n🏷️ ${TYPE_LABELS[res.insuranceType] || ''}\n🔗 상담 링크: ${window.location.origin}/room/${res.roomLink}`
            });
          } catch (e) {
            console.log('Telegram notification failed (token may not be set)');
          }
        }
      }

      loadReservations();
    } catch (e) {
      alert(e.response?.data?.error || '상태 변경에 실패했습니다.');
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm('이 예약을 취소하시겠습니까?')) return;
    try {
      await reservationApi.cancel(id);
      loadReservations();
    } catch (e) {
      alert('취소에 실패했습니다.');
    }
  };

  const filtered = filter === 'ALL' ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div className="booking-container">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate('/main')}>← 돌아가기</button>
        <h1>📋 예약 관리</h1>
        <p>총 {reservations.length}건의 예약</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(f => (
          <button key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'ALL' ? '전체' : STATUS_LABELS[f]?.text || f}
            {f !== 'ALL' && (
              <span className="filter-count">
                {reservations.filter(r => r.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reservation List */}
      {loading ? (
        <div className="loading-msg">로딩 중...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-msg-box">
          <p>예약이 없습니다.</p>
        </div>
      ) : (
        <div className="reservation-list">
          {filtered.map(res => {
            const status = STATUS_LABELS[res.status] || STATUS_LABELS.PENDING;
            return (
              <div key={res.id} className="reservation-card">
                <div className="res-top">
                  <div className="res-info">
                    <h3>{res.customerName}</h3>
                    <span className="res-type">{TYPE_LABELS[res.insuranceType] || ''}</span>
                  </div>
                  <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                    {status.text}
                  </span>
                </div>
                <div className="res-details">
                  <span>📅 {res.reservationDate}</span>
                  <span>🕐 {res.timeSlot}</span>
                  <span>📞 {res.customerPhone}</span>
                  {res.customerEmail && <span>✉️ {res.customerEmail}</span>}
                </div>
                {res.memo && <p className="res-memo">📝 {res.memo}</p>}
                {res.roomLink && res.status === 'CONFIRMED' && (
                  <div className="res-room-link">
                    🔗 <a href={`/room/${res.roomLink}`}>상담방 입장: {res.roomLink}</a>
                  </div>
                )}
                <div className="res-actions">
                  {res.status === 'PENDING' && (
                    <>
                      <button className="btn-confirm" onClick={() => updateStatus(res.id, 'CONFIRMED')}>✅ 확정</button>
                      <button className="btn-cancel" onClick={() => cancelReservation(res.id)}>❌ 취소</button>
                    </>
                  )}
                  {res.status === 'CONFIRMED' && (
                    <>
                      <button className="btn-complete" onClick={() => updateStatus(res.id, 'COMPLETED')}>✔️ 완료</button>
                      <button className="btn-cancel" onClick={() => cancelReservation(res.id)}>❌ 취소</button>
                      <button className="btn-enter" onClick={() => navigate(`/room/${res.roomLink}`)}>🚪 상담방</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
