
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

import Header from "../../components/Header";
import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

type DonationRequest = {
  id: number;
  donation_id: number;
  ngo_id: number;
  status: string;
};

export default function NGOImpactScreen() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadImpact = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data: DonationRequest[] =
        await authenticatedFetch("/requests/my");

      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Could not load impact data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadImpact();
    }, [loadImpact])
  );

  const completedCount = requests.filter((request) =>
    ["completed", "delivered"].includes(request.status.toLowerCase())
  ).length;

  const pendingCount = requests.filter(
    (request) => request.status.toLowerCase() === "pending"
  ).length;

  const activeCount = requests.filter(
    (request) =>
      !["completed", "delivered", "cancelled"].includes(
        request.status.toLowerCase()
      )
  ).length;

  return (
    <View style={styles.container}>
      <Header title="Your Impact" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>💚</Text>
          <Text style={styles.heroTitle}>Making a difference</Text>
          <Text style={styles.heroSubtitle}>
            Every food rescue request is a step towards reducing food waste
            and supporting communities.
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.helperText}>
              Loading your impact data...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadImpact}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Request statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📋</Text>
                <Text style={styles.statValue}>{requests.length}</Text>
                <Text style={styles.statLabel}>Total Requests</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⏳</Text>
                <Text style={styles.statValue}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending Requests</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🚚</Text>
                <Text style={styles.statValue}>{completedCount}</Text>
                <Text style={styles.statLabel}>Completed Requests</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🔄</Text>
                <Text style={styles.statValue}>{activeCount}</Text>
                <Text style={styles.statLabel}>Active Requests</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Environmental impact</Text>

            <View style={styles.impactCard}>
              <View style={styles.impactRow}>
                <Text style={styles.impactIcon}>🍱</Text>
                <View style={styles.impactTextContainer}>
                  <Text style={styles.impactTitle}>Meals received</Text>
                  <Text style={styles.impactDescription}>
                    Actual meal quantities are not currently tracked by the
                    backend.
                  </Text>
                </View>
                <Text style={styles.notTracked}>Not tracked</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.impactRow}>
                <Text style={styles.impactIcon}>♻️</Text>
                <View style={styles.impactTextContainer}>
                  <Text style={styles.impactTitle}>Food rescued</Text>
                  <Text style={styles.impactDescription}>
                    Rescued food weight is not currently recorded.
                  </Text>
                </View>
                <Text style={styles.notTracked}>Not tracked</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.impactRow}>
                <Text style={styles.impactIcon}>🌍</Text>
                <View style={styles.impactTextContainer}>
                  <Text style={styles.impactTitle}>Reducing food waste</Text>
                  <Text style={styles.impactDescription}>
                    Completed deliveries and recorded food quantities can
                    support this metric once tracking is added.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>How these numbers work</Text>
              <Text style={styles.noteText}>
                Request statistics come from your account's saved requests.
                Completed counts increase when the backend marks a request
                completed or delivered. Meal and weight totals need additional
                backend data.
              </Text>
            </View>
          </>
        )}

        <Text style={styles.footerNote}>
          Statistics refresh whenever you open this page.
        </Text>
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
  hero: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
  },
  heroIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 26,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "40%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    fontSize: 25,
    marginBottom: 12,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
  },
  impactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  impactIcon: {
    fontSize: 25,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  impactDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  notTracked: {
    color: COLORS.textSecondary,
    fontSize: 11,
    maxWidth: 65,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  noteCard: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  noteText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  center: {
    alignItems: "center",
    paddingVertical: 40,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  footerNote: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 18,
  },
});
