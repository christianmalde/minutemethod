import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Type definitions ──────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type ServiceType = "class" | "pt";

export type Service = {
  id: string;
  name: string;
  type: ServiceType;
  description: string | null;
  price: number;
  duration_minutes: number;
  instructor_name: string | null;
};

export type Schedule = {
  id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  booked_count: number;
  service?: Service;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type Booking = {
  id: string;
  user_id: string;
  schedule_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  schedule?: Schedule & { service?: Service };
};

export type MessageSender = "user" | "pt";

export type Message = {
  id: string;
  user_id: string;
  content: string;
  sender: MessageSender;
  created_at: string;
  read_at: string | null;
};
