import { View, Text, TouchableOpacity } from "react-native";
import { Schedule } from "@/lib/supabase";

type Props = {
  schedule: Schedule;
  selected?: boolean;
  onPress: () => void;
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function TimeSlot({ schedule, selected = false, onPress }: Props) {
  const spotsLeft = schedule.max_capacity - schedule.booked_count;
  const isFull = spotsLeft === 0;

  return (
    <TouchableOpacity
      onPress={isFull ? undefined : onPress}
      disabled={isFull}
      className={`flex-row justify-between items-center rounded-xl px-4 py-4 mb-2 border ${
        isFull
          ? "bg-white/5 border-white/10 opacity-50"
          : selected
          ? "bg-primary-500 border-primary-500"
          : "bg-white/10 border-white/20 active:opacity-70"
      }`}
    >
      {/* Time */}
      <View>
        <Text
          className={`font-semibold text-base ${
            selected ? "text-white" : "text-white"
          }`}
        >
          {formatTime(schedule.start_time)}
        </Text>
        <Text
          className={`text-sm mt-0.5 ${
            selected ? "text-white/80" : "text-gray-400"
          }`}
        >
          → {formatTime(schedule.end_time)}
        </Text>
      </View>

      {/* Capacity */}
      <View className="items-end">
        {isFull ? (
          <Text className="text-red-400 font-semibold text-sm">Full</Text>
        ) : (
          <>
            <Text
              className={`font-semibold text-sm ${
                selected ? "text-white" : "text-green-400"
              }`}
            >
              {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
            </Text>
            <Text
              className={`text-xs mt-0.5 ${
                selected ? "text-white/70" : "text-gray-500"
              }`}
            >
              of {schedule.max_capacity}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
