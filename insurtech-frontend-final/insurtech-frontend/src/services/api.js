import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
};

export const sessionApi = {
  getSessions: () => api.get('/sessions'),
  createSession: () => api.post('/sessions'),
  getSession: (id) => api.get(`/sessions/${id}`),
  saveSession: (id, data) => api.put(`/sessions/${id}`, data),
};

export const geminiApi = {
  analyze: async (text) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `당신은 보험 약관 전문가입니다. 다음 상담 내용을 분석하여 한국어로 답변해주세요:
1. 핵심 요약 (3줄 이내)
2. 관련 약관 키워드 (쉼표로 구분)
3. 주의사항

상담 내용: ${text}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
  }
};

export default api;
