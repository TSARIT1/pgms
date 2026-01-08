package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.Ticket;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketService {
    Ticket createTicket(Long adminId, String title, Ticket.Priority priority, String description, String attachmentUrl);

    List<Ticket> getTicketsByAdmin(Long adminId);

    List<Ticket> getAllTickets(); // SuperAdmin: Get all tickets

    Ticket getTicketById(Long id);

    String uploadAttachment(MultipartFile file);

    Ticket updateTicketStatus(Long id, Ticket.Status status, String response);

    Ticket respondToTicket(Long id, String response, Ticket.Status status); // SuperAdmin: Respond to ticket
}
