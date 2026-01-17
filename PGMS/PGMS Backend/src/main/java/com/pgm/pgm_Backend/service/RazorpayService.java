package com.pgm.pgm_Backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.json.JSONObject;

public interface RazorpayService {

    /**
     * Create a Razorpay order for payment
     * 
     * @param amount   Amount in INR
     * @param currency Currency code (INR)
     * @param receipt  Receipt/Order ID for reference
     * @return JSONObject containing order details
     * @throws RazorpayException if order creation fails
     */
    JSONObject createOrder(Double amount, String currency, String receipt) throws RazorpayException;

    /**
     * Verify Razorpay payment signature
     * 
     * @param orderId   Razorpay Order ID
     * @param paymentId Razorpay Payment ID
     * @param signature Razorpay Signature
     * @return true if signature is valid, false otherwise
     */
    boolean verifyPaymentSignature(String orderId, String paymentId, String signature);
}
