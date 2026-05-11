import { useTheme } from "@/context/ThemeContext";
import { revenuecatService } from "@/services/revenuecatService";
import { authApi } from "@/services/api";
import { pullAndMerge } from "@/services/cloudMerge";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const { colors } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProFromServer = useSettingsStore((s) => s.setProFromServer);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      const { accessToken, user } = res.data;
      await setAuth(accessToken, user);
      setProFromServer(user.isPro ?? false);
      try {
        await revenuecatService.logIn(user.id);
      } catch {
        // Non-fatal: app can still continue and entitlement can be refreshed later.
      }
      // Pull cloud data and merge with local stores in background
      pullAndMerge();
      router.replace("/(main)/focus");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.response?.data ?? null;
      setError(typeof msg === "string" ? msg : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    inner: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingTop: 60,
      paddingBottom: 40,
    },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 32,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    sub: {
      fontFamily: "SoraRegular",
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 40,
    },
    label: {
      fontFamily: "SoraSemiBold",
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: "SoraRegular",
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 20,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: "SoraRegular",
      fontSize: 15,
      color: colors.textPrimary,
    },
    eyeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    error: {
      fontFamily: "SoraRegular",
      fontSize: 13,
      color: colors.destructive,
      marginBottom: 16,
      textAlign: "center",
    },
    btn: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { fontFamily: "SoraSemiBold", fontSize: 16, color: "#FFFFFF" },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
      gap: 4,
    },
    footerText: {
      fontFamily: "SoraRegular",
      fontSize: 14,
      color: colors.textSecondary,
    },
    footerLink: {
      fontFamily: "SoraSemiBold",
      fontSize: 14,
      color: colors.accent,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={s.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.heading}>Welcome back</Text>
        <Text style={s.sub}>Sign in to sync your data across devices.</Text>

        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={s.label}>Password</Text>
        <View style={s.passwordContainer}>
          <TextInput
            style={s.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={s.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>

        {error && <Text style={s.error}>{error}</Text>}

        <Pressable
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.btnText}>Sign in</Text>
          )}
        </Pressable>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push("/(auth)/register" as any)}>
            <Text style={s.footerLink}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
