import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase, Booking } from "@/lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  class: "Group Class",
  pt: "Home Class",
};

const TYPE_BADGE: Record<string, string> = {
  class: "bg-primary-500/20",
  pt: "bg-accent-400/20",
};

const TYPE_TEXT: Record<string, string> = {
  class: "text-primary-500",
  pt: "text-accent-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function SummaryScreen() {
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("bookings")
      .select(`*, schedule:schedules(*, service:services(*))`)
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    const now = new Date();
    const completed = ((data as Booking[]) ?? []).filter(
      (b) => b.schedule?.start_time && new Date(b.schedule.start_time) < now
    );
    setSessions(completed);
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const classes = sessions.filter(
    (b) => b.schedule?.service?.type === "class"
  );
  const ptSessions = sessions.filter(
    (b) => b.schedule?.service?.type === "pt"
  );

  return (
    <View className="flex-1 bg-primary-900">
      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <Text className="text-primary-500 text-2xl font-bold">Summary</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Your completed sessions
        </Text>
      </View>

      {/* Stats row */}
      <View className="flex-row px-6 gap-3 mb-5">
        {[
          { label: "Total", value: sessions.length, color: "text-white" },
          {
            label: "Classes",
            value: classes.length,
            color: "text-primary-500",
          },
          {
            label: "Home Classes",
            value: ptSessions.length,
            color: "text-accent-400",
          },
        ].map((stat) => (
          <View
            key={stat.label}
            className="flex-1 bg-white/10 rounded-2xl p-4 items-center"
          >
            <Text className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Session list */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#dc2626"
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#dc2626" className="mt-10" />
        ) : sessions.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-4xl mb-4">🏋️</Text>
            <Text className="text-white text-lg font-semibold mb-2">
              No sessions yet
            </Text>
            <Text className="text-gray-400 text-sm text-center px-4">
              Your completed classes and PT sessions will appear here.
            </Text>
          </View>
        ) : (
          sessions.map((booking) => {
            const service = booking.schedule?.service;
            const type = service?.type ?? "class";
            return (
              <View
                key={booking.id}
                className="bg-white/10 rounded-2xl p-5 mb-3"
              >
                {/* Name + badge */}
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-primary-500 font-bold text-base flex-1 mr-3">
                    {service?.name ?? "Session"}
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full ${TYPE_BADGE[type]}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${TYPE_TEXT[type]}`}
                    >
                      {TYPE_LABELS[type]}
                    </Text>
                  </View>
                </View>

                {/* Instructor */}
                {service?.instructor_name && (
                  <Text className="text-gray-400 text-sm mb-1">
                    with {service.instructor_name}
                  </Text>
                )}

                {/* Date + time */}
                {booking.schedule?.start_time && (
                  <Text className="text-white text-sm">
                    📅 {formatDate(booking.schedule.start_time)} ·{" "}
                    {formatTime(booking.schedule.start_time)}
                  </Text>
                )}

                {/* Duration + price */}
                {service && (
                  <View className="flex-row gap-4 mt-2">
                    <Text className="text-gray-500 text-sm">
                      ⏱ {service.duration_minutes} min
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {service.price.toFixed(0)} NOK
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
