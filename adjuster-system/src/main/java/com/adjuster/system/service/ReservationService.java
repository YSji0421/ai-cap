package com.adjuster.system.service;

import com.adjuster.system.entity.Reservation;
import com.adjuster.system.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository repository;

    private static final List<String> ALL_SLOTS = List.of(
        "09:00-10:00", "10:00-11:00", "11:00-12:00",
        "13:00-14:00", "14:00-15:00", "15:00-16:00",
        "16:00-17:00", "17:00-18:00"
    );

    @Transactional
    public Reservation create(Reservation reservation) {
        if (repository.existsByConsultantIdAndReservationDateAndTimeSlot(
                reservation.getConsultantId(),
                reservation.getReservationDate(),
                reservation.getTimeSlot())) {
            throw new RuntimeException("해당 시간대는 이미 예약되어 있습니다.");
        }

        if (reservation.getReservationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("과거 날짜에는 예약할 수 없습니다.");
        }

        reservation.setStatus("PENDING");
        reservation.setRoomLink("room-" + System.currentTimeMillis());
        return repository.save(reservation);
    }

    public List<Reservation> getAll() {
        return repository.findAllByOrderByReservationDateDescTimeSlotDesc();
    }

    public List<Reservation> getByConsultant(Long consultantId) {
        return repository.findByConsultantIdOrderByReservationDateDescTimeSlotDesc(consultantId);
    }

    public Optional<Reservation> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Reservation updateStatus(Long id, String status) {
        Reservation res = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        res.setStatus(status);
        return repository.save(res);
    }

    @Transactional
    public void cancel(Long id) {
        Reservation res = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        res.setStatus("CANCELLED");
        repository.save(res);
    }

    public Map<String, Object> getAvailableSlots(LocalDate date, Long consultantId) {
        List<Reservation> booked = repository.findByReservationDateAndConsultantId(date, consultantId);
        Set<String> bookedSlots = booked.stream()
            .filter(r -> !"CANCELLED".equals(r.getStatus()))
            .map(Reservation::getTimeSlot)
            .collect(Collectors.toSet());

        List<Map<String, Object>> slots = ALL_SLOTS.stream()
            .map(slot -> {
                Map<String, Object> s = new LinkedHashMap<>();
                s.put("slot", slot);
                s.put("available", !bookedSlots.contains(slot));
                return s;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", date.toString());
        result.put("slots", slots);
        return result;
    }
}
