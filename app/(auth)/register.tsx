import { useTheme } from "@/context/ThemeContext";
import { authApi } from "@/services/api";
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

export default function RegisterScreen() {
  const { colors } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProFromServer = useSettingsStore((s) => s.setProFromServer);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const { accessToken, user } = res.data;
      await setAuth(accessToken, user);
      setProFromServer(user.isPro ?? false);
      router.replace("/(main)/focus");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.response?.data ?? null;
      setError(
        typeof msg === "string"
          ? msg
          : "Registration failed. Please try again.",
      );
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
    row: { flexDirection: "row", gap: 12 },
    flex1: { flex: 1 },
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
        <Text style={s.heading}>Create account</Text>
        <Text style={s.sub}>Back up your data and sync across devices.</Text>

        <View style={s.row}>
          <View style={s.flex1}>
            <Text style={s.label}>First name</Text>
            <TextInput
              style={s.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Ada"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>
          <View style={s.flex1}>
            <Text style={s.label}>Last name</Text>
            <TextInput
              style={s.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Lovelace"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>
        </View>

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
            placeholder="At least 6 characters"
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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.btnText}>Create account</Text>
          )}
        </Pressable>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={s.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
