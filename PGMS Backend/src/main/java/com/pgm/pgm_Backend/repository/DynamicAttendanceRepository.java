package com.pgm.pgm_Backend.repository;

/*
 * import com.pgm.pgm_Backend.mapper.AttendanceRowMapper;
 * import com.pgm.pgm_Backend.model.Attendance;
 * import org.springframework.beans.factory.annotation.Autowired;
 * import org.springframework.jdbc.core.JdbcTemplate;
 * import org.springframework.jdbc.support.GeneratedKeyHolder;
 * import org.springframework.jdbc.support.KeyHolder;
 * import org.springframework.stereotype.Repository;
 * 
 * import java.sql.PreparedStatement;
 * import java.sql.Statement;
 * import java.time.LocalDate;
 * import java.util.List;
 * import java.util.Optional;
 * 
 * @Repository
 * public class DynamicAttendanceRepository {
 * 
 * @Autowired
 * private JdbcTemplate jdbcTemplate;
 * 
 * private String getTableName(Long adminId) {
 * return "admin_" + adminId + "_attendance";
 * }
 * 
 * public List<Attendance> findAll(Long adminId) {
 * String sql = "SELECT * FROM " + getTableName(adminId);
 * return jdbcTemplate.query(sql, new AttendanceRowMapper());
 * }
 * 
 * public Optional<Attendance> findById(Long adminId, Long id) {
 * String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE id = ?";
 * List<Attendance> results = jdbcTemplate.query(sql, new AttendanceRowMapper(),
 * id);
 * return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
 * }
 * 
 * public Attendance save(Long adminId, Attendance attendance) {
 * if (attendance.getId() == null) {
 * return insert(adminId, attendance);
 * } else {
 * return update(adminId, attendance);
 * }
 * }
 * 
 * private Attendance insert(Long adminId, Attendance attendance) {
 * String sql = "INSERT INTO " + getTableName(adminId) +
 * " (student_name, room_number, date, status, notes) " +
 * "VALUES (?, ?, ?, ?, ?)";
 * 
 * KeyHolder keyHolder = new GeneratedKeyHolder();
 * 
 * jdbcTemplate.update(connection -> {
 * PreparedStatement ps = connection.prepareStatement(sql,
 * Statement.RETURN_GENERATED_KEYS);
 * ps.setString(1, attendance.getStudentName());
 * ps.setString(2, attendance.getRoomNumber());
 * ps.setDate(3, java.sql.Date.valueOf(attendance.getDate()));
 * ps.setString(4, attendance.getStatus());
 * ps.setString(5, attendance.getNotes());
 * return ps;
 * }, keyHolder);
 * 
 * attendance.setId(keyHolder.getKey().longValue());
 * return attendance;
 * }
 * 
 * private Attendance update(Long adminId, Attendance attendance) {
 * String sql = "UPDATE " + getTableName(adminId) +
 * " SET student_name = ?, room_number = ?, date = ?, status = ?, notes = ? WHERE id = ?"
 * ;
 * 
 * jdbcTemplate.update(sql,
 * attendance.getStudentName(),
 * attendance.getRoomNumber(),
 * attendance.getDate(),
 * attendance.getStatus(),
 * attendance.getNotes(),
 * attendance.getId());
 * 
 * return attendance;
 * }
 * 
 * public void deleteById(Long adminId, Long id) {
 * String sql = "DELETE FROM " + getTableName(adminId) + " WHERE id = ?";
 * jdbcTemplate.update(sql, id);
 * }
 * 
 * public List<Attendance> findByStudentName(Long adminId, String studentName) {
 * String sql = "SELECT * FROM " + getTableName(adminId) +
 * " WHERE student_name = ?";
 * return jdbcTemplate.query(sql, new AttendanceRowMapper(), studentName);
 * }
 * 
 * public List<Attendance> findByDate(Long adminId, LocalDate date) {
 * String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE date = ?";
 * return jdbcTemplate.query(sql, new AttendanceRowMapper(), date);
 * }
 * 
 * public List<Attendance> findByDateBetween(Long adminId, LocalDate startDate,
 * LocalDate endDate) {
 * String sql = "SELECT * FROM " + getTableName(adminId) +
 * " WHERE date BETWEEN ? AND ?";
 * return jdbcTemplate.query(sql, new AttendanceRowMapper(), startDate,
 * endDate);
 * }
 * 
 * public Optional<Attendance> findByStudentNameAndDate(Long adminId, String
 * studentName, LocalDate date) {
 * String sql = "SELECT * FROM " + getTableName(adminId) +
 * " WHERE student_name = ? AND date = ?";
 * List<Attendance> results = jdbcTemplate.query(sql, new AttendanceRowMapper(),
 * studentName, date);
 * return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
 * }
 * 
 * public List<Attendance> findByStatus(Long adminId, String status) {
 * String sql = "SELECT * FROM " + getTableName(adminId) + " WHERE status = ?";
 * return jdbcTemplate.query(sql, new AttendanceRowMapper(), status);
 * }
 * }
 */
