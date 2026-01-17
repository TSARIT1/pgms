package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByPhone(String phone);
    boolean existsByEmail(String email);
}
