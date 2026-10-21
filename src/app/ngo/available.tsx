
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import Header from "../../components/Header";
import StatusBadge from "../../components/StatusBadge";
import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

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

function formatExpiry(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Expiry unavailable";
  }

  const hoursLeft = Math.ceil(
    (date.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  if (hoursLeft <= 0) return "Expired";
  if (hoursLeft < 24) return `Expires in ${hoursLeft}h`;

  return `Expires in ${Math.ceil(hoursLeft / 24)} days`;
}

export default function AvailableFood() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingId, setRequestingId] = useState<number | null>(null);

  const loadDonations = useCallback(async () => {
    try {
      setError("");
      const data = await authenticatedFetch("/donations/available");
      setDonations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load donations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDonations();
    }, [loadDonations])
  );

  const requestFood = async (donationId: number) => {
    try {
      setRequestingId(donationId);

      await authenticatedFetch("/requests/", {
        method: "POST",
        body: JSON.stringify({ donation_id: donationId }),
      });

      // The backend changes this donation's status to "claimed".
      setDonations((current) =>
        current.filter((item) => item.id !== donationId)
      );

      Alert.alert(
        "Request sent!",
        "Your food donation request was submitted successfully."
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send request.";

      Alert.alert("Request failed", message);

      // Refresh in case another NGO claimed the donation.
      loadDonations();
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Header
        title="Find Food"
        subtitle="Available donations near you"
      />

      <View style={styles.filterRow}>
        <Text style={styles.resultText}>
          {loading ? "Loading donations..." : `${donations.length} donations available`}
        </Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#16A34A"
          style={styles.loader}
        />
      )}

      {!loading && error !== "" && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn't load donations</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.button} onPress={loadDonations}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {!loading &&
        error === "" &&
        donations.map((item) => {
          const isRequesting = requestingId === item.id;

          return (
            <View style={styles.card} key={item.id}>
              <View style={styles.topRow}>
                <Text style={styles.foodEmoji}>🍱</Text>

                <View style={styles.titleArea}>
                  <Text style={styles.foodName}>{item.food_name}</Text>
                  <Text style={styles.donor}>
                    Category: {item.category}
                  </Text>
                </View>

                <StatusBadge status={item.status} />
              </View>

              {!!item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.info}>🍽️ {item.quantity}</Text>
                <Text style={styles.info}>
                  ⏱️ {formatExpiry(item.expiry_time)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.location}>
                  📍 {item.pickup_location}
                </Text>
              </View>

              <Text style={styles.donorId}>
                Donation ID: {item.id}
              </Text>

              <Pressable
                style={[
                  styles.button,
                  isRequesting && styles.disabledButton,
                ]}
                onPress={() => requestFood(item.id)}
                disabled={requestingId !== null}
              >
                {isRequesting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Request Donation</Text>
                )}
              </Pressable>
            </View>
          );
        })}

      {!loading && error === "" && donations.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>No food available</Text>
          <Text style={styles.emptyText}>
            Check again later for new donations.
          </Text>
          <Pressable style={styles.button} onPress={loadDonations}>
            <Text style={styles.buttonText}>Refresh</Text>
          </Pressable>
        </View>
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
    paddingTop: 55,
    paddingBottom: 30,
  },
  filterRow: {
    marginBottom: 15,
  },
  resultText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  donor: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  info: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  location: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  donorId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#16A34A",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 17,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 10,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 15,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
});
