
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import  Header from "../../components/Header";
import StatusBadge  from "../../components/StatusBadge";
import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

type DonationRequest = {
  id: number;
  donation_id: number;
  ngo_id: number;
  status: string;
};

type Donation = {
  id: number;
  food_name: string;
  quantity: string;
  category: string;
  description?: string | null;
  expiry_time: string;
  pickup_location: string;
  status: string;
  donor_id: number;
};

type RequestWithDonation = DonationRequest & {
  donation?: Donation | null;
};

export default function NGORequestsScreen() {
  const [requests, setRequests] = useState<RequestWithDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data: DonationRequest[] = await authenticatedFetch(
        "/requests/my"
      );

      const requestsWithDonations = await Promise.all(
        data.map(async (request) => {
          try {
            const donation: Donation = await authenticatedFetch(
              `/donations/${request.donation_id}`
            );

            return { ...request, donation };
          } catch {
            // Keep the request visible if its donation details cannot load.
            return { ...request, donation: null };
          }
        })
      );

      setRequests(requestsWithDonations);
    } catch (err: any) {
      setError(err.message || "Could not load your requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const pendingCount = requests.filter(
    (request) => request.status.toLowerCase() === "pending"
  ).length;

  const completedCount = requests.filter((request) =>
    ["completed", "delivered"].includes(request.status.toLowerCase())
  ).length;

  return (
    <View style={styles.container}>
      <Header title="My Requests" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Track the food donations your organisation has requested.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.helperText}>Loading your requests...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadRequests}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.helperText}>
              Visit Find Food to browse available donations and request food
              for your organisation.
            </Text>
          </View>
        ) : (
          requests.map((request) => {
            const donation = request.donation;

            return (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.foodName}>
                      {donation?.food_name || `Donation #${request.donation_id}`}
                    </Text>
                    <Text style={styles.requestId}>
                      Request #{request.id}
                    </Text>
                  </View>

                  <StatusBadge status={request.status} />
                </View>

                {donation ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quantity</Text>
                      <Text style={styles.detailValue}>
                        {donation.quantity}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>
                        {donation.category}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pickup location</Text>
                      <Text style={styles.detailValue}>
                        {donation.pickup_location}
                      </Text>
                    </View>

                    {donation.expiry_time ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expiry</Text>
                        <Text style={styles.detailValue}>
                          {new Date(donation.expiry_time).toLocaleString()}
                        </Text>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.helperText}>
                    Donation details are currently unavailable.
                  </Text>
                )}

                <Text style={styles.footerText}>
                  Donation ID: {request.donation_id}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "700",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  requestId: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
    flex: 1.3,
    textAlign: "right",
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 12,
  },
  center: {
    alignItems: "center",
    paddingVertical: 48,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
