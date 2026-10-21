
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";
import { COLORS } from "../constants/colors";
import { register } from "../services/authapi";

type UserRole = "donor" | "ngo" | "volunteer";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("donor");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate the form
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing details", "Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak password",
        "Your password must contain at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("REGISTER URL:", "Registering through configured API");

      // Send registration details to the backend
      const user = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        role
      );

      console.log("Registration successful:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      Alert.alert(
        "Account created!",
        "Your account has been registered successfully. Please log in.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);

      Alert.alert(
        "Registration failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Create your account</Text>

      <Text style={styles.subtitle}>
        Join the FoodRescue community.
      </Text>

      <Text style={styles.label}>Full Name</Text>

      <TextInput
        placeholder="Enter your name"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!loading}
      />

      <Text style={styles.label}>Email</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <Text style={styles.label}>Password</Text>

      <TextInput
        placeholder="Create a password"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />

      <Text style={styles.label}>I am registering as</Text>

      <View style={styles.roles}>
        {(["donor", "ngo", "volunteer"] as UserRole[]).map((item) => (
          <Pressable
            key={item}
            disabled={loading}
            onPress={() => setRole(item)}
            style={[
              styles.role,
              role === item && styles.selectedRole,
            ]}
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
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </Pressable>

      <View style={styles.loginRow}>
        <Text style={styles.normalText}>
          Already have an account?{" "}
        </Text>

        <Pressable
          disabled={loading}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.link}>Login</Text>
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
    paddingBottom: 40,
  },

  back: {
    color: COLORS.primaryDark,
    fontWeight: "600",
    marginBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 28,
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
    backgroundColor: COLORS.white,
    alignItems: "center",
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
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  normalText: {
    color: COLORS.textSecondary,
  },

  link: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
});
