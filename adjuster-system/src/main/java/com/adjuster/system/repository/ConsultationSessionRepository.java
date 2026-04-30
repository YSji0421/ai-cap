package com.adjuster.system.repository;

import com.adjuster.system.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {
    Optional<ConsultationSession> findByRoomId(String roomId);
    List<ConsultationSession> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<ConsultationSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ConsultationSession> findAllByOrderByCreatedAtDesc();
}
