import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import { volunteerStats, pickupTasks } from "../../data/mockData";
import { COLORS } from "../../constants/colors";

export default function VolunteerDashboard() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Header
        title="Volunteer Dashboard"
        subtitle="Help move food where it is needed"
      />

      <View style={styles.welcomeCard}>
        <Text style={styles.title}>Ready for today's pickups? 🚚</Text>
        <Text style={styles.text}>
          You have {volunteerStats.todayPickups} pickup tasks scheduled today.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your Activity</Text>

      <View style={styles.grid}>
        <View style={styles.row}>
            <View style={styles.cardWrapper}>
            <StatCard
                title="Today's Pickups"
                value={volunteerStats.todayPickups}
                icon="📦"
            />
            </View>

            <View style={styles.cardWrapper}>
            <StatCard
                title="Completed"
                value={volunteerStats.completed}
                icon="✅"
            />
            </View>
        </View>

        <View style={styles.row}>
            <View style={styles.cardWrapper}>
            <StatCard
                title="Meals Delivered"
                value={volunteerStats.mealsDelivered}
                icon="🍽️"
            />
            </View>

            <View style={styles.cardWrapper}>
            <StatCard
                title="Distance"
                value={volunteerStats.distance}
                icon="📍"
            />
            </View>
        </View>
        </View>

      <Text style={styles.sectionTitle}>Next Pickup</Text>

      {pickupTasks.length > 0 && (
        <View style={styles.taskCard}>
          <Text style={styles.food}>{pickupTasks[0].food}</Text>

          <Text style={styles.quantity}>
            {pickupTasks[0].quantity}
          </Text>

          <View style={styles.location}>
            <Text style={styles.locationIcon}>📍</Text>
            <View>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationText}>
                {pickupTasks[0].pickup}
              </Text>
            </View>
          </View>

          <View style={styles.location}>
            <Text style={styles.locationIcon}>🏠</Text>
            <View>
              <Text style={styles.locationLabel}>Deliver to</Text>
              <Text style={styles.locationText}>
                {pickupTasks[0].drop}
              </Text>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Your Mission</Text>

      <View style={styles.mission}>
        <Text style={styles.missionEmoji}>💚</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.missionTitle}>
            Rescue food. Deliver hope.
          </Text>

          <Text style={styles.missionText}>
            Your pickups help connect surplus food with people and
            communities who need it.
          </Text>
        </View>
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

  welcomeCard: {
    backgroundColor: "#DCFCE7",
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },

  text: {
    color: "#166534",
    marginTop: 7,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 14,
    marginTop: 5,
  },
  grid: {
  marginBottom: 25,
},

row: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
},

cardWrapper: {
  width: "48%",
},


  taskCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
  },

  food: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  quantity: {
    color: COLORS.textSecondary,
    marginTop: 5,
    marginBottom: 15,
  },

  location: {
    flexDirection: "row",
    marginTop: 13,
  },

  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  locationLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  locationText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },

  mission: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
  },

  missionEmoji: {
    fontSize: 30,
    marginRight: 14,
  },

  missionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  missionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 5,
  },
});