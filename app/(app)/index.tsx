import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase, Service } from "@/lib/supabase";
import { ClassCard } from "@/components/ClassCard";

type FilterType = "all" | "class" | "pt";

export default function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Fetch user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      }
    }

    // Fetch services
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("type")
      .order("name");

    if (error) {
      Alert.alert("Error", "Could not load services.");
    } else {
      setServices(data ?? []);
    }

    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const filtered = services.filter(
    (s) => filter === "all" || s.type === filter
  );

  return (
    <View className="flex-1 bg-primary-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-gray-400 text-sm">Good{getGreeting()},</Text>
              <Text className="text-white text-2xl font-bold mt-0.5">
                {userName || "Athlete"} 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-white/10 px-4 py-2 rounded-full"
            >
              <Text className="text-gray-300 text-sm">Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View className="mt-6 bg-primary-500/20 border border-primary-500/30 rounded-2xl p-5">
            <Text className="text-primary-500 font-bold text-sm mb-1 uppercase tracking-wide">
              Ready to train?
            </Text>
            <Text className="text-white text-xl font-bold">
              Pick a class or book a session
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              Browse live schedules and lock in your spot in seconds.
            </Text>
          </View>
        </View>

        {/* Filter pills */}
        <View className="flex-row px-6 gap-3 mb-5">
          {(["all", "class", "pt"] as FilterType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              className={`px-4 py-2 rounded-full border ${
                filter === type
                  ? "bg-primary-500 border-primary-500"
                  : "bg-transparent border-white/20"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  filter === type ? "text-white" : "text-gray-400"
                }`}
              >
                {type === "all" ? "All" : type === "pt" ? "Personal Trainer" : "Classes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Services list */}
        <View className="px-6">
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4f6ef7"
              className="mt-10"
            />
          ) : filtered.length === 0 ? (
            <Text className="text-gray-400 text-center mt-10">
              No services available.
            </Text>
          ) : (
            filtered.map((service) => (
              <ClassCard
                key={service.id}
                service={service}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/schedule",
                    params: { serviceId: service.id, serviceName: service.name },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return " morning";
  if (hour < 17) return " afternoon";
  return " evening";
}
