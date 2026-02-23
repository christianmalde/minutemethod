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
import { supabase, Schedule } from "@/lib/supabase";
import { TimeSlot } from "@/components/TimeSlot";

const DAYS_TO_SHOW = 7;

function getDaysArray(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

export default function ScheduleScreen() {
  const router = useRouter();
  const { serviceId, serviceName } = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
  }>();

  const days = getDaysArray();
  const [selectedDay, setSelectedDay] = useState<Date>(days[0]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceId) loadSchedules();
  }, [serviceId, selectedDay]);

  async function loadSchedules() {
    setLoading(true);
    setSelectedSchedule(null);

    const dayStart = new Date(selectedDay);
    const dayEnd = new Date(selectedDay);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("service_id", serviceId)
      .gte("start_time", dayStart.toISOString())
      .lt("start_time", dayEnd.toISOString())
      .order("start_time");

    if (error) {
      Alert.alert("Error", "Could not load schedule.");
    } else {
      setSchedules(data ?? []);
    }
    setLoading(false);
  }

  function handleProceed() {
    if (!selectedSchedule) {
      Alert.alert("No slot selected", "Please pick a time slot to continue.");
      return;
    }
    router.push({
      pathname: "/(app)/booking-confirm",
      params: {
        scheduleId: selectedSchedule.id,
        serviceId,
        serviceName,
      },
    });
  }

  return (
    <View className="flex-1 bg-primary-900">
      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-primary-500">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">{serviceName}</Text>
        <Text className="text-gray-400 text-sm mt-1">Choose a date and time</Text>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
      >
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => setSelectedDay(day)}
              className={`mr-3 items-center px-4 py-3 rounded-2xl min-w-[60px] ${
                isSelected ? "bg-primary-500" : "bg-white/10"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {DAY_LABELS[day.getDay()]}
              </Text>
              <Text
                className={`text-lg font-bold mt-0.5 ${
                  isSelected ? "text-white" : "text-white"
                }`}
              >
                {day.getDate()}
              </Text>
              <Text
                className={`text-xs mt-0.5 ${
                  isSelected ? "text-white/70" : "text-gray-500"
                }`}
              >
                {MONTH_LABELS[day.getMonth()]}
              </Text>
              {isToday && (
                <View
                  className={`mt-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-primary-500"
                  }`}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slots */}
      <ScrollView
        className="flex-1 px-6 mt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#4f6ef7" className="mt-10" />
        ) : schedules.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-gray-400 text-base">
              No slots available on this day.
            </Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <TimeSlot
              key={schedule.id}
              schedule={schedule}
              selected={selectedSchedule?.id === schedule.id}
              onPress={() => setSelectedSchedule(schedule)}
            />
          ))
        )}
      </ScrollView>

      {/* Sticky confirm bar */}
      {selectedSchedule && (
        <View className="absolute bottom-0 left-0 right-0 bg-primary-900/95 border-t border-white/10 px-6 py-4">
          <TouchableOpacity
            onPress={handleProceed}
            className="bg-primary-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-bold text-base">
              Continue →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
