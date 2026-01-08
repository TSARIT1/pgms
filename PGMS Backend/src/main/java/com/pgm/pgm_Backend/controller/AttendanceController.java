package com.pgm.pgm_Backend.controller;

/*
 * import com.pgm.pgm_Backend.model.Attendance;
 * import com.pgm.pgm_Backend.service.AttendanceService;
 * import org.springframework.beans.factory.annotation.Autowired;
 * import org.springframework.http.HttpStatus;
 * import org.springframework.http.ResponseEntity;
 * import org.springframework.web.bind.annotation.*;
 * 
 * import java.time.LocalDate;
 * import java.util.HashMap;
 * import java.util.List;
 * import java.util.Map;
 * 
 * @RestController
 * 
 * @RequestMapping("/api/attendance")
 * 
 * @CrossOrigin(origins = "http://localhost:5173")
 * public class AttendanceController {
 * 
 * @Autowired
 * private AttendanceService attendanceService;
 * 
 * @PostMapping
 * public ResponseEntity<?> markAttendance(@RequestBody Attendance attendance) {
 * try {
 * Attendance savedAttendance = attendanceService.markAttendance(attendance);
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("message", "Attendance marked successfully");
 * response.put("data", savedAttendance);
 * return ResponseEntity.status(HttpStatus.CREATED).body(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
 * }
 * }
 * 
 * @PostMapping("/bulk")
 * public ResponseEntity<?> markBulkAttendance(@RequestBody List<Attendance>
 * attendanceList) {
 * try {
 * List<Attendance> savedAttendance =
 * attendanceService.markBulkAttendance(attendanceList);
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("message", "Bulk attendance marked successfully");
 * response.put("data", savedAttendance);
 * return ResponseEntity.status(HttpStatus.CREATED).body(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
 * }
 * }
 * 
 * @GetMapping
 * public ResponseEntity<?> getAllAttendance() {
 * try {
 * List<Attendance> attendance = attendanceService.getAllAttendance();
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("data", attendance);
 * return ResponseEntity.ok(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
 * }
 * }
 * 
 * @GetMapping("/date/{date}")
 * public ResponseEntity<?> getAttendanceByDate(@PathVariable String date) {
 * try {
 * LocalDate localDate = LocalDate.parse(date);
 * List<Attendance> attendance =
 * attendanceService.getAttendanceByDate(localDate);
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("data", attendance);
 * return ResponseEntity.ok(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
 * }
 * }
 * 
 * @GetMapping("/student/{studentName}")
 * public ResponseEntity<?> getAttendanceByStudent(@PathVariable String
 * studentName) {
 * try {
 * List<Attendance> attendance =
 * attendanceService.getAttendanceByStudent(studentName);
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("data", attendance);
 * return ResponseEntity.ok(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
 * }
 * }
 * 
 * @PutMapping("/{id}")
 * public ResponseEntity<?> updateAttendance(@PathVariable Long id, @RequestBody
 * Attendance attendance) {
 * try {
 * Attendance updatedAttendance = attendanceService.updateAttendance(id,
 * attendance);
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("message", "Attendance updated successfully");
 * response.put("data", updatedAttendance);
 * return ResponseEntity.ok(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
 * }
 * }
 * 
 * @DeleteMapping("/{id}")
 * public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
 * try {
 * attendanceService.deleteAttendance(id);
 * Map<String, Object> response = new HashMap<>();
 * response.put("status", "success");
 * response.put("message", "Attendance deleted successfully");
 * return ResponseEntity.ok(response);
 * } catch (Exception e) {
 * Map<String, Object> error = new HashMap<>();
 * error.put("status", "error");
 * error.put("message", e.getMessage());
 * return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
 * }
 * }
 * }
 */
