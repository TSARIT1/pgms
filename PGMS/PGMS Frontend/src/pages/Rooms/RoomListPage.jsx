import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { FiRefreshCw, FiPlus, FiTrash2, FiGrid } from "react-icons/fi";
import DataTable from "../../components/common/DataTable";
import RoomForm from "./RoomForm";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../services/roomService";
import { getAllStudents } from "../../services/studentService";

export default function RoomListPage() {
  const { t } = useTranslation();
  // State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [roomOccupants, setRoomOccupants] = useState([]);

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Fetch rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await getAllRooms();
      if (response.data) setRooms(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load rooms");
      console.error("Error loading rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add or update room
  const handleAddRoom = async (roomData) => {
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
      } else {
        await createRoom(roomData);
      }
      setEditingRoom(null);
      setShowForm(false);
      await loadRooms();
    } catch (err) {
      setError(err.message || "Failed to save room");
      console.error("Error saving room:", err);
    }
  };

  // Edit room
  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  // Delete one room
  const handleDelete = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNumber}?`)) return;

    try {
      await deleteRoom(room.id);
      await loadRooms();
    } catch (err) {
      setError(err.message || "Failed to delete room");
      console.error("Error deleting room:", err);
    }
  };

  // View room
  const handleView = async (room) => {
    setViewingRoom(room);
    // Fetch candidates living in this room
    try {
      const response = await getAllStudents();
      if (response.data) {
        const occupants = response.data.filter(student => student.roomNumber === room.roomNumber);
        setRoomOccupants(occupants);
      }
    } catch (err) {
      console.error('Error loading room occupants:', err);
      setRoomOccupants([]);
    }
  };

  // Delete selected rooms
  const handleDeleteSelected = async () => {
    if (selectedRooms.length === 0) {
      alert("Please select rooms to delete");
      return;
    }

    if (
      !window.confirm(`Delete ${selectedRooms.length} selected room(s)?`)
    )
      return;

    try {
      console.log('Selected rooms:', selectedRooms);
      for (const room of selectedRooms) {
        console.log('Processing room:', room);
        // Get the ID from the room object - it might be 'id' or nested in the object
        const roomId = room.id || room.roomId;
        console.log('Room ID:', roomId);
        if (!roomId) {
          console.error('Room ID not found:', room);
          alert(`Cannot delete room - ID not found. Room data: ${JSON.stringify(room)}`);
          continue;
        }
        await deleteRoom(roomId);
      }
      setSelectedRooms([]);
      await loadRooms();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to delete selected rooms");
      console.error("Error deleting rooms:", err);
    }
  };




  const columns = [
    "roomNumber",
    "capacity",
    "occupiedBeds",
    "rent",
    "status",
  ];

  // ---------------- UI ----------------
  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "2rem",
          borderRadius: "1rem",
          color: "white",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(102,126,234,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "white" }}>{t('rooms.title')}</h1>
          <p style={{ color: "rgba(255,255,255,0.9)" }}>
            {t('rooms.title')}
          </p>
        </div>
        <FiGrid size={40} style={{ opacity: 0.3 }} />
      </motion.div>

      {/* TOOLBAR */}
      <motion.div
        className="toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Refresh */}
          <motion.button
            onClick={loadRooms}
            className="btn btn-secondary"
            whileHover={{ scale: 1.05 }}
          >
            <FiRefreshCw /> Refresh
          </motion.button>
        </div>

        {/* Add Room */}
        <motion.button
          className="btn btn-primary"
          onClick={() => {
            setEditingRoom(null);
            setShowForm(true);
          }}
          whileHover={{ scale: 1.05 }}
        >
          <FiPlus /> {t('rooms.addRoom')}
        </motion.button>
      </motion.div>

      {/* STATISTICS CARDS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Total Rooms */}
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.totalRooms')}</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{rooms.length}</div>
        </motion.div>

        {/* Available Rooms */}
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.availableRooms')}</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {rooms.filter(r => r.status === 'AVAILABLE').length}
          </div>
        </motion.div>

        {/* Occupied Rooms */}
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.occupiedRooms')}</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {rooms.filter(r => r.status === 'FULL').length}
          </div>
        </motion.div>

        {/* Total Beds */}
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('rooms.totalBeds')}</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)}
          </div>
        </motion.div>
      </motion.div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && <p style={{ textAlign: "center" }}>Loading rooms...</p>}

      {/* ROOM FORM */}
      {showForm && (
        <motion.div 
          className="modal-overlay" 
          onClick={() => setShowForm(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem 1rem 0 0',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white' }}>
                {editingRoom ? `✏️ ${t('rooms.editRoom')}` : `➕ ${t('rooms.addRoom')}`}
              </h2>
              <motion.button 
                className="modal-close-btn" 
                onClick={() => setShowForm(false)}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  width: '2rem',
                  height: '2rem',
                }}
              >
                ✕
              </motion.button>
            </motion.div>
            <div className="modal-body">
              <RoomForm room={editingRoom} onSubmit={handleAddRoom} />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* View Modal */}
      {viewingRoom && (
        <motion.div 
          className="modal-overlay" 
          onClick={() => setViewingRoom(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <motion.div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem 1rem 0 0',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="modal-title" style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                🏠 Room Information
              </h2>
              <motion.button 
                className="modal-close-btn" 
                onClick={() => setViewingRoom(null)}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  width: '2rem',
                  height: '2rem',
                }}
              >
                ✕
              </motion.button>
            </motion.div>
            <div className="modal-body" style={{ padding: '2rem' }}>
              {/* Room Details Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  📋 Room Details
                </h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Room Number</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#1e40af' }}>
                        {viewingRoom.roomNumber}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Capacity</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                        {viewingRoom.capacity}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Occupied Beds</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#92400e' }}>
                        {viewingRoom.occupiedBeds}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Rent</label>
                      <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#166534' }}>
                        ₹{viewingRoom.rent}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Status</label>
                    <div style={{ padding: '0.75rem 1rem', background: viewingRoom.status === 'AVAILABLE' ? '#d1fae5' : '#fee2e2', border: viewingRoom.status === 'AVAILABLE' ? '1px solid #a7f3d0' : '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: viewingRoom.status === 'AVAILABLE' ? '#065f46' : '#991b1b' }}>
                      {viewingRoom.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Occupants Section */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  👥 Candidates Living Here ({roomOccupants.length})
                </h3>
                {roomOccupants.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {roomOccupants.map((occupant, idx) => (
                      <div key={idx} style={{ padding: '1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#111827' }}>{occupant.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            📧 {occupant.email} • 📞 {occupant.phone}
                          </div>
                        </div>
                        <div style={{ padding: '0.25rem 0.75rem', background: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {occupant.status || 'ACTIVE'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '0.5rem', color: '#6b7280' }}>
                    No candidates currently living in this room
                  </div>
                )}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={() => setViewingRoom(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* TABLE */}
      {!loading && (
        <DataTable
          columns={columns}
          data={rooms}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}


    </motion.div>
  );
}
