import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { login } from "../services/authapi";

export default function LoginScreen() {
  const [role, setRole] = useState("donor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password.",
      );
      return;
    }

    try {
      setLoading(true);
      console.log("Starting login...");
      console.log("API URL:", "http://192.168.1.4:8000/auth/login");
      const data = await login(email.trim(), password);

      console.log("Login successful:", data);

      await SecureStore.setItemAsync("access_token", data.access_token);

      await SecureStore.setItemAsync("user", JSON.stringify(data.user));

      router.replace(`/${data.user.role}`);
    } catch (error) {
      console.error("Login error:", error);

      Alert.alert(
        "Login failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={async () => {
          console.log("NETWORK TEST STARTED");
          console.log("Testing URL:", "http://192.168.1.4:8000/health");

          try {
            const response = await fetch("http://192.168.1.4:8000/health");

            const result = await response.text();

            console.log("STATUS:", response.status);
            console.log("RESPONSE:", result);

            Alert.alert("Network test", result);
          } catch (error) {
            console.log("NETWORK TEST ERROR:", String(error));
            Alert.alert("Network test failed", String(error));
          }
        }}
        style={{ padding: 12, backgroundColor: "#ddd", marginTop: 12 }}
      >
        <Text>Test Backend Connection</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Image
        source={require("../../assets/foodrescue-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome back 👋</Text>

      <Text style={styles.subtitle}>Login to continue making an impact.</Text>

      <Text style={styles.label}>Email</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>

      <TextInput
        placeholder="Enter your password"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Login as</Text>

      <View style={styles.roles}>
        {["donor", "ngo", "volunteer"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setRole(item)}
            style={[styles.role, role === item && styles.selectedRole]}
          >
            <Text
              style={[
                styles.roleText,
                role === item && styles.selectedRoleText,
              ]}
            >
              {item === "ngo"
                ? "NGO"
                : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <View style={styles.registerRow}>
        <Text style={styles.normalText}>Don't have an account? </Text>

        <Pressable onPress={() => router.push("/register")}>
          <Text style={styles.link}>Register</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 24,
    paddingTop: 55,
  },

  back: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 45,
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 4,
  },

  title: {
    fontSize: 31,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 7,
    marginBottom: 32,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    height: 54,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
  },

  roles: {
    flexDirection: "row",
    gap: 8,
  },

  role: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },

  selectedRole: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },

  roleText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  selectedRoleText: {
    color: COLORS.primaryDark,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  normalText: {
    color: COLORS.textSecondary,
  },

  link: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
});
