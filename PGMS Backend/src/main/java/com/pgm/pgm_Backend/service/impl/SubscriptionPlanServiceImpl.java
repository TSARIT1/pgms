package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
import com.pgm.pgm_Backend.model.SubscriptionPlan;
import com.pgm.pgm_Backend.repository.SubscriptionPlanRepository;
import com.pgm.pgm_Backend.service.SubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public List<SubscriptionPlan> getAllPlans() {
        return subscriptionPlanRepository.findAllByOrderByDurationAsc();
    }

    @Override
    public List<SubscriptionPlan> getActivePlans() {
        return subscriptionPlanRepository.findByIsActiveTrue();
    }

    @Override
    public SubscriptionPlan getPlanById(Long id) {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + id));
    }

    @Override
    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        plan.setIsActive(true);
        return subscriptionPlanRepository.save(plan);
    }

    @Override
    public SubscriptionPlan updatePlan(Long id, SubscriptionPlan planDetails) {
        SubscriptionPlan plan = getPlanById(id);

        plan.setName(planDetails.getName());
        plan.setDuration(planDetails.getDuration());
        plan.setDurationType(planDetails.getDurationType());
        plan.setPrice(planDetails.getPrice());
        plan.setFeatures(planDetails.getFeatures());
        plan.setOffer(planDetails.getOffer());

        return subscriptionPlanRepository.save(plan);
    }

    @Override
    public void deletePlan(Long id) {
        SubscriptionPlan plan = getPlanById(id);
        subscriptionPlanRepository.delete(plan);
    }

    @Override
    public SubscriptionPlan togglePlanStatus(Long id) {
        SubscriptionPlan plan = getPlanById(id);
        plan.setIsActive(!plan.getIsActive());
        return subscriptionPlanRepository.save(plan);
    }
}
