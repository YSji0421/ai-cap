package com.adjuster.system.controller;

import com.adjuster.system.entity.Reservation;
import com.adjuster.system.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationApiController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Reservation reservation) {
        try {
            Reservation saved = reservationService.create(reservation);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAll(
            @RequestParam(required = false) Long consultantId) {
        if (consultantId != null) {
            return ResponseEntity.ok(reservationService.getByConsultant(consultantId));
        }
        return ResponseEntity.ok(reservationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return reservationService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Reservation updated = reservationService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        try {
            reservationService.cancel(id);
            return ResponseEntity.ok(Map.of("message", "예약이 취소되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<Map<String, Object>> getAvailableSlots(
            @RequestParam String date,
            @RequestParam Long consultantId) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(reservationService.getAvailableSlots(localDate, consultantId));
    }
}
