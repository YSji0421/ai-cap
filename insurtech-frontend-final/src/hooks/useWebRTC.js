import { useRef, useState, useEffect, useCallback } from 'react';

const WS_URL = "ws://localhost:8080/ws/signal";

export const useWebRTC = (roomId, onTranscript) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const isInitiatorRef = useRef(false);
  const pendingCandidatesRef = useRef([]);

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
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setIsConnected(true);
        setNetworkStatus('connected');
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ice', roomId, candidate: e.candidate }));
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        setIsConnected(true);
        setNetworkStatus('connected');
      } else if (state === 'disconnected' || state === 'failed') {
        setIsConnected(false);
        setNetworkStatus('disconnected');
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setIsConnected(true);
        setNetworkStatus('connected');
      }
    };

    pcRef.current = pc;
    return pc;
  }, [roomId]);

  const addBufferedCandidates = useCallback(async (pc) => {
    for (const candidate of pendingCandidatesRef.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    }
    pendingCandidatesRef.current = [];
  }, []);

  const connectWS = useCallback(async () => {
    let stream;
    try { stream = await getMedia(); } catch { setNetworkStatus('error'); return; }
    const pc = createPC(stream);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setNetworkStatus('connecting');
        ws.send(JSON.stringify({ type: 'join', roomId }));
      };

      ws.onmessage = async (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }

        if (msg.type === 'ready') {
          // Server signals that another peer joined - we are the initiator (first user)
          isInitiatorRef.current = true;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: 'offer', roomId, offer }));
          } catch (err) { console.error('Failed to create offer:', err); }
        } else if (msg.type === 'offer') {
          // We are the second user receiving an offer
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
            await addBufferedCandidates(pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', roomId, answer }));
          } catch (err) { console.error('Failed to handle offer:', err); }
        } else if (msg.type === 'answer') {
          // We are the first user receiving the answer
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
            await addBufferedCandidates(pc);
          } catch (err) { console.error('Failed to handle answer:', err); }
        } else if (msg.type === 'ice') {
          // Buffer ICE candidates if remote description not yet set
          if (pc.remoteDescription) {
            try { await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
          } else {
            pendingCandidatesRef.current.push(msg.candidate);
          }
        }
      };

      ws.onerror = () => setNetworkStatus('local_only');
      ws.onclose = () => {
        if (networkStatus !== 'connected') setNetworkStatus('local_only');
      };
    } catch { setNetworkStatus('local_only'); }

    initSTT();
  }, [roomId, getMedia, createPC, initSTT, addBufferedCandidates]);

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
