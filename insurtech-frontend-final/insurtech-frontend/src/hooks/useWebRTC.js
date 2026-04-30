import { useRef, useState, useEffect, useCallback } from 'react';

const WS_URL = "ws://localhost:8080/ws/signal";

export const useWebRTC = (roomId, onTranscript) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('connecting');
  const [sttActive, setSttActive] = useState(false);

  const initSTT = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'ko-KR'; r.continuous = true; r.interimResults = true;
    r.onresult = (ev) => {
      let final = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) final += ev.results[i][0].transcript;
      }
      if (final && onTranscript) onTranscript(final);
    };
    r.onerror = () => {};
    recognitionRef.current = r;
  }, [onTranscript]);

  const getMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const createPC = useCallback((stream) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0]; setIsConnected(true); setNetworkStatus('connected'); }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN)
        wsRef.current.send(JSON.stringify({ type: 'ice', roomId, candidate: e.candidate }));
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setNetworkStatus('connected');
      else if (['disconnected','failed'].includes(pc.connectionState)) setNetworkStatus('disconnected');
    };
    pcRef.current = pc;
    return pc;
  }, [roomId]);

  const connectWS = useCallback(async () => {
    let stream;
    try { stream = await getMedia(); } catch { setNetworkStatus('error'); return; }
    const pc = createPC(stream);
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({ type: 'join', roomId }));
      ws.onmessage = async (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          ws.send(JSON.stringify({ type: 'answer', roomId, answer: ans }));
        } else if (msg.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
        } else if (msg.type === 'ice') {
          await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } else if (msg.type === 'ready') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: 'offer', roomId, offer }));
        }
      };
      ws.onerror = () => setNetworkStatus('local_only');
    } catch { setNetworkStatus('local_only'); }
    initSTT();
  }, [roomId, getMedia, createPC, initSTT]);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMicOn(p => !p);
  }, []);

  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCamOn(p => !p);
  }, []);

  const startSTT = useCallback(() => { recognitionRef.current?.start(); setSttActive(true); }, []);
  const stopSTT = useCallback(() => { recognitionRef.current?.stop(); setSttActive(false); }, []);
  const hangup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close(); wsRef.current?.close(); recognitionRef.current?.stop();
  }, []);

  useEffect(() => { connectWS(); return () => hangup(); }, []);

  return { localVideoRef, remoteVideoRef, isConnected, isMicOn, isCamOn, networkStatus, sttActive, toggleMic, toggleCam, startSTT, stopSTT, hangup };
};
