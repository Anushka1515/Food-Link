import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { useEffect } from "react";
import { testBackend } from "../services/api";
import { router } from "expo-router";
import { COLORS } from "../constants/colors";

export default function HomeScreen() {
  useEffect(() => {
  testBackend()
    .then((data) => {
      console.log("Backend connected:", data);
    })
    .catch((error) => {
      console.error("Backend connection failed:", error);
    });
}, []);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/foodrescue-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.brand}>FoodRescue</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.emoji}>🥗</Text>

        <Text style={styles.heading}>
          Turn surplus food into someone's next meal.
        </Text>

        <Text style={styles.description}>
          Connect surplus food with people and communities
          who need it most.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.primaryButtonText}>
            Get Started
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>156+</Text>
          <Text style={styles.statLabel}>Meals Saved</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Donors</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>NGOs</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        How it works
      </Text>

      <Step
        number="1"
        title="List Food"
        description="Donors list their available surplus food."
        icon="🍱"
      />

      <Step
        number="2"
        title="Smart Match"
        description="NGOs find suitable donations nearby."
        icon="🤝"
      />

      <Step
        number="3"
        title="Pickup"
        description="Volunteers collect and deliver the food."
        icon="🚚"
      />

      <Step
        number="4"
        title="Make an Impact"
        description="Good food reaches people instead of landfills."
        icon="💚"
      />
    </ScrollView>
  );
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepIcon}>
        <Text style={styles.stepEmoji}>{icon}</Text>
      </View>

      <View style={styles.stepContent}>
        <Text style={styles.stepNumber}>STEP {number}</Text>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 24,
    paddingTop: 65,
    paddingBottom: 40,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 50,
    height: 50,
  },

  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  hero: {
    marginTop: 65,
    alignItems: "center",
  },

  emoji: {
    fontSize: 55,
    marginBottom: 20,
  },

  heading: {
    fontSize: 35,
    lineHeight: 42,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 30,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 15,
    paddingVertical: 10,
  },

  secondaryButtonText: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 45,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
  },

  stat: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 42,
    marginBottom: 18,
  },

  step: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  stepIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  stepEmoji: {
    fontSize: 25,
  },

  stepContent: {
    flex: 1,
    marginLeft: 14,
  },

  stepNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 3,
  },

  stepDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
});