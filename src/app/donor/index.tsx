import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import DonationCard from "../../components/DonationCard";

import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

type ApiDonation = {
  id: number;
  food_name: string;
  quantity: string | number;
  category?: string | null;
  description?: string | null;
  expiry_time?: string | null;
  pickup_location?: string | null;
  status: string;
};

type DonationCardData = {
  id: number;
  food: string;
  quantity: string;
  category?: string;
  expiry?: string;
  location?: string;
  status: string;
};

function formatExpiry(value?: string | null): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapDonation(item: ApiDonation): DonationCardData {
  return {
    id: item.id,
    food: item.food_name,
    quantity: String(item.quantity),
    category: item.category ?? undefined,
    expiry: formatExpiry(item.expiry_time),
    location: item.pickup_location ?? undefined,
    status: item.status,
  };
}

export default function DonorDashboard() {
  const [donations, setDonations] = useState<DonationCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch("/donations/my");

      if (!Array.isArray(response)) {
        throw new Error("Unexpected response from the donations API.");
      }

      const mappedDonations = response.map((item: ApiDonation) =>
        mapDonation(item)
      );

      setDonations(mappedDonations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your donations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [loadDonations])
  );

  const totalDonations = donations.length;

  const completedDonations = donations.filter((item) =>
    ["completed", "delivered"].includes(item.status.toLowerCase())
  ).length;

  const activeDonations = donations.filter((item) =>
    ["available", "claimed", "picked_up", "in_progress"].includes(
      item.status.toLowerCase()
    )
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Hello, Donor 👋"
        subtitle="Together, we can reduce food waste."
      />

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <StatCard
            title="Total Donations"
            value={String(totalDonations)}
          />
        </View>

        <View style={styles.statItem}>
          <StatCard
            title="Completed"
            value={String(completedDonations)}
          />
        </View>

        <View style={styles.statItem}>
          <StatCard
            title="Active Donations"
            value={String(activeDonations)}
          />
        </View>

        <View style={styles.statItem}>
          <StatCard
            title="Meals Saved"
            value="—"
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.donateButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/donor/donate")}
      >
        <Text style={styles.donateButtonText}>+ Donate Food</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Donations</Text>

        <Pressable
          onPress={() => router.push("/donor/donations")}
        >
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.infoText}>
          Loading your donations...
        </Text>
      ) : error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={loadDonations}>
            <Text style={styles.viewAll}>Try again</Text>
          </Pressable>
        </View>
      ) : donations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍱</Text>

          <Text style={styles.emptyTitle}>
            No donations yet
          </Text>

          <Text style={styles.infoText}>
            Your donations will appear here after you donate food.
          </Text>
        </View>
      ) : (
        donations.slice(0, 3).map((item) => (
          <DonationCard
            key={item.id}
            donation={item}
          />
        ))
      )}

      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>
          Your Impact 🌱
        </Text>

        <Text style={styles.impactText}>
          Every donation makes a difference. Keep sharing surplus
          food to help reduce waste and support your community.
        </Text>

        <Text style={styles.impactFootnote}>
          Your donation activity is updated from your account.
        </Text>
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
    padding: 20,
    paddingBottom: 32,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },

  statItem: {
    width: "48%",
    marginBottom: 12,
  },

  donateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  donateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  viewAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    paddingVertical: 10,
  },

  messageContainer: {
    paddingVertical: 12,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },

  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  impactCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 20,
    marginTop: 24,
  },

  impactTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },

  impactText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  impactFootnote: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
});
