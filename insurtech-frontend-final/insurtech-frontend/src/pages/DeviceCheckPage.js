import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeviceCheckPage.css';

export default function DeviceCheckPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDevices();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const checkDevices = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOk(true);
      setMicOk(true);
    } catch (err) {
      setError('카메라 및 마이크 접근 권한을 허용해주세요.');
      setCameraOk(false);
      setMicOk(false);
    }
    setLoading(false);
  };

  const enterRoom = () => {
    const roomId = localStorage.getItem('currentRoom') || 'room-' + Date.now();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="device-check-container">
      <div className="device-check-card">
        <div className="device-check-header">
          <h1>AI 상담 시작 전 장치 체크</h1>
          <p>카메라와 마이크가 정상적으로 작동하는지 확인해주세요.</p>
        </div>

        <div className="preview-area">
          {loading ? (
            <div className="preview-loading">장치 확인 중...</div>
          ) : error ? (
            <div className="preview-error">
              <span>🚫</span>
              <p>{error}</p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className="preview-video" />
          )}
          <div className="preview-label">Live Preview</div>
        </div>

        <div className="status-checks">
          <h3>상태 체크</h3>
          <div className="status-item">
            <span className="status-icon">📷</span>
            <span>카메라</span>
            <span className={`status-badge ${cameraOk ? 'ok' : 'fail'}`}>
              {cameraOk ? '✅ 정상 작동 중' : '❌ 권한 필요'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-icon">🎤</span>
            <span>마이크</span>
            <span className={`status-badge ${micOk ? 'ok' : 'fail'}`}>
              {micOk ? '✅ 정상 작동 중' : '❌ 권한 필요'}
            </span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        <p className="hint-text">카메라와 마이크가 정상적으로 작동하는지 확인 후 '입장하기' 버튼을 눌러주세요.</p>

        <div className="device-check-actions">
          <button onClick={() => navigate('/main')} className="btn-secondary">취소</button>
          <button onClick={enterRoom} className="btn-primary" disabled={!cameraOk || !micOk}>
            상담방 입장하기
          </button>
        </div>
      </div>
    </div>
  );
}
