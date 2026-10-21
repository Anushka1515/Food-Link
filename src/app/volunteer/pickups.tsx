
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import Header from "../../components/Header";
import StatusBadge from "../../components/StatusBadge";
import { authenticatedFetch } from "../../services/api";

type Opportunity = {
  request_id: number;
  donation_id: number;
  food_name: string;
  quantity: string;
  category: string;
  description?: string | null;
  expiry_time: string;
  pickup_location: string;
  ngo_name: string;
};

type Pickup = {
  id: number;
  donation_id: number;
  request_id: number;
  volunteer_id: number;
  pickup_address: string;
  drop_address: string;
  status: string;
  delivered_quantity?: number | null;
  quantity_unit?: string | null;
};

const units = ["kg", "g", "meals", "portions", "boxes"];

export default function VolunteerPickupsScreen() {
  const [available, setAvailable] = useState<Opportunity[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("meals");
  const [savingCompletion, setSavingCompletion] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [availableData, pickupData] = await Promise.all([
        authenticatedFetch("/pickups/available"),
        authenticatedFetch("/pickups/my"),
      ]);

      setAvailable(availableData);
      setPickups(pickupData);
    } catch (error: any) {
      Alert.alert(
        "Unable to load pickups",
        error?.message || "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  async function acceptPickup(item: Opportunity) {
    setBusyId(item.request_id);

    try {
      await authenticatedFetch("/pickups/", {
        method: "POST",
        body: JSON.stringify({
          donation_id: item.donation_id,
          request_id: item.request_id,
          pickup_address: item.pickup_location,
          drop_address: `NGO: ${item.ngo_name}`,
        }),
      });

      Alert.alert("Pickup accepted", "This pickup is now assigned to you.");
      await loadData();
    } catch (error: any) {
      Alert.alert(
        "Could not accept pickup",
        error?.message || "Another volunteer may have accepted it already."
      );
      await loadData();
    } finally {
      setBusyId(null);
    }
  }

  async function startPickup(pickup: Pickup) {
    setBusyId(pickup.id);

    try {
      await authenticatedFetch(`/pickups/${pickup.id}/start`, {
        method: "PUT",
      });
      await loadData();
    } catch (error: any) {
      Alert.alert("Unable to start", error?.message || "Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function completePickup() {
    if (!selectedPickup) return;

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Enter a valid quantity", "Quantity must be greater than zero.");
      return;
    }

    setSavingCompletion(true);

    try {
      await authenticatedFetch(
        `/pickups/${selectedPickup.id}/complete`,
        {
          method: "PUT",
          body: JSON.stringify({
            delivered_quantity: amount,
            quantity_unit: unit,
          }),
        }
      );

      setSelectedPickup(null);
      setQuantity("");
      Alert.alert("Delivery completed", "The delivered quantity was saved.");
      await loadData();
    } catch (error: any) {
      Alert.alert(
        "Unable to complete delivery",
        error?.message || "Please try again."
      );
    } finally {
      setSavingCompletion(false);
    }
  }

  function statusLabel(status: string) {
    if (status === "in_transit") return "In transit";
    if (status === "completed") return "Completed";
    return "Assigned";
  }

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Volunteer pickups</Text>
        <Text style={styles.subtitle}>
          Accept approved requests and help food reach the people who need it.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Available pickups ({available.length})
            </Text>

            {available.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No available pickups</Text>
                <Text style={styles.muted}>
                  Approved requests will appear here when they're ready for collection.
                </Text>
              </View>
            ) : (
              available.map((item) => (
                <View key={item.request_id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.foodName}>{item.food_name}</Text>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                  </View>

                  <Text style={styles.muted}>{item.category}</Text>
                  {!!item.description && (
                    <Text style={styles.body}>{item.description}</Text>
                  )}

                  <Text style={styles.detail}>
                    Pickup: {item.pickup_location}
                  </Text>
                  <Text style={styles.detail}>Recipient: {item.ngo_name}</Text>
                  <Text style={styles.detail}>
                    Request #{item.request_id} · Donation #{item.donation_id}
                  </Text>

                  <Pressable
                    style={[
                      styles.primaryButton,
                      busyId === item.request_id && styles.disabledButton,
                    ]}
                    disabled={busyId !== null}
                    onPress={() => acceptPickup(item)}
                  >
                    {busyId === item.request_id ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Accept pickup</Text>
                    )}
                  </Pressable>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, styles.secondSection]}>
              My pickups ({pickups.length})
            </Text>

            {pickups.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No assigned pickups yet</Text>
                <Text style={styles.muted}>
                  Accept an available pickup above to see it here.
                </Text>
              </View>
            ) : (
              pickups.map((pickup) => (
                <View key={pickup.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.foodName}>
                      Pickup #{pickup.id}
                    </Text>
                    <StatusBadge status={statusLabel(pickup.status)} />
                  </View>

                  <Text style={styles.detail}>
                    Donation #{pickup.donation_id}
                  </Text>
                  <Text style={styles.detail}>
                    Collection: {pickup.pickup_address}
                  </Text>
                  <Text style={styles.detail}>
                    Delivery: {pickup.drop_address}
                  </Text>

                  {pickup.status === "assigned" && (
                    <Pressable
                      style={styles.primaryButton}
                      disabled={busyId !== null}
                      onPress={() => startPickup(pickup)}
                    >
                      {busyId === pickup.id ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          Start delivery
                        </Text>
                      )}
                    </Pressable>
                  )}

                  {pickup.status === "in_transit" && (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => {
                        setSelectedPickup(pickup);
                        setQuantity("");
                        setUnit("meals");
                      }}
                    >
                      <Text style={styles.primaryButtonText}>
                        Mark delivered
                      </Text>
                    </Pressable>
                  )}

                  {pickup.status === "completed" &&
                    pickup.delivered_quantity != null && (
                      <Text style={styles.detail}>
                        Delivered: {pickup.delivered_quantity}{" "}
                        {pickup.quantity_unit || ""}
                      </Text>
                    )}
                </View>
              ))
            )}

            <Pressable style={styles.refreshButton} onPress={loadData}>
              <Text style={styles.refreshText}>Refresh pickups</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal
        visible={selectedPickup !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPickup(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Confirm delivery</Text>
            <Text style={styles.muted}>
              Enter the quantity actually delivered.
            </Text>

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Delivered quantity"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.unitLabel}>Unit</Text>
            <View style={styles.units}>
              {units.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setUnit(item)}
                  style={[
                    styles.unitOption,
                    unit === item && styles.selectedUnit,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitText,
                      unit === item && styles.selectedUnitText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={completePickup}
              disabled={savingCompletion}
            >
              {savingCompletion ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Confirm delivery
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setSelectedPickup(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F8F6" },
  content: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "800", color: "#163B2B" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 6, marginBottom: 22 },
  loader: { marginTop: 40 },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#163B2B" },
  secondSection: { marginTop: 28 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8E4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  foodName: { fontSize: 17, fontWeight: "800", color: "#163B2B", flexShrink: 1 },
  quantity: { fontSize: 14, fontWeight: "700", color: "#28784F" },
  muted: { color: "#64748B", fontSize: 13, marginTop: 5, lineHeight: 19 },
  body: { color: "#334155", marginTop: 8, lineHeight: 20 },
  detail: { color: "#334155", fontSize: 13, marginTop: 8, lineHeight: 19 },
  primaryButton: {
    backgroundColor: "#23784D",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8E4",
  },
  emptyTitle: { fontWeight: "800", color: "#163B2B", fontSize: 16 },
  refreshButton: { padding: 14, alignItems: "center", marginTop: 10 },
  refreshText: { color: "#23784D", fontWeight: "800" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    color: "#0F172A",
  },
  unitLabel: { fontWeight: "700", color: "#334155", marginTop: 14 },
  units: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  unitOption: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedUnit: { backgroundColor: "#23784D", borderColor: "#23784D" },
  unitText: { color: "#334155", fontWeight: "600" },
  selectedUnitText: { color: "#FFFFFF" },
  cancelButton: { padding: 12, alignItems: "center", marginTop: 4 },
  cancelText: { color: "#64748B", fontWeight: "700" },
});
