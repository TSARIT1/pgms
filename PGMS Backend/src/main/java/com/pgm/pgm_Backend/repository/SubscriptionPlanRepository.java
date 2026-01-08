package com.pgm.pgm_Backend.repository;

import com.pgm.pgm_Backend.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    List<SubscriptionPlan> findByIsActiveTrue();

    Optional<SubscriptionPlan> findByDurationAndDurationType(Integer duration, String durationType);

    Optional<SubscriptionPlan> findByName(String name);

    List<SubscriptionPlan> findAllByOrderByDurationAsc();
}
