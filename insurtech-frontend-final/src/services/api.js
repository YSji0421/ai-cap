import axios from 'axios';

// 프로덕션(Vercel)에서는 REACT_APP_API_BASE_URL 환경변수로 백엔드(Railway 등) URL 지정.
// 개발(local)에서는 CRA proxy(package.json "proxy")가 /api 를 localhost:8080 으로 보낸다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  ? `${process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name, role) => api.post('/auth/register', { email, password, name, role }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const sessionApi = {
  getSessions: () => api.get('/sessions'),
  createSession: (data) => api.post('/sessions', data),
  getSession: (roomId) => api.get(`/sessions/${roomId}`),
  saveSession: (roomId, data) => api.put(`/sessions/${roomId}`, data),
};

export const faqApi = {
  search: (query, insuranceType) => api.post('/faq/search', { query, insuranceType }),
  getByType: (insuranceType) => api.get(`/faq/${insuranceType}`),
  getClauses: (insuranceType) => api.get(`/faq/clauses/${insuranceType}`),
};

export const reservationApi = {
  create: (data) => api.post('/reservations', data),
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  getAvailableSlots: (date, consultantId) => api.get('/reservations/available-slots', { params: { date, consultantId } }),
  cancel: (id) => api.delete(`/reservations/${id}`),
};

export const recommendApi = {
  recommend: (data) => api.post('/recommend', data),
  getHistory: () => api.get('/recommend/history'),
  startConsultation: (id) => api.post(`/recommend/${id}/consult`),
};

export const notificationApi = {
  sendEmail: (data) => api.post('/notifications/email/send', data),
  sendTelegram: (data) => api.post('/notifications/telegram/send', data),
  testTelegram: (chatId) => api.post('/notifications/telegram/test', { chatId }),
};

export const exportApi = {
  downloadPdf: (roomId) => api.post(`/export/pdf/${roomId}`, {}, { responseType: 'blob' }),
  downloadDocx: (roomId) => api.post(`/export/docx/${roomId}`, {}, { responseType: 'blob' }),
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
