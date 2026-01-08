package com.pgm.pgm_Backend.service.impl;

/*
 * import com.pgm.pgm_Backend.exception.ResourceNotFoundException;
 * import com.pgm.pgm_Backend.model.Attendance;
 * import com.pgm.pgm_Backend.repository.DynamicAttendanceRepository;
 * import com.pgm.pgm_Backend.service.AttendanceService;
 * import com.pgm.pgm_Backend.utils.AdminContextUtil;
 * import org.springframework.beans.factory.annotation.Autowired;
 * import org.springframework.stereotype.Service;
 * 
 * import java.time.LocalDate;
 * import java.util.ArrayList;
 * import java.util.List;
 * 
 * @Service
 * public class AttendanceServiceImpl implements AttendanceService {
 * 
 * @Autowired
 * private DynamicAttendanceRepository dynamicAttendanceRepository;
 * 
 * @Autowired
 * private AdminContextUtil adminContextUtil;
 * 
 * @Override
 * public Attendance markAttendance(Attendance attendance) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * 
 * // Check if attendance already exists for this student on this date
 * var existing = dynamicAttendanceRepository.findByStudentNameAndDate(
 * adminId,
 * attendance.getStudentName(),
 * attendance.getDate());
 * 
 * if (existing.isPresent()) {
 * // Update existing attendance
 * Attendance existingAttendance = existing.get();
 * existingAttendance.setStatus(attendance.getStatus());
 * existingAttendance.setNotes(attendance.getNotes());
 * existingAttendance.setRoomNumber(attendance.getRoomNumber());
 * return dynamicAttendanceRepository.save(adminId, existingAttendance);
 * }
 * 
 * return dynamicAttendanceRepository.save(adminId, attendance);
 * }
 * 
 * @Override
 * public List<Attendance> getAllAttendance() {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * return dynamicAttendanceRepository.findAll(adminId);
 * }
 * 
 * @Override
 * public List<Attendance> getAttendanceByDate(LocalDate date) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * return dynamicAttendanceRepository.findByDate(adminId, date);
 * }
 * 
 * @Override
 * public List<Attendance> getAttendanceByStudent(String studentName) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * return dynamicAttendanceRepository.findByStudentName(adminId, studentName);
 * }
 * 
 * @Override
 * public List<Attendance> getAttendanceByRoom(String roomNumber) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * // Filter manually since we don't have a specific method
 * return dynamicAttendanceRepository.findAll(adminId).stream()
 * .filter(a -> roomNumber.equals(a.getRoomNumber()))
 * .toList();
 * }
 * 
 * @Override
 * public List<Attendance> getAttendanceByStatus(String status) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * return dynamicAttendanceRepository.findByStatus(adminId, status);
 * }
 * 
 * @Override
 * public Attendance updateAttendance(Long id, Attendance attendance) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * Attendance existingAttendance = dynamicAttendanceRepository.findById(adminId,
 * id)
 * .orElseThrow(() -> new
 * ResourceNotFoundException("Attendance not found with id: " + id));
 * 
 * if (attendance.getStudentName() != null) {
 * existingAttendance.setStudentName(attendance.getStudentName());
 * }
 * if (attendance.getRoomNumber() != null) {
 * existingAttendance.setRoomNumber(attendance.getRoomNumber());
 * }
 * if (attendance.getDate() != null) {
 * existingAttendance.setDate(attendance.getDate());
 * }
 * if (attendance.getStatus() != null) {
 * existingAttendance.setStatus(attendance.getStatus());
 * }
 * if (attendance.getNotes() != null) {
 * existingAttendance.setNotes(attendance.getNotes());
 * }
 * 
 * return dynamicAttendanceRepository.save(adminId, existingAttendance);
 * }
 * 
 * @Override
 * public void deleteAttendance(Long id) {
 * Long adminId = adminContextUtil.getCurrentAdminId();
 * Attendance attendance = dynamicAttendanceRepository.findById(adminId, id)
 * .orElseThrow(() -> new
 * ResourceNotFoundException("Attendance not found with id: " + id));
 * dynamicAttendanceRepository.deleteById(adminId, id);
 * }
 * 
 * @Override
 * public List<Attendance> markBulkAttendance(List<Attendance> attendanceList) {
 * List<Attendance> savedAttendance = new ArrayList<>();
 * for (Attendance attendance : attendanceList) {
 * savedAttendance.add(markAttendance(attendance));
 * }
 * return savedAttendance;
 * }
 * }
 */
