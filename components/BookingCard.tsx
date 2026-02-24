import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Booking, supabase } from "@/lib/supabase";

type Props = {
  booking: Booking;
  onCancelled?: () => void;
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  confirmed: { bg: "bg-green-500/20", text: "text-green-400", label: "Confirmed" },
  pending:   { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pending" },
  cancelled: { bg: "bg-red-500/20",   text: "text-red-400",    label: "Cancelled" },
};

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function BookingCard({ booking, onCancelled }: Props) {
  const schedule = booking.schedule;
  const service = schedule?.service;
  const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;

  async function handleCancel() {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel booking",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("bookings")
              .update({ status: "cancelled" })
              .eq("id", booking.id);

            if (error) {
              Alert.alert("Error", "Could not cancel booking. Please try again.");
            } else {
              // Restore capacity
              await supabase.rpc("decrement_booked_count", {
                schedule_id: booking.schedule_id,
              });
              onCancelled?.();
            }
          },
        },
      ]
    );
  }

  return (
    <View className="bg-white/10 rounded-2xl p-5 mb-3">
      {/* Service name + status */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-white font-bold text-base flex-1 mr-3">
          {service?.name ?? "Booking"}
        </Text>
        <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-xs font-semibold ${statusStyle.text}`}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Instructor */}
      {service?.instructor_name && (
        <Text className="text-gray-400 text-sm mb-1">
          with {service.instructor_name}
        </Text>
      )}

      {/* Date/Time */}
      {schedule?.start_time && (
        <Text className="text-gray-300 text-sm mb-1">
          📅 {formatDateTime(schedule.start_time)}
        </Text>
      )}

      {/* Duration + price */}
      {service && (
        <View className="flex-row gap-4 mt-1">
          <Text className="text-gray-500 text-sm">
            ⏱ {service.duration_minutes} min
          </Text>
          <Text className="text-gray-500 text-sm">
            {service.price.toFixed(0)} NOK
          </Text>
        </View>
      )}

      {/* Cancel button — only for upcoming, non-cancelled bookings */}
      {booking.status !== "cancelled" &&
        schedule?.start_time &&
        new Date(schedule.start_time) > new Date() && (
          <TouchableOpacity
            onPress={handleCancel}
            className="mt-4 border border-red-500/40 rounded-xl py-2.5 items-center active:opacity-70"
          >
            <Text className="text-red-400 font-semibold text-sm">
              Cancel Booking
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );
}
