import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '', name: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    localStorage.setItem('user', JSON.stringify({ email: form.email, name: form.name }));
    navigate('/main');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">📹</span>
          <h1>AI 원격 상담 솔루션</h1>
          <p>전문적인 AI 기반 원격 상담 플랫폼</p>
        </div>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>이름</label>
            <input type="text" placeholder="홍길동"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>이메일</label>
            <input type="email" placeholder="name@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input type="password" placeholder="영문, 숫자, 특수문자 조합 8자 이상"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>비밀번호 확인</label>
            <input type="password" placeholder="••••••••"
              value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
            {form.confirm && form.password !== form.confirm &&
              <span className="field-error">비밀번호가 일치하지 않습니다.</span>}
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary full-width"
            disabled={form.confirm && form.password !== form.confirm}>회원가입</button>
        </form>
        <p className="auth-link">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </div>
  );
}
