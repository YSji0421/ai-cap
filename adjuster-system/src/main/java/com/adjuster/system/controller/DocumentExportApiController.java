package com.adjuster.system.controller;

import com.adjuster.system.service.DocumentExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class DocumentExportApiController {

    private final DocumentExportService exportService;

    @PostMapping("/pdf/{roomId}")
    public ResponseEntity<byte[]> exportPdf(@PathVariable String roomId) {
        try {
            byte[] pdf = exportService.generatePdf(roomId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                "consultation-report-" + roomId + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
