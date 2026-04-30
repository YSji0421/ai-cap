package com.adjuster.system.controller;

import com.adjuster.system.entity.ConsultationSession;
import com.adjuster.system.service.ConsultationSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ConsultationSessionApiController {

    private final ConsultationSessionService sessionService;

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> request) {
        try {
            String roomId = (String) request.get("roomId");
            String userEmail = (String) request.get("userEmail");
            Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
            String insuranceType = (String) request.get("insuranceType");
            String title = (String) request.get("title");
            String transcript = (String) request.get("transcript");
            String aiAnalysis = (String) request.get("aiAnalysis");
            String keywords = (String) request.get("keywords");
            Integer duration = request.get("duration") != null ? Integer.valueOf(request.get("duration").toString()) : null;

            ConsultationSession session = sessionService.saveSession(
                roomId, userEmail, userId, insuranceType, title,
                transcript, aiAnalysis, keywords, duration
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ConsultationSession>> getSessions(
            @RequestParam(required = false) String email) {
        if (email != null && !email.isEmpty()) {
            return ResponseEntity.ok(sessionService.getByUserEmail(email));
        }
        return ResponseEntity.ok(sessionService.getAll());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> getSession(@PathVariable String roomId) {
        return sessionService.getByRoomId(roomId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<?> updateSession(@PathVariable String roomId,
                                           @RequestBody Map<String, Object> request) {
        try {
            // If session doesn't exist yet, create it
            if (sessionService.getByRoomId(roomId).isEmpty()) {
                String userEmail = (String) request.get("userEmail");
                Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
                String insuranceType = (String) request.get("insuranceType");
                String title = (String) request.get("title");
                String transcript = (String) request.get("transcript");
                String aiAnalysis = (String) request.get("aiAnalysis");
                String keywords = (String) request.get("keywords");
                Integer duration = request.get("duration") != null ? Integer.valueOf(request.get("duration").toString()) : null;

                ConsultationSession session = sessionService.saveSession(
                    roomId, userEmail, userId, insuranceType, title,
                    transcript, aiAnalysis, keywords, duration
                );
                return ResponseEntity.ok(session);
            }

            String transcript = (String) request.get("transcript");
            String aiAnalysis = (String) request.get("aiAnalysis");
            String keywords = (String) request.get("keywords");
            Integer duration = request.get("duration") != null ? Integer.valueOf(request.get("duration").toString()) : null;
            String status = (String) request.get("status");

            ConsultationSession session = sessionService.updateSession(
                roomId, transcript, aiAnalysis, keywords, duration, status
            );
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
