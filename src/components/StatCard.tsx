import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  title: string;
  value: string;
  icon: string;
};

export default function StatCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 145,
    justifyContent: "flex-start",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  icon: {
    fontSize: 23,
  },

  value: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 3,
  },

  title: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});
