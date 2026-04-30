package com.adjuster.system.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(SignalingHandler.class);
    private final ObjectMapper mapper = new ObjectMapper();

    // roomId -> List of sessions
    private final Map<String, List<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    // sessionId -> roomId
    private final Map<String, String> sessionRoomMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket 연결: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> msg = mapper.readValue(message.getPayload(), Map.class);
        String type = (String) msg.get("type");
        String roomId = (String) msg.get("roomId");

        switch (type) {
            case "join" -> handleJoin(session, roomId);
            case "offer" -> relay(session, roomId, msg);
            case "answer" -> relay(session, roomId, msg);
            case "ice" -> relay(session, roomId, msg);
            default -> log.warn("알 수 없는 메시지 타입: {}", type);
        }
    }

    private void handleJoin(WebSocketSession session, String roomId) throws Exception {
        rooms.computeIfAbsent(roomId, k -> Collections.synchronizedList(new ArrayList<>()));
        List<WebSocketSession> room = rooms.get(roomId);

        sessionRoomMap.put(session.getId(), roomId);

        if (room.size() == 1) {
            // 두 번째 입장자 → 첫 번째 사람에게 ready 신호
            WebSocketSession first = room.get(0);
            if (first.isOpen()) {
                first.sendMessage(new TextMessage(mapper.writeValueAsString(Map.of("type", "ready", "roomId", roomId))));
            }
        }

        room.add(session);
        log.info("방 [{}] 입장: {} (총 {}명)", roomId, session.getId(), room.size());
    }

    private void relay(WebSocketSession sender, String roomId, Map<String, Object> msg) throws Exception {
        List<WebSocketSession> room = rooms.get(roomId);
        if (room == null) return;
        String json = mapper.writeValueAsString(msg);
        for (WebSocketSession s : room) {
            if (s.isOpen() && !s.getId().equals(sender.getId())) {
                s.sendMessage(new TextMessage(json));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomId = sessionRoomMap.remove(session.getId());
        if (roomId != null) {
            List<WebSocketSession> room = rooms.get(roomId);
            if (room != null) {
                room.remove(session);
                if (room.isEmpty()) rooms.remove(roomId);
            }
        }
        log.info("WebSocket 연결 종료: {}", session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket 오류 - session: {}, error: {}", session.getId(), exception.getMessage());
    }
}
