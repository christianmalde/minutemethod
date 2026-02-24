import { View, Text, TouchableOpacity } from "react-native";
import { Service } from "@/lib/supabase";

type Props = {
  service: Service;
  onPress: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  class: "bg-primary-500",
  pt: "bg-accent-400",
};

const TYPE_LABELS: Record<string, string> = {
  class: "Group Class",
  pt: "Personal Trainer",
};

export function ClassCard({ service, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white/10 rounded-2xl p-5 mb-3 active:opacity-70"
    >
      {/* Header row */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-primary-500 text-lg font-bold">{service.name}</Text>
          {service.instructor_name && (
            <Text className="text-gray-400 text-sm mt-0.5">
              with {service.instructor_name}
            </Text>
          )}
        </View>
        <View
          className={`px-3 py-1 rounded-full ${TYPE_COLORS[service.type] ?? "bg-gray-600"}`}
        >
          <Text className="text-white text-xs font-semibold">
            {TYPE_LABELS[service.type] ?? service.type}
          </Text>
        </View>
      </View>

      {/* Description */}
      {service.description ? (
        <Text className="text-white text-sm mb-4" numberOfLines={2}>
          {service.description}
        </Text>
      ) : null}

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-4">
          <Text className="text-gray-400 text-sm">
            ⏱ {service.duration_minutes} min
          </Text>
        </View>
        <Text className="text-white font-bold text-base">
          {service.price.toFixed(0)} NOK
        </Text>
      </View>
    </TouchableOpacity>
  );
}
