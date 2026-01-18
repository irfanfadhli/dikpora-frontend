import { z } from 'zod';

// --- Auth ---

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

// --- Room ---

export const RoomResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().optional(),
  capacity: z.number().optional(),
  active: z.boolean(),
  image: z.string().optional(),
  created_at: z.string(),
  created_by: z.string().optional(),
  modified_at: z.string(),
  modified_by: z.string().optional(),
});

export const RoomListResponseSchema = z.object({
  data: z.object({
    rooms: z.array(RoomResponseSchema),
  }),
});

export const SingleRoomResponseSchema = z.object({
  data: RoomResponseSchema,
});

// --- Booking ---

export const BookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled']);

export const BookingResponseSchema = z.object({
  id: z.string(),
  room_id: z.string(),
  guest_name: z.string(),
  guest_email: z.string().optional(),
  guest_phone: z.string().optional(),
  booking_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  purpose: z.string().optional(),
  status: BookingStatusSchema,
  created_at: z.string(),
  created_by: z.string().optional(),
  modified_at: z.string(),
  modified_by: z.string().optional(),
});

export const BookingListResponseSchema = z.object({
  data: z.object({
    bookings: z.array(BookingResponseSchema),
  }),
});

export const SingleBookingResponseSchema = z.object({
  data: BookingResponseSchema,
});

// --- User ---

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string(),
  profile_image: z.string().optional(),
  level: z.enum(['1', '2', '3']),
  active: z.boolean(),
  is_verified: z.boolean(),
  last_login: z.string().optional(),
  created_at: z.string(),
  created_by: z.string().optional(),
  modified_at: z.string(),
  modified_by: z.string().optional(),
});

export const UserListResponseSchema = z.object({
  data: z.object({
    users: z.array(UserResponseSchema),
  }),
});

export const SingleUserResponseSchema = z.object({
  data: UserResponseSchema,
});

// --- Shared ---

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// --- Exported Types ---

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type Room = z.infer<typeof RoomResponseSchema>;
export type RoomListResponse = z.infer<typeof RoomListResponseSchema>;
export type SingleRoomResponse = z.infer<typeof SingleRoomResponseSchema>;

export type Booking = z.infer<typeof BookingResponseSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type BookingListResponse = z.infer<typeof BookingListResponseSchema>;
export type SingleBookingResponse = z.infer<typeof SingleBookingResponseSchema>;

export type User = z.infer<typeof UserResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type SingleUserResponse = z.infer<typeof SingleUserResponseSchema>;
