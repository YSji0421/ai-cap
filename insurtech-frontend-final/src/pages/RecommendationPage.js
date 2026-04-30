import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendApi } from '../services/api';
import './RecommendationPage.css';

const RISK_CHECKLIST = [
  { id: 'traffic', label: '교통사고 걱정', icon: '🚗' },
  { id: 'health', label: '건강 불안 / 질병 걱정', icon: '🏥' },
  { id: 'cancer', label: '암 가족력 / 암 걱정', icon: '🎗️' },
  { id: 'fire', label: '화재 / 재산 위험', icon: '🔥' },
  { id: 'children', label: '자녀 안전 걱정', icon: '👶' },
  { id: 'retirement', label: '노후 / 은퇴 준비', icon: '🏖️' },
  { id: 'family', label: '가족 보장 / 가장 역할', icon: '👨‍👩‍👧‍👦' },
  { id: 'injury', label: '일상 상해 위험', icon: '🤕' },
  { id: 'medical', label: '의료비 부담', icon: '💊' },
  { id: 'property', label: '주거 / 재산 보호', icon: '🏠' },
];

const KEYWORD_MAP = {
  traffic: '교통사고 운전',
  health: '건강 질병 치료',
  cancer: '암 가족력 암진단',
  fire: '화재 건물 재산',
  children: '자녀 어린이 학교',
  retirement: '노후 은퇴 연금',
  family: '사망 가족 가장 보장',
  injury: '상해 골절 부상',
  medical: '의료비 치료비 실손',
  property: '주택 아파트 재산',
};

export default function RecommendationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: '', age: '', occupation: '' });
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [concerns, setConcerns] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [matchedRisks, setMatchedRisks] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleRisk = (id) => {
    setSelectedRisks(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const riskKeywords = selectedRisks.map(id => KEYWORD_MAP[id] || '').join(' ');
      const fullConcerns = `${concerns} ${riskKeywords}`.trim();

      const response = await recommendApi.recommend({
        concerns: fullConcerns,
        customerName: customerInfo.name,
        age: customerInfo.age ? parseInt(customerInfo.age) : null,
        occupation: customerInfo.occupation,
        riskChecklist: selectedRisks.map(id => KEYWORD_MAP[id] || id),
        userId: user.id
      });

      setRecommendations(response.data.recommendations);
      setMatchedRisks(response.data.matchedRisks || []);
      setStep(3);
    } catch (e) {
      console.error('Recommendation failed:', e);
      alert('추천 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const startConsultation = (product) => {
    const roomId = 'room-' + Date.now();
    localStorage.setItem('selectedInsuranceType', product.insuranceType);
    localStorage.setItem('recommendationContext', JSON.stringify({
      productName: product.productName,
      productId: product.productId,
      concerns: concerns,
      coverageDetails: product.coverageDetails
    }));
    navigate(`/device-check`, { state: { roomId, fromRecommendation: true } });
  };

  return (
    <div className="recommend-container">
      <div className="recommend-header">
        <button className="back-btn" onClick={() => navigate('/main')}>← 돌아가기</button>
        <h1>🛡️ AI 보험 추천</h1>
        <p>고객의 상황과 걱정을 입력하면 적합한 보험 상품을 추천합니다</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. 고객 정보</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. 고민 입력</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. 추천 결과</div>
      </div>

      {/* Step 1: Customer Info */}
      {step === 1 && (
        <div className="recommend-card">
          <h2>고객 기본 정보</h2>
          <div className="form-row">
            <div className="form-field">
              <label>고객명</label>
              <input type="text" placeholder="이름 입력"
                value={customerInfo.name}
                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
            </div>
            <div className="form-field">
              <label>나이</label>
              <input type="number" placeholder="만 나이"
                value={customerInfo.age}
                onChange={e => setCustomerInfo({...customerInfo, age: e.target.value})} />
            </div>
            <div className="form-field">
              <label>직업</label>
              <input type="text" placeholder="직업 입력"
                value={customerInfo.occupation}
                onChange={e => setCustomerInfo({...customerInfo, occupation: e.target.value})} />
            </div>
          </div>
          <button className="btn-next" onClick={() => setStep(2)}>다음 →</button>
        </div>
      )}

      {/* Step 2: Concerns Input */}
      {step === 2 && (
        <div className="recommend-card">
          <h2>어떤 점이 걱정되시나요?</h2>

          <div className="risk-checklist">
            {RISK_CHECKLIST.map(risk => (
              <div key={risk.id}
                className={`risk-item ${selectedRisks.includes(risk.id) ? 'selected' : ''}`}
                onClick={() => toggleRisk(risk.id)}>
                <span className="risk-icon">{risk.icon}</span>
                <span className="risk-label">{risk.label}</span>
                {selectedRisks.includes(risk.id) && <span className="check-mark">✓</span>}
              </div>
            ))}
          </div>

          <div className="concern-textarea">
            <label>추가 고민/상황을 자유롭게 입력해주세요</label>
            <textarea
              placeholder="예: 최근 허리 디스크 진단을 받아 수술이 필요할 수 있고, 아이가 초등학교에 다녀서 학교 사고도 걱정됩니다..."
              value={concerns}
              onChange={e => setConcerns(e.target.value)}
              rows={4}
            />
          </div>

          <div className="step-buttons">
            <button className="btn-back" onClick={() => setStep(1)}>← 이전</button>
            <button className="btn-next" onClick={handleSubmit} disabled={loading || (selectedRisks.length === 0 && !concerns.trim())}>
              {loading ? '분석 중...' : '🤖 AI 추천 받기'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Recommendations */}
      {step === 3 && recommendations && (
        <div className="recommend-card">
          <h2>🎯 추천 보험 상품 ({recommendations.length}건)</h2>

          {matchedRisks.length > 0 && (
            <div className="matched-risks">
              <h3>분석된 위험 요소</h3>
              <div className="risk-tags">
                {matchedRisks.map((r, i) => (
                  <span key={i} className="risk-tag">{r.category}</span>
                ))}
              </div>
            </div>
          )}

          <div className="product-list">
            {recommendations.map((product, i) => (
              <div key={i} className="product-card">
                <div className="product-header">
                  <span className="product-rank">#{i + 1}</span>
                  <div>
                    <h3>{product.productName}</h3>
                    <span className="product-provider">{product.provider}</span>
                  </div>
                  <span className="product-type-badge">{
                    {TRAFFIC: '교통', INJURY: '상해', FIRE: '화재', LIFE: '생명'}[product.insuranceType]
                  }</span>
                </div>
                <p className="product-desc">{product.description}</p>
                <div className="product-details">
                  <div className="detail-item">
                    <span className="detail-label">보장 내용</span>
                    <span className="detail-value">{product.coverageDetails}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">월 보험료</span>
                    <span className="detail-value premium">{product.monthlyPremiumRange}</span>
                  </div>
                </div>
                <div className="product-reason">
                  <span className="reason-label">💡 추천 이유:</span> {product.recommendReason}
                </div>
                <button className="btn-consult" onClick={() => startConsultation(product)}>
                  📞 이 상품으로 상담하기
                </button>
              </div>
            ))}
          </div>

          <div className="step-buttons">
            <button className="btn-back" onClick={() => setStep(2)}>← 다시 입력</button>
            <button className="btn-back" onClick={() => navigate('/main')}>🏠 메인으로</button>
          </div>
        </div>
      )}
    </div>
  );
}
