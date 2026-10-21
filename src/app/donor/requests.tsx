
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import Header from "../../components/Header";
import { authenticatedFetch } from "../../services/api";

type DonationRequest = {
  id: number;
  donation_id: number;
  food_name: string;
  quantity: string;
  category: string;
  pickup_location: string;
  ngo_id: number;
  ngo_name: string;
  status: string;
};

export default function DonorRequestsScreen() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const data = await authenticatedFetch("/requests/donor");
      setRequests(data);
    } catch (error: any) {
      Alert.alert(
        "Unable to load requests",
        error?.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRequests();
    }, [loadRequests])
  );

  async function updateRequest(
    requestId: number,
    action: "approve" | "reject"
  ) {
    setBusyId(requestId);

    try {
      await authenticatedFetch(`/requests/${requestId}/${action}`, {
        method: "PUT",
      });

      Alert.alert(
        action === "approve" ? "Request approved" : "Request rejected",
        action === "approve"
          ? "This donation is now eligible for volunteer pickup."
          : "The request has been rejected."
      );

      await loadRequests();
    } catch (error: any) {
      Alert.alert(
        "Unable to update request",
        error?.message || "Please refresh and try again."
      );
      await loadRequests();
    } finally {
      setBusyId(null);
    }
  }

  function statusColor(status: string) {
    switch (status.toLowerCase()) {
      case "approved":
        return "#166534";
      case "rejected":
        return "#B91C1C";
      case "completed":
        return "#1D4ED8";
      default:
        return "#92400E";
    }
  }

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NGO requests</Text>
        <Text style={styles.subtitle}>
          Review requests for the donations you have listed.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.muted}>
              NGO requests for your donations will appear here.
            </Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.card}>
              <Text style={styles.foodName}>
                {request.food_name || "Food item"}
              </Text>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {request.category || "Food donation"}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.detail}>
                Quantity: {request.quantity || "Not specified"}
              </Text>

              <Text style={styles.detail}>
                Requested by: {request.ngo_name || "NGO"}
              </Text>

              <Text style={styles.detail}>
                Pickup location: {request.pickup_location || "Not specified"}
              </Text>

              <Text style={styles.detail}>
                Request ID: #{request.id}
              </Text>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <Text
                  style={[
                    styles.status,
                    { color: statusColor(request.status) },
                  ]}
                >
                  {request.status.replace(/_/g, " ")}
                </Text>
              </View>

              {request.status === "pending" ? (
                <View style={styles.actions}>
                  <Pressable
                    style={[
                      styles.button,
                      styles.approveButton,
                      busyId !== null && styles.disabledButton,
                    ]}
                    disabled={busyId !== null}
                    onPress={() => updateRequest(request.id, "approve")}
                  >
                    {busyId === request.id ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Approve</Text>
                    )}
                  </Pressable>

                  <Pressable
                    style={[
                      styles.button,
                      styles.rejectButton,
                      busyId !== null && styles.disabledButton,
                    ]}
                    disabled={busyId !== null}
                    onPress={() => updateRequest(request.id, "reject")}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.muted}>
                  No further action available for this request.
                </Text>
              )}
            </View>
          ))
        )}

        <Pressable
          style={styles.refreshButton}
          onPress={loadRequests}
          disabled={busyId !== null}
        >
          <Text style={styles.refreshText}>Refresh requests</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F6",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#163B2B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 22,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8E4",
  },
  foodName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#163B2B",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F4EB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  categoryText: {
    color: "#23784D",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8E4",
    marginTop: 14,
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: "#334155",
    marginTop: 9,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  statusLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  status: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#23784D",
  },
  rejectButton: {
    backgroundColor: "#B91C1C",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8E4",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#163B2B",
  },
  muted: {
    color: "#64748B",
    marginTop: 7,
    lineHeight: 20,
  },
  refreshButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  refreshText: {
    color: "#23784D",
    fontWeight: "800",
  },
});
