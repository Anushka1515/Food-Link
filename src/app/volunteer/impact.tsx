import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import { COLORS } from "../../constants/colors";

export default function VolunteerImpact() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Header
        title="Your Impact"
        subtitle="Every pickup makes a difference"
      />

      <View style={styles.hero}>
        <Text style={styles.emoji}>🚚</Text>

        <Text style={styles.number}>680</Text>

        <Text style={styles.label}>
          meals delivered to communities
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.stat}>47</Text>
          <Text style={styles.cardLabel}>Pickups Completed</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>🍽️</Text>
          <Text style={styles.stat}>680</Text>
          <Text style={styles.cardLabel}>Meals Delivered</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.stat}>124 km</Text>
          <Text style={styles.cardLabel}>Distance Covered</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>♻️</Text>
          <Text style={styles.stat}>215 kg</Text>
          <Text style={styles.cardLabel}>Food Rescued</Text>
        </View>
      </View>

      <View style={styles.message}>
        <Text style={styles.messageTitle}>
          You're making a real difference 💚
        </Text>

        <Text style={styles.messageText}>
          By volunteering your time, you're helping reduce food waste
          and making sure good food reaches people instead of landfills.
        </Text>
      </View>
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

  hero: {
    backgroundColor: "#DCFCE7",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
  },

  emoji: {
    fontSize: 35,
  },

  number: {
    fontSize: 48,
    fontWeight: "900",
    color: "#16A34A",
    marginTop: 5,
  },

  label: {
    color: "#166534",
    fontSize: 14,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },

  icon: {
    fontSize: 25,
  },

  stat: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 8,
  },

  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  message: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginTop: 20,
  },

  messageTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  messageText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
});