import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase, Booking } from "@/lib/supabase";
import { BookingCard } from "@/components/BookingCard";

type Tab = "upcoming" | "past";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("upcoming");

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  async function loadBookings() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules (
          *,
          service:services (*)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "Could not load bookings.");
    } else {
      setBookings((data as Booking[]) ?? []);
    }
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }

  const now = new Date();

  const upcoming = bookings.filter((b) => {
    const startTime = b.schedule?.start_time;
    return (
      b.status !== "cancelled" &&
      startTime &&
      new Date(startTime) > now
    );
  });

  const past = bookings.filter((b) => {
    const startTime = b.schedule?.start_time;
    return (
      b.status === "cancelled" ||
      !startTime ||
      new Date(startTime) <= now
    );
  });

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <View className="flex-1 bg-primary-900">
      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <Text className="text-white text-2xl font-bold">My Bookings</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Manage your sessions
        </Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row px-6 mb-4 gap-3">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <View
            key={t}
            className="flex-row items-center"
          >
            <View
              className={`px-4 py-2 rounded-full border ${
                tab === t
                  ? "bg-primary-500 border-primary-500"
                  : "bg-transparent border-white/20"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  tab === t ? "text-white" : "text-gray-400"
                }`}
                onPress={() => setTab(t)}
              >
                {t === "upcoming"
                  ? `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ""}`
                  : "Past"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bookings list */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4f6ef7"
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4f6ef7"
            className="mt-10"
          />
        ) : displayed.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-4xl mb-4">
              {tab === "upcoming" ? "📅" : "📋"}
            </Text>
            <Text className="text-white text-lg font-semibold mb-2">
              {tab === "upcoming"
                ? "No upcoming bookings"
                : "No past bookings"}
            </Text>
            <Text className="text-gray-400 text-sm text-center px-4">
              {tab === "upcoming"
                ? "Head to the Home tab to browse classes and book a session."
                : "Your completed sessions will appear here."}
            </Text>
          </View>
        ) : (
          displayed.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancelled={loadBookings}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
