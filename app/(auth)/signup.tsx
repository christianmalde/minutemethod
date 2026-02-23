import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!fullName || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
    } else {
      Alert.alert(
        "Account created!",
        "Check your email for a confirmation link, then sign in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-10">
          {/* Title */}
          <View className="mb-10">
            <Text className="text-4xl font-bold text-white tracking-tight">
              MinuteMethod
            </Text>
            <Text className="text-primary-500 text-lg mt-1">
              Book smarter. Train harder.
            </Text>
          </View>

          <Text className="text-2xl font-bold text-white mb-8">
            Create account
          </Text>

          <View className="gap-4">
            <View>
              <Text className="text-gray-400 text-sm mb-2">Full Name</Text>
              <TextInput
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-base"
                placeholder="Jane Smith"
                placeholderTextColor="#9ca3af"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

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

            <View>
              <Text className="text-gray-400 text-sm mb-2">Password</Text>
              <TextInput
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-base"
                placeholder="Min. 8 characters"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-base"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`mt-8 rounded-xl py-4 items-center ${
              loading ? "bg-primary-500/50" : "bg-primary-500"
            }`}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Creating account…" : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
