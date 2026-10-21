import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function DonorLayout() {
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
        name="donate"
        options={{
          title: "Donate",
          tabBarIcon: () => <Text>🍱</Text>,
        }}
      />

      <Tabs.Screen
        name="donations"
        options={{
          title: "Donations",
          tabBarIcon: () => <Text>📦</Text>,
        }}
      />

      <Tabs.Screen
        name="requests"
        options={{ title: "Requests" }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Impact",
          tabBarIcon: () => <Text>📊</Text>,
        }}
      />
    </Tabs>
  );
}