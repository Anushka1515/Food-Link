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

export default function Analytics() {
  const [donations, setDonations] = useState<ApiDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadImpact = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch("/donations/my");

      if (!Array.isArray(response)) {
        throw new Error("Unexpected response from the donations API.");
      }

      setDonations(response as ApiDonation[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your impact data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadImpact();
    }, [loadImpact])
  );

  const total = donations.length;
  const delivered = donations.filter((item) =>
    isDelivered(item.status)
  ).length;
  const active = donations.filter((item) =>
    isActive(item.status)
  ).length;
  const other = total - delivered - active;

  const statusItems = [
    {
      label: "Available / In progress",
      count: active,
      color: COLORS.primary,
    },
    {
      label: "Delivered / Completed",
      count: delivered,
      color: "#16A34A",
    },
    {
      label: "Other statuses",
      count: other,
      color: "#94A3B8",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Your Impact</Text>

      <Text style={styles.subtitle}>
        See your food donation activity using your actual records.
      </Text>

      {loading ? (
        <View style={styles.message}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.messageText}>
            Loading your impact...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.message}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadImpact}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.impactCard}>
            <Text style={styles.impactEmoji}>🌱</Text>
            <Text style={styles.bigNumber}>{total}</Text>
            <Text style={styles.impactLabel}>
              Total Donations Listed
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.smallCard}>
              <Text style={styles.smallIcon}>📦</Text>
              <Text style={styles.smallNumber}>{total}</Text>
              <Text style={styles.smallLabel}>
                Total Donations
              </Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallIcon}>✅</Text>
              <Text style={styles.smallNumber}>{delivered}</Text>
              <Text style={styles.smallLabel}>
                Delivered / Completed
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.smallCard}>
              <Text style={styles.smallIcon}>🚚</Text>
              <Text style={styles.smallNumber}>{active}</Text>
              <Text style={styles.smallLabel}>
                Active Donations
              </Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallIcon}>📋</Text>
              <Text style={styles.smallNumber}>{other}</Text>
              <Text style={styles.smallLabel}>
                Other Statuses
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Donation Status Breakdown
          </Text>

          <View style={styles.statusCard}>
            {statusItems.map((item) => {
              const percentage =
                total > 0 ? (item.count / total) * 100 : 0;

              return (
                <View key={item.label} style={styles.statusRow}>
                  <View style={styles.statusHeading}>
                    <Text style={styles.statusLabel}>
                      {item.label}
                    </Text>
                    <Text style={styles.statusCount}>
                      {item.count}
                    </Text>
                  </View>

                  <View style={styles.track}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.messageCard}>
            <Text style={styles.messageEmoji}>💚</Text>
            <Text style={styles.messageText}>
              Every donation is a step toward reducing food waste.
              Keep sharing surplus food with your community.
            </Text>
          </View>

          <Text style={styles.footnote}>
            Meals saved and monthly trends are not shown because
            the current donation API does not provide enough data
            to calculate them reliably.
          </Text>
        </>
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
    lineHeight: 20,
  },
  impactCard: {
    marginTop: 25,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    alignItems: "center",
    padding: 28,
  },
  impactEmoji: {
    fontSize: 35,
  },
  bigNumber: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "800",
    marginTop: 10,
  },
  impactLabel: {
    color: "#DCFCE7",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  smallCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smallIcon: {
    fontSize: 22,
  },
  smallNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 8,
  },
  smallLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 30,
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 20,
  },
  statusRow: {
    gap: 9,
  },
  statusHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  statusLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  statusCount: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  track: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 10,
  },
  messageCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },
  messageEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    color: "#166534",
    lineHeight: 19,
    fontSize: 13,
  },
  footnote: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  message: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 10,
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
});