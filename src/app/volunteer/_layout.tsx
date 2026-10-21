import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function VolunteerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16A34A",
        tabBarInactiveTintColor: "#94A3B8",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />

      <Tabs.Screen
        name="pickups"
        options={{
          title: "Pickups",
          tabBarIcon: () => <Text>📦</Text>,
        }}
      />

      <Tabs.Screen
        name="impact"
        options={{
          title: "Impact",
          tabBarIcon: () => <Text>📊</Text>,
        }}
      />
    </Tabs>
  );
}