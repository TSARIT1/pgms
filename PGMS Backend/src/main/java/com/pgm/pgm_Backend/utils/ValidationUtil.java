package com.pgm.pgm_Backend.utils;

import java.util.regex.Pattern;

public class ValidationUtil {

    private static final String EMAIL_PATTERN = 
            "^[A-Za-z0-9+_.-]+@(.+)$";
    
    private static final String PHONE_PATTERN = 
            "^[0-9]{10}$";
    
    private static final String ROOM_TYPE_PATTERN = 
            "^(Single|Double)$";

    public static boolean isValidEmail(String email) {
        return email != null && Pattern.compile(EMAIL_PATTERN).matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        return phone != null && Pattern.compile(PHONE_PATTERN).matcher(phone).matches();
    }

    public static boolean isValidRoomType(String type) {
        return type != null && Pattern.compile(ROOM_TYPE_PATTERN).matcher(type).matches();
    }

    public static boolean isValidAge(Integer age) {
        return age != null && age >= 18 && age <= 100;
    }
}
