import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "minutemethod://reset-password",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-20 pb-10">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-10 self-start"
        >
          <Text className="text-primary-500 text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-white mb-3">
          Reset Password
        </Text>
        <Text className="text-gray-400 mb-8">
          Enter your email and we'll send a reset link.
        </Text>

        {sent ? (
          <View className="bg-green-500/20 border border-green-500/40 rounded-xl p-5">
            <Text className="text-green-400 text-base font-semibold mb-1">
              Email sent!
            </Text>
            <Text className="text-green-300 text-sm">
              Check your inbox for the password reset link.
            </Text>
          </View>
        ) : (
          <>
            <View>
              <Text className="text-gray-400 text-sm mb-2">Email</Text>
              <TextInput
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-base"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              className={`mt-6 rounded-xl py-4 items-center ${
                loading ? "bg-primary-500/50" : "bg-primary-500"
              }`}
              onPress={handleReset}
              disabled={loading}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Sending…" : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
