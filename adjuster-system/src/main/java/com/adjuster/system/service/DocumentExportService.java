package com.adjuster.system.service;

import com.adjuster.system.entity.ConsultationSession;
import com.adjuster.system.repository.ConsultationSessionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentExportService {

    private final ConsultationSessionRepository sessionRepository;

    public byte[] generatePdf(String roomId) {
        ConsultationSession session = sessionRepository.findByRoomId(roomId)
            .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + roomId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Use default font that supports Korean (via system font)
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(30, 58, 138));
            Font headerFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(37, 99, 235));
            Font bodyFont = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.DARK_GRAY);
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(71, 85, 105));

            // Try to load Korean font
            try {
                BaseFont koreanBase = BaseFont.createFont("HeiseiMin-W3", "UniJIS-UCS2-H", BaseFont.NOT_EMBEDDED);
                titleFont = new Font(koreanBase, 18, Font.BOLD);
                headerFont = new Font(koreanBase, 14, Font.BOLD);
                bodyFont = new Font(koreanBase, 11, Font.NORMAL);
                labelFont = new Font(koreanBase, 11, Font.BOLD);
            } catch (Exception e) {
                log.warn("Korean font not available, using default font");
            }

            // Title
            Paragraph title = new Paragraph("AI Insurance Consultation Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Session Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);

            addInfoRow(infoTable, "Room ID", session.getRoomId(), labelFont, bodyFont);
            addInfoRow(infoTable, "Insurance Type", getInsuranceLabel(session.getInsuranceType()), labelFont, bodyFont);
            addInfoRow(infoTable, "Date", session.getSessionDate() != null ?
                session.getSessionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A", labelFont, bodyFont);
            addInfoRow(infoTable, "Duration", session.getDuration() != null ?
                (session.getDuration() / 60) + " min " + (session.getDuration() % 60) + " sec" : "N/A", labelFont, bodyFont);
            addInfoRow(infoTable, "Keywords", session.getKeywords() != null ? session.getKeywords() : "N/A", labelFont, bodyFont);

            document.add(infoTable);

            // AI Analysis
            if (session.getAiAnalysis() != null && !session.getAiAnalysis().isEmpty()) {
                Paragraph aiHeader = new Paragraph("AI Analysis", headerFont);
                aiHeader.setSpacingBefore(10);
                aiHeader.setSpacingAfter(10);
                document.add(aiHeader);

                String analysisText = session.getAiAnalysis();
                if (analysisText.length() > 2000) {
                    analysisText = analysisText.substring(0, 2000) + "...";
                }
                Paragraph analysis = new Paragraph(analysisText, bodyFont);
                analysis.setSpacingAfter(15);
                document.add(analysis);
            }

            // Transcript
            if (session.getTranscript() != null && !session.getTranscript().isEmpty()) {
                Paragraph transcriptHeader = new Paragraph("Consultation Transcript", headerFont);
                transcriptHeader.setSpacingBefore(10);
                transcriptHeader.setSpacingAfter(10);
                document.add(transcriptHeader);

                String transcriptText = session.getTranscript();
                if (transcriptText.length() > 5000) {
                    transcriptText = transcriptText.substring(0, 5000) + "...";
                }
                Paragraph transcriptPara = new Paragraph(transcriptText, bodyFont);
                document.add(transcriptPara);
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF generation failed: {}", e.getMessage());
            throw new RuntimeException("PDF 생성 실패: " + e.getMessage());
        }
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font bodyFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(0);
        labelCell.setPadding(5);
        labelCell.setBackgroundColor(new Color(241, 245, 249));

        PdfPCell valueCell = new PdfPCell(new Phrase(value, bodyFont));
        valueCell.setBorder(0);
        valueCell.setPadding(5);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String getInsuranceLabel(String type) {
        if (type == null) return "N/A";
        return switch (type) {
            case "TRAFFIC" -> "Traffic Accident";
            case "INJURY" -> "Injury";
            case "FIRE" -> "Fire";
            case "LIFE" -> "Life";
            default -> type;
        };
    }
}
