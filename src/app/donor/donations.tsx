import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import DonationCard from "../../components/DonationCard";
import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

type ApiDonation = {
  id: number;
  food_name: string;
  quantity: string | number;
  category?: string | null;
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
  image?: string;
};

function formatExpiry(value?: string | null): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

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
    image: "🍱",
  };
}

function isDelivered(status: string) {
  return ["delivered", "completed"].includes(status.toLowerCase());
}

function isActive(status: string) {
  return [
    "available",
    "claimed",
    "picked_up",
    "in_progress",
  ].includes(status.toLowerCase());
}

export default function MyDonations() {
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

      setDonations(
        response.map((item: ApiDonation) => mapDonation(item))
      );
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

  const total = donations.length;
  const active = donations.filter((item) =>
    isActive(item.status)
  ).length;
  const delivered = donations.filter((item) =>
    isDelivered(item.status)
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>My Donations</Text>

      <Text style={styles.subtitle}>
        Track the food you have donated.
      </Text>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.number}>{total}</Text>
          <Text style={styles.label}>Total</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.number}>{active}</Text>
          <Text style={styles.label}>Active</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.number}>{delivered}</Text>
          <Text style={styles.label}>Delivered</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.message}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.messageText}>
            Loading your donations...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.message}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadDonations}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : donations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍱</Text>
          <Text style={styles.emptyTitle}>No donations yet</Text>
          <Text style={styles.messageText}>
            Once you list food for donation, it will appear here.
          </Text>
        </View>
      ) : (
        donations.map((item) => (
          <DonationCard key={item.id} donation={item} />
        ))
      )}
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 22,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: {
    alignItems: "center",
  },
  number: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.primaryDark,
    textAlign: "center",
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  message: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 10,
  },
  messageText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 14,
  },
  retry: {
    color: COLORS.primary,
    fontWeight: "700",
    padding: 8,
  },
  empty: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
});