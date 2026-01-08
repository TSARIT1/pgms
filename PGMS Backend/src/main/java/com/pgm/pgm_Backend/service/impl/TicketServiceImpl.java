package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.model.Ticket;
import com.pgm.pgm_Backend.repository.TicketRepository;
import com.pgm.pgm_Backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    private static final String UPLOAD_DIR = "uploads/tickets/";

    @Override
    public Ticket createTicket(Long adminId, String title, Ticket.Priority priority, String description,
            String attachmentUrl) {
        Ticket ticket = new Ticket();
        ticket.setAdminId(adminId);
        ticket.setTitle(title);
        ticket.setPriority(priority);
        ticket.setDescription(description);
        ticket.setAttachmentUrl(attachmentUrl);
        ticket.setStatus(Ticket.Status.OPEN);

        return ticketRepository.save(ticket);
    }

    @Override
    public List<Ticket> getTicketsByAdmin(Long adminId) {
        return ticketRepository.findByAdminIdOrderByCreatedAtDesc(adminId);
    }

    @Override
    public List<Ticket> getAllTickets() {
        // Get all tickets and sort by priority (HIGH first) then by creation date
        List<Ticket> tickets = ticketRepository.findAll();

        return tickets.stream()
                .sorted(Comparator
                        .comparing(Ticket::getPriority, (p1, p2) -> {
                            // HIGH = 0, MEDIUM = 1, LOW = 2 for sorting
                            int priority1 = p1 == Ticket.Priority.HIGH ? 0 : p1 == Ticket.Priority.MEDIUM ? 1 : 2;
                            int priority2 = p2 == Ticket.Priority.HIGH ? 0 : p2 == Ticket.Priority.MEDIUM ? 1 : 2;
                            return Integer.compare(priority1, priority2);
                        })
                        .thenComparing(Ticket::getCreatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    @Override
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    @Override
    public String uploadAttachment(MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path
            return "/uploads/tickets/" + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public Ticket updateTicketStatus(Long id, Ticket.Status status, String response) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        if (response != null && !response.isEmpty()) {
            ticket.setResponse(response);
        }
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket respondToTicket(Long id, String response, Ticket.Status status) {
        Ticket ticket = getTicketById(id);
        ticket.setResponse(response);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }
}
