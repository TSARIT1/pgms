package com.pgm.pgm_Backend.service;

import com.pgm.pgm_Backend.model.SubscriptionPlan;

import java.util.List;

public interface SubscriptionPlanService {

    List<SubscriptionPlan> getAllPlans();

    List<SubscriptionPlan> getActivePlans();

    SubscriptionPlan getPlanById(Long id);

    SubscriptionPlan createPlan(SubscriptionPlan plan);

    SubscriptionPlan updatePlan(Long id, SubscriptionPlan plan);

    void deletePlan(Long id);

    SubscriptionPlan togglePlanStatus(Long id);
}
