package com.learnsphere.learningprogress.service.certificate;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;

import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

@Service
public class CertificatePdfServiceImpl
        implements CertificatePdfService {

    @Override
    public ByteArrayInputStream generateCertificate(
            String userName,
            String courseId) {

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        document.add(new Paragraph("CERTIFICATE OF COMPLETION")
                .setBold()
                .setFontSize(24)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("\n"));

        document.add(new Paragraph("This certifies that")
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph(userName)
                .setBold()
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph(
                "has successfully completed the course")
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph(courseId)
                .setBold()
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph(
                "\nDate: " + LocalDate.now())
                .setTextAlignment(TextAlignment.CENTER));

        document.close();

        return new ByteArrayInputStream(out.toByteArray());
    }
}
