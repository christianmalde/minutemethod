import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase, Message } from "@/lib/supabase";

const PT_NAME = "Christian Malde";
const PT_TITLE = "Personal Trainer";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [])
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);

      channel = supabase
        .channel("messages-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setMessages((prev) => {
              // avoid duplicates from optimistic updates
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new as Message];
            });
            setTimeout(
              () => flatListRef.current?.scrollToEnd({ animated: true }),
              100
            );
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function loadMessages() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error) setMessages((data as Message[]) ?? []);
    setLoading(false);
    setTimeout(
      () => flatListRef.current?.scrollToEnd({ animated: false }),
      100
    );
  }

  async function handleSend() {
    const content = text.trim();
    if (!content || !userId || sending) return;

    setSending(true);
    setText("");

    // Optimistic insert
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      user_id: userId,
      content,
      sender: "user",
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(
      () => flatListRef.current?.scrollToEnd({ animated: true }),
      100
    );

    const { error } = await supabase.from("messages").insert({
      user_id: userId,
      content,
      sender: "user",
    });

    if (error) {
      Alert.alert("Error", "Could not send message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content);
    }

    setSending(false);
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.sender === "user";
    return (
      <View
        className={`mb-3 max-w-[80%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
      >
        {!isUser && (
          <Text className="text-gray-500 text-xs mb-1 ml-1">{PT_NAME}</Text>
        )}
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary-500 rounded-tr-sm"
              : "bg-white/15 rounded-tl-sm"
          }`}
        >
          <Text className="text-white text-sm leading-5">{item.content}</Text>
        </View>
        <Text className="text-gray-600 text-xs mt-1 mx-1">
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-4 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center">
            <Text className="text-white font-bold text-base">CM</Text>
          </View>
          <View>
            <Text className="text-white font-bold text-base">{PT_NAME}</Text>
            <Text className="text-gray-400 text-xs">{PT_TITLE}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 8,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-start",
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View className="items-center">
              <Text className="text-4xl mb-4">💬</Text>
              <Text className="text-white font-semibold text-base mb-2">
                Start the conversation
              </Text>
              <Text className="text-gray-400 text-sm text-center px-6">
                Send a message to {PT_NAME} about your training, schedule or any
                questions.
              </Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View className="flex-row items-end px-4 py-3 border-t border-white/10 gap-3">
        <TextInput
          className="flex-1 bg-white/10 text-white rounded-2xl px-4 py-3 text-sm"
          placeholder="Message Christian..."
          placeholderTextColor="#6b7280"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sending}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            text.trim() && !sending ? "bg-primary-500" : "bg-white/10"
          }`}
        >
          <Text className="text-white font-bold text-base">↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
