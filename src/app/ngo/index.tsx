
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import Header from "../../components/Header";
import  StatCard  from "../../components/StatCard";
import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

type Donation = {
  id: number;
  status: string;
};

type DonationRequest = {
  id: number;
  donation_id: number;
  ngo_id: number;
  status: string;
};

export default function NGODashboard() {
  const [availableCount, setAvailableCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [donations, requests]: [Donation[], DonationRequest[]] =
        await Promise.all([
          authenticatedFetch("/donations/available"),
          authenticatedFetch("/requests/my"),
        ]);

      setAvailableCount(donations.length);

      setRequestCount(
        requests.filter(
          (request) =>
            !["completed", "delivered", "cancelled"].includes(
              request.status.toLowerCase()
            )
        ).length
      );
    } catch (err: any) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  return (
    <View style={styles.container}>
      <Header title="NGO Dashboard" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.subtitle}>
          Here is your organisation's food rescue activity.
        </Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.helperText}>Loading dashboard...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <StatCard
                  title="Available Donations"
                  value={String(availableCount)}
                  icon="🍱"
                />
              </View>

              <View style={styles.statItem}>
                <StatCard
                  title="Active Requests"
                  value={String(requestCount)}
                  icon="📋"
                />
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Your impact matters 💚</Text>
              <Text style={styles.infoText}>
                Browse available food, request donations, and help make sure
                surplus food reaches people who need it.
              </Text>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>How it works</Text>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>1</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Find available food</Text>
            <Text style={styles.stepText}>
              Browse donations listed by food donors.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>2</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Request a donation</Text>
            <Text style={styles.stepText}>
              Submit a request for food your organisation can use.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>3</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Coordinate collection</Text>
            <Text style={styles.stepText}>
              Follow up on the request and arrange pickup when the workflow
              supports it.
            </Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Dashboard counts refresh when you open this screen.
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
  welcome: {
    fontSize: 25,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
  },
  loading: {
    alignItems: "center",
    paddingVertical: 36,
  },
  helperText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 13,
  },
  errorCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNumber: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  footerNote: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
});
