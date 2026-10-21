import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case "available":
      case "delivered":
      case "completed":
        return {
          background: "#DCFCE7",
          text: "#15803D",
        };

      case "claimed":
      case "picked up":
      case "in transit":
        return {
          background: "#DBEAFE",
          text: "#1D4ED8",
        };

      case "assigned":
        return {
          background: "#FEF3C7",
          text: "#B45309",
        };

      default:
        return {
          background: "#F1F5F9",
          text: "#475569",
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});