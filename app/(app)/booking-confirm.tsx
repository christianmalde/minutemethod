import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase, Schedule, Service } from "@/lib/supabase";

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { scheduleId, serviceId, serviceName } = useLocalSearchParams<{
    scheduleId: string;
    serviceId: string;
    serviceName: string;
  }>();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [scheduleId, serviceId]);

  async function loadDetails() {
    setLoading(true);
    const [schedRes, svcRes] = await Promise.all([
      supabase.from("schedules").select("*").eq("id", scheduleId).single(),
      supabase.from("services").select("*").eq("id", serviceId).single(),
    ]);
    if (!schedRes.error) setSchedule(schedRes.data);
    if (!svcRes.error) setService(svcRes.data);
    setLoading(false);
  }

  async function handleConfirmBooking() {
    if (!schedule || !service) return;

    setBooking(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Not signed in", "Please sign in to book.");
      setBooking(false);
      return;
    }

    // Check capacity (optimistic, DB constraint is the safety net)
    if (schedule.booked_count >= schedule.max_capacity) {
      Alert.alert("Slot full", "This slot is now full. Please choose another.");
      setBooking(false);
      return;
    }

    // Insert booking
    const { error: bookingError } = await supabase.from("bookings").insert({
      user_id: user.id,
      schedule_id: schedule.id,
      status: "confirmed",
      payment_status: "unpaid",
    });

    if (bookingError) {
      if (bookingError.code === "23505") {
        Alert.alert("Already booked", "You already have a booking for this slot.");
      } else {
        Alert.alert("Booking failed", bookingError.message);
      }
      setBooking(false);
      return;
    }

    // Increment booked_count
    await supabase
      .from("schedules")
      .update({ booked_count: schedule.booked_count + 1 })
      .eq("id", schedule.id);

    setBooking(false);

    Alert.alert(
      "Booking confirmed! 🎉",
      `You're booked in for ${serviceName}. See you there!`,
      [
        {
          text: "View My Bookings",
          onPress: () => router.replace("/(app)/my-bookings"),
        },
        {
          text: "Back to Home",
          onPress: () => router.replace("/(app)"),
        },
      ]
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-primary-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4f6ef7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-primary-500">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            Confirm Booking
          </Text>
        </View>

        {/* Booking Summary Card */}
        <View className="mx-6 bg-white/10 rounded-2xl p-6">
          <Text className="text-gray-400 text-sm uppercase tracking-wide mb-4 font-semibold">
            Booking Summary
          </Text>

          {/* Service */}
          <View className="mb-5">
            <Text className="text-primary-500 text-xl font-bold">
              {service?.name}
            </Text>
            {service?.instructor_name && (
              <Text className="text-gray-400 mt-1">
                with {service.instructor_name}
              </Text>
            )}
          </View>

          <View className="border-t border-white/10 pt-4 gap-3">
            {/* Date */}
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Date</Text>
              <Text className="text-white font-medium">
                {schedule ? formatDateTime(schedule.start_time) : "—"}
              </Text>
            </View>

            {/* Time */}
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Time</Text>
              <Text className="text-white font-medium">
                {schedule
                  ? `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`
                  : "—"}
              </Text>
            </View>

            {/* Duration */}
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Duration</Text>
              <Text className="text-white font-medium">
                {service?.duration_minutes} min
              </Text>
            </View>

            {/* Spots left */}
            {schedule && (
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Availability</Text>
                <Text className="text-green-400 font-medium">
                  {schedule.max_capacity - schedule.booked_count} spot
                  {schedule.max_capacity - schedule.booked_count !== 1
                    ? "s"
                    : ""}{" "}
                  remaining
                </Text>
              </View>
            )}

            <View className="border-t border-white/10 pt-3 mt-1">
              <View className="flex-row justify-between">
                <Text className="text-white font-bold text-base">Total</Text>
                <Text className="text-white font-bold text-base">
                  ${service?.price.toFixed(2)}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                Payment handled at the gym / via Stripe (coming soon)
              </Text>
            </View>
          </View>
        </View>

        {/* Policy note */}
        <View className="mx-6 mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <Text className="text-yellow-400 text-sm font-semibold mb-1">
            Cancellation Policy
          </Text>
          <Text className="text-yellow-300/70 text-xs">
            Free cancellation up to 2 hours before your session. Late
            cancellations may incur a fee.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View className="absolute bottom-0 left-0 right-0 bg-primary-900/95 border-t border-white/10 px-6 py-4">
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={booking}
          className={`rounded-xl py-4 items-center ${
            booking ? "bg-primary-500/50" : "bg-primary-500"
          }`}
        >
          <Text className="text-white font-bold text-base">
            {booking ? "Confirming…" : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
