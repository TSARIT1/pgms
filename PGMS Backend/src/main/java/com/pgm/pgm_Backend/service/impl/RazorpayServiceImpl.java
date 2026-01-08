package com.pgm.pgm_Backend.service.impl;

import com.pgm.pgm_Backend.service.RazorpayService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class RazorpayServiceImpl implements RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.currency}")
    private String currency;

    @Override
    public JSONObject createOrder(Double amount, String currency, String receipt) throws RazorpayException {
        try {
            // Initialize Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

            // Create order request
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (amount * 100)); // Amount in paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);

            // Create order
            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

            return order.toJson();
        } catch (RazorpayException e) {
            throw new RazorpayException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            // Create signature verification string
            String payload = orderId + "|" + paymentId;

            // Create HMAC SHA256 signature
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes());

            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }

            // Compare signatures
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
