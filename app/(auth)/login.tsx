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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
    }
    // Auth guard in _layout.tsx will redirect to (app) on success
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
          {/* Logo / Title */}
          <View className="mb-12">
            <Text className="text-4xl font-bold text-primary-500 tracking-tight">
              MinuteMethod
            </Text>
            <Text className="text-primary-500 text-lg mt-1">
              Book smarter. Train harder.
            </Text>
          </View>

          {/* Form */}
          <Text className="text-2xl font-bold text-white mb-8">
            Welcome back
          </Text>

          <View className="gap-4">
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
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="mt-3 self-end">
              <Text className="text-primary-500 text-sm">Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          {/* Login Button */}
          <TouchableOpacity
            className={`mt-8 rounded-xl py-4 items-center ${
              loading ? "bg-primary-500/50" : "bg-primary-500"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Signing in…" : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
