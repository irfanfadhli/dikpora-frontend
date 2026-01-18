import { api } from './api';
import { 
  LoginRequest, LoginResponse,  
  RoomListResponse, SingleRoomResponse,
  BookingListResponse, SingleBookingResponse,
  UserListResponse, SingleUserResponse,
  BookingStatus,
  MessageResponseSchema
} from './types';

// --- Auth Service ---

// Utility function to decode JWT token
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const authService = {
  login: async (data: LoginRequest) => {
    const res = await api.post<{ data: LoginResponse }>('/v1/auth/login', data);
    console.log('Login response:', res.data); // Debug logging
    
    // API returns tokens nested in data.data
    const accessToken = res.data.data?.access_token;
    const refreshToken = res.data.data?.refresh_token;
    
    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      console.log('Tokens stored successfully'); // Debug logging
    } else {
      console.error('Tokens missing in response:', res.data);
      throw new Error('Invalid login response - tokens missing');
    }
    
    return res.data.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const res = await api.post<{ data: LoginResponse }>('/v1/auth/refresh-token', { 
      refresh_token: refreshToken 
    });
    return res.data.data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    return decodeJWT(token);
  }
};

// --- Room Service ---

export const roomService = {
  getRooms: async (params?: { name?: string; location?: string; active?: boolean; limit?: number; page?: number }) => {
    const res = await api.get<RoomListResponse>('/v1/rooms', { params });
    return res.data.data.rooms;
  },

  getRoom: async (id: string) => {
    const res = await api.get<SingleRoomResponse>(`/v1/rooms/${id}`);
    return res.data.data;
  },

  createRoom: async (formData: FormData) => {
    const res = await api.post('/v1/rooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  updateRoom: async (id: string, formData: FormData) => {
    const res = await api.patch(`/v1/rooms/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  deleteRoom: async (id: string) => {
    const res = await api.delete(`/v1/rooms/${id}`);
    return res.data;
  }
};

// --- Booking Service ---

export const bookingService = {
  getBookings: async (params?: { room_id?: string; status?: string; booking_date?: string; limit?: number; page?: number }) => {
    const res = await api.get<BookingListResponse>('/v1/bookings', { params });
    return res.data.data.bookings;
  },

  getMyBookings: async (params?: { status?: string; booking_date?: string; limit?: number; page?: number }) => {
    const res = await api.get<BookingListResponse>('/v1/bookings/mybookings', { params });
    return res.data.data.bookings;
  },

  getBooking: async (id: string) => {
    const res = await api.get<SingleBookingResponse>(`/v1/bookings/${id}`);
    return res.data.data;
  },

  createBooking: async (data: any) => {
    const res = await api.post('/v1/bookings', data);
    return res.data;
  },

  updateBooking: async (id: string, data: any) => {
    const res = await api.patch(`/v1/bookings/${id}`, data);
    return res.data;
  },

  deleteBooking: async (id: string) => {
    const res = await api.delete(`/v1/bookings/${id}`);
    return res.data;
  }
};

// --- User Service ---

export const userService = {
  getUsers: async (params?: { email?: string; level?: string; active?: boolean; limit?: number; page?: number }) => {
    const res = await api.get<UserListResponse>('/v1/users', { params });
    return res.data.data.users;
  },

  getUser: async (id: string) => {
    const res = await api.get<SingleUserResponse>(`/v1/users/${id}`);
    return res.data.data;
  },

  createUser: async (data: any) => {
    const res = await api.post('/v1/users', data);
    return res.data;
  },

  updateUser: async (id: string, data: any) => {
    const res = await api.patch(`/v1/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/v1/users/${id}`);
    return res.data;
  }
};
