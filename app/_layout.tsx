import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { View, ActivityIndicator } from "react-native";
import "../global.css";

function AuthGuard({ session }: { session: Session | null | undefined }) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (session === undefined) return; // still loading

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [session, segments]);

  return null;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-900">
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <>
      <AuthGuard session={session} />
      <Slot />
    </>
  );
}
