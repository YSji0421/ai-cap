package com.adjuster.system.service;

import com.adjuster.system.entity.ConsultationSession;
import com.adjuster.system.repository.ConsultationSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConsultationSessionService {

    private final ConsultationSessionRepository repository;

    @Transactional
    public ConsultationSession saveSession(String roomId, String userEmail, Long userId,
                                           String insuranceType, String title,
                                           String transcript, String aiAnalysis,
                                           String keywords, Integer duration) {
        ConsultationSession session = repository.findByRoomId(roomId)
            .orElse(new ConsultationSession());

        session.setRoomId(roomId);
        session.setUserEmail(userEmail);
        session.setUserId(userId);
        session.setInsuranceType(insuranceType);
        session.setTitle(title);
        session.setTranscript(transcript);
        session.setAiAnalysis(aiAnalysis);
        session.setKeywords(keywords);
        session.setDuration(duration);
        if (session.getSessionDate() == null) {
            session.setSessionDate(LocalDateTime.now());
        }
        session.setStatus("COMPLETED");

        return repository.save(session);
    }

    public Optional<ConsultationSession> getByRoomId(String roomId) {
        return repository.findByRoomId(roomId);
    }

    public List<ConsultationSession> getByUserEmail(String userEmail) {
        return repository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<ConsultationSession> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ConsultationSession updateSession(String roomId, String transcript,
                                             String aiAnalysis, String keywords,
                                             Integer duration, String status) {
        ConsultationSession session = repository.findByRoomId(roomId)
            .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + roomId));

        if (transcript != null) session.setTranscript(transcript);
        if (aiAnalysis != null) session.setAiAnalysis(aiAnalysis);
        if (keywords != null) session.setKeywords(keywords);
        if (duration != null) session.setDuration(duration);
        if (status != null) session.setStatus(status);

        return repository.save(session);
    }
}
