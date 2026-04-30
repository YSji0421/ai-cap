import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './AuthPage.css';

const ROLES = [
  { value: 'adjuster', label: '손해사정사' },
  { value: 'planner', label: '보험설계사' },
  { value: 'cs', label: '보험사 CS' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '', name: '', role: 'adjuster' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register(form.email, form.password, form.name, form.role);
      const user = response.data;
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: form.role,
        roleLabel: ROLES.find(r => r.value === form.role)?.label || '손해사정사',
        serverRole: user.role
      }));
      navigate('/main');
    } catch (err) {
      // 데모 폴백: 백엔드가 없거나 해당 엔드포인트가 구현되지 않은 경우
      // (네트워크 에러 또는 404)에는 클라이언트 전용으로 진입 허용.
      const isBackendMissing = !err.response || err.response.status === 404;
      if (isBackendMissing) {
        localStorage.setItem('user', JSON.stringify({
          email: form.email,
          name: form.name || form.email.split('@')[0],
          role: form.role,
          roleLabel: ROLES.find(r => r.value === form.role)?.label || '손해사정사',
          demo: true
        }));
        navigate('/main');
        return;
      }
      const msg = err.response?.data?.error || '회원가입에 실패했습니다.';
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
          <div className="form-group">
            <label>역할 선택</label>
            <div className="role-select-group">
              {ROLES.map(r => (
                <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                  <input
                    type="radio" name="role" value={r.value}
                    checked={form.role === r.value} onChange={() => setForm({...form, role: r.value})}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary full-width"
            disabled={loading || (form.confirm && form.password !== form.confirm)}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-link">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </div>
  );
}
