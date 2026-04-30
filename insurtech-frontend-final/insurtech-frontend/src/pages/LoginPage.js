import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    // 임시 로그인 (나중에 API 연동)
    if (email && password) {
      localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
      navigate('/main');
    } else {
      setError('이메일과 비밀번호를 입력해주세요.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">📹</span>
          <h1>AI 원격 상담 솔루션</h1>
          <p>전문적인 AI 기반 원격 상담 플랫폼</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email" placeholder="name@company.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary full-width">로그인</button>
        </form>
        <p className="auth-link">계정이 없으신가요? <Link to="/register">회원가입</Link></p>
      </div>
    </div>
  );
}
