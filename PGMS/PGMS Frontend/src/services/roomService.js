// Room API Service
import { apiGet, apiPost, apiPut, apiDelete, replacePathParams } from './apiHelper';
import { API_ENDPOINTS } from './apiConfig';

// Get all rooms
export const getAllRooms = async () => {
  return apiGet(API_ENDPOINTS.ROOMS_GET_ALL);  // /api/rooms
};

// Get room by ID
export const getRoomById = async (id) => {
  const endpoint = replacePathParams(API_ENDPOINTS.ROOMS_GET, { id }); // /api/rooms/{id}
  return apiGet(endpoint);
};

// Create room
export const createRoom = async (roomData) => {
  return apiPost(API_ENDPOINTS.ROOMS_CREATE, roomData); // POST /api/rooms
};

// Update room
export const updateRoom = async (id, roomData) => {
  const endpoint = replacePathParams(API_ENDPOINTS.ROOMS_UPDATE, { id }); // PUT /api/rooms/{id}
  return apiPut(endpoint, roomData);
};

// Delete room
export const deleteRoom = async (id) => {
  const endpoint = replacePathParams(API_ENDPOINTS.ROOMS_DELETE, { id }); // DELETE /api/rooms/{id}
  return apiDelete(endpoint);
};

// Get rooms by status
export const getRoomsByStatus = async (status) => {
  const endpoint = replacePathParams(API_ENDPOINTS.ROOMS_BY_STATUS, { status }); // GET /api/rooms/status/{status}
  return apiGet(endpoint);
};

// Get rooms by type
export const getRoomsByType = async (type) => {
  const endpoint = replacePathParams(API_ENDPOINTS.ROOMS_BY_TYPE, { type }); // GET /api/rooms/type/{type}
  return apiGet(endpoint);
};
