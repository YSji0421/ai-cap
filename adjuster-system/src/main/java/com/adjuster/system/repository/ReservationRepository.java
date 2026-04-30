package com.adjuster.system.repository;

import com.adjuster.system.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    boolean existsByConsultantIdAndReservationDateAndTimeSlot(Long consultantId, LocalDate date, String timeSlot);
    List<Reservation> findByConsultantIdOrderByReservationDateDescTimeSlotDesc(Long consultantId);
    List<Reservation> findByReservationDateAndConsultantId(LocalDate date, Long consultantId);
    List<Reservation> findByStatusOrderByReservationDateAsc(String status);
    List<Reservation> findAllByOrderByReservationDateDescTimeSlotDesc();
}
