import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import { COLORS } from "../constants/colors";
import StatusBadge from "./StatusBadge";

type Donation = {
  id: number;
  food: string;
  quantity: string;
  category?: string;
  expiry?: string;
  location?: string;
  distance?: string;
  status: string;
  donor?: string;
  image?: string;
};

type Props = {
  donation: Donation;
  onPress?: () => void;
};

export default function DonationCard({
  donation,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.top}>
        <View style={styles.foodIcon}>
          <Text style={styles.foodEmoji}>
            {donation.image || "🍱"}
          </Text>
        </View>

        <View style={styles.main}>
          <Text style={styles.foodName}>
            {donation.food}
          </Text>

          <Text style={styles.quantity}>
            {donation.quantity}
          </Text>

          {donation.donor && (
            <Text style={styles.donor}>
              Donor: {donation.donor}
            </Text>
          )}
        </View>

        <StatusBadge status={donation.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        {donation.location && (
          <Text style={styles.detail}>
            📍 {donation.location}
          </Text>
        )}

        {donation.distance && (
          <Text style={styles.detail}>
            🚶 {donation.distance}
          </Text>
        )}

        {donation.expiry && (
          <Text style={styles.detail}>
            ⏱ {donation.expiry}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pressed: {
    opacity: 0.8,
  },

  top: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  foodIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  foodEmoji: {
    fontSize: 26,
  },

  main: {
    flex: 1,
  },

  foodName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  quantity: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: "600",
    marginTop: 3,
  },

  donor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 13,
  },

  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  detail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});