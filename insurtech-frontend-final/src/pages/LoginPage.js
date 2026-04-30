import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './AuthPage.css';

const ROLES = [
  { value: 'adjuster', label: '손해사정사' },
  { value: 'planner', label: '보험설계사' },
  { value: 'cs', label: '보험사 CS' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('adjuster');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      const user = response.data;
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: role,
        roleLabel: ROLES.find(r => r.value === role)?.label || '손해사정사',
        serverRole: user.role
      }));
      navigate('/main');
    } catch (err) {
      // 데모 폴백: 백엔드가 없거나 해당 엔드포인트가 구현되지 않은 경우
      // (네트워크 에러 또는 404)에는 클라이언트 전용으로 진입 허용.
      const isBackendMissing = !err.response || err.response.status === 404;
      if (isBackendMissing) {
        localStorage.setItem('user', JSON.stringify({
          email,
          name: email.split('@')[0],
          role,
          roleLabel: ROLES.find(r => r.value === role)?.label || '손해사정사',
          demo: true
        }));
        navigate('/main');
        return;
      }
      const msg = err.response?.data?.error || '로그인에 실패했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
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
          <div className="form-group">
            <label>역할 선택</label>
            <div className="role-select-group">
              {ROLES.map(r => (
                <label key={r.value} className={`role-option ${role === r.value ? 'selected' : ''}`}>
                  <input
                    type="radio" name="role" value={r.value}
                    checked={role === r.value} onChange={() => setRole(r.value)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="auth-link">계정이 없으신가요? <Link to="/register">회원가입</Link></p>
      </div>
    </div>
  );
}
