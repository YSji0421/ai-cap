import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationApi } from '../services/api';
import './BookingPage.css';

const INSURANCE_TYPES = [
  { value: 'TRAFFIC', label: '교통사고' },
  { value: 'INJURY', label: '상해' },
  { value: 'FIRE', label: '화재' },
  { value: 'LIFE', label: '생명' },
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    customerTelegramChatId: '', insuranceType: 'TRAFFIC', memo: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadSlots = async (date) => {
    try {
      const response = await reservationApi.getAvailableSlots(date, user.id || 1);
      setSlots(response.data.slots || []);
    } catch (e) {
      console.error('Failed to load slots:', e);
      // Default slots when backend unavailable
      setSlots([
        { slot: '09:00-10:00', available: true }, { slot: '10:00-11:00', available: true },
        { slot: '11:00-12:00', available: true }, { slot: '13:00-14:00', available: true },
        { slot: '14:00-15:00', available: true }, { slot: '15:00-16:00', available: true },
        { slot: '16:00-17:00', available: true }, { slot: '17:00-18:00', available: true },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      alert('날짜와 시간을 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      await reservationApi.create({
        consultantId: user.id || 1,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        customerTelegramChatId: form.customerTelegramChatId,
        insuranceType: form.insuranceType,
        reservationDate: selectedDate,
        timeSlot: selectedSlot,
        memo: form.memo
      });
      setSuccess({ date: selectedDate, slot: selectedSlot, name: form.customerName });
    } catch (e) {
      const msg = e.response?.data?.error || '예약에 실패했습니다.';
      alert(msg);
    }
    setLoading(false);
  };

  // Calendar rendering
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const formatDate = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isPast = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  if (success) {
    return (
      <div className="booking-container">
        <div className="booking-success">
          <div className="success-icon">✅</div>
          <h2>예약이 완료되었습니다!</h2>
          <div className="success-details">
            <p><strong>고객명:</strong> {success.name}</p>
            <p><strong>날짜:</strong> {success.date}</p>
            <p><strong>시간:</strong> {success.slot}</p>
          </div>
          <div className="success-actions">
            <button onClick={() => { setSuccess(null); setSelectedDate(''); setSelectedSlot(''); setForm({customerName:'',customerPhone:'',customerEmail:'',customerTelegramChatId:'',insuranceType:'TRAFFIC',memo:''}); }}>
              새 예약하기
            </button>
            <button onClick={() => navigate('/booking-manage')}>예약 관리</button>
            <button onClick={() => navigate('/main')}>메인으로</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate('/main')}>← 돌아가기</button>
        <h1>📅 상담 예약</h1>
        <p>원하는 날짜와 시간을 선택하세요</p>
      </div>

      <div className="booking-content">
        {/* Calendar */}
        <div className="calendar-section">
          <div className="calendar-nav">
            <button onClick={prevMonth}>◀</button>
            <span>{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</span>
            <button onClick={nextMonth}>▶</button>
          </div>
          <div className="calendar-grid">
            {['일','월','화','수','목','금','토'].map(d => (
              <div key={d} className="calendar-dow">{d}</div>
            ))}
            {getDaysInMonth(currentMonth).map((day, i) => (
              <div key={i}
                className={`calendar-day ${!day ? 'empty' : ''} ${isPast(day) ? 'past' : ''} ${formatDate(day) === selectedDate ? 'selected' : ''}`}
                onClick={() => day && !isPast(day) && setSelectedDate(formatDate(day))}>
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="slots-section">
              <h3>🕐 {selectedDate} 가용 시간</h3>
              <div className="slots-grid">
                {slots.map((s, i) => (
                  <button key={i}
                    className={`slot-btn ${!s.available ? 'unavailable' : ''} ${selectedSlot === s.slot ? 'selected' : ''}`}
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.slot)}>
                    {s.slot}
                    {!s.available && <span className="slot-taken">예약됨</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="booking-form-section">
          <h2>예약 정보 입력</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>고객명 *</label>
              <input type="text" required value={form.customerName}
                onChange={e => setForm({...form, customerName: e.target.value})} placeholder="이름" />
            </div>
            <div className="form-group">
              <label>연락처 *</label>
              <input type="tel" required value={form.customerPhone}
                onChange={e => setForm({...form, customerPhone: e.target.value})} placeholder="010-0000-0000" />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input type="email" value={form.customerEmail}
                onChange={e => setForm({...form, customerEmail: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>텔레그램 Chat ID (알림용)</label>
              <input type="text" value={form.customerTelegramChatId}
                onChange={e => setForm({...form, customerTelegramChatId: e.target.value})} placeholder="텔레그램 Chat ID" />
            </div>
            <div className="form-group">
              <label>보험 유형</label>
              <select value={form.insuranceType} onChange={e => setForm({...form, insuranceType: e.target.value})}>
                {INSURANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>메모</label>
              <textarea value={form.memo}
                onChange={e => setForm({...form, memo: e.target.value})}
                placeholder="상담 관련 메모" rows={3} />
            </div>

            {selectedDate && selectedSlot && (
              <div className="booking-summary">
                <p>📅 {selectedDate} | 🕐 {selectedSlot}</p>
              </div>
            )}

            <button type="submit" className="btn-book" disabled={loading || !selectedDate || !selectedSlot}>
              {loading ? '예약 중...' : '예약 확정'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
