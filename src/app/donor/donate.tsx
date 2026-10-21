import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { COLORS } from "../../constants/colors";
import { authenticatedFetch } from "../../services/api";

const categories = [
  "Cooked Meals",
  "Fruits",
  "Vegetables",
  "Bakery",
  "Packaged Food",
];

export default function CreateDonation() {
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("Cooked Meals");
  const [quantity, setQuantity] = useState("");
  const [expiryHours, setExpiryHours] = useState("2");
  const [pickupLocation, setPickupLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (
      !foodName.trim() ||
      !quantity.trim() ||
      !pickupLocation.trim() ||
      !expiryHours.trim()
    ) {
      Alert.alert("Missing information", "Please fill in all required fields.");
      return;
    }

    const hours = Number(expiryHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      Alert.alert("Invalid expiry", "Enter an expiry duration greater than 0 hours.");
      return;
    }

    setSubmitting(true);

    try {
      const expiryTime = new Date(
        Date.now() + hours * 60 * 60 * 1000
      ).toISOString();

      await authenticatedFetch("/donations/", {
        method: "POST",
        body: JSON.stringify({
          food_name: foodName.trim(),
          category,
          quantity: quantity.trim(),
          expiry_time: expiryTime,
          pickup_location: pickupLocation.trim(),
          description: description.trim(),
        }),
      });

      Alert.alert("Success", "Your donation has been listed.", [
        {
          text: "View donations",
          onPress: () => router.replace("/donor/donations"),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Could not create donation",
        error instanceof Error
          ? error.message
          : "Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Donate Food</Text>
      <Text style={styles.subtitle}>
        Tell us about the food you want to donate.
      </Text>

      <Field
        label="Food Name *"
        placeholder="e.g. Vegetable Biryani"
        value={foodName}
        onChangeText={setFoodName}
      />

      <Text style={styles.label}>Category *</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.category,
                category === item && styles.selectedCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Field
        label="Quantity *"
        placeholder="e.g. 45 meals or 5 kg"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Field
        label="Expires in how many hours? *"
        placeholder="e.g. 2"
        value={expiryHours}
        onChangeText={setExpiryHours}
        keyboardType="decimal-pad"
      />

      <Text style={styles.helperText}>
        Enter a duration in hours from now, not a clock time.
      </Text>

      <Field
        label="Pickup Location *"
        placeholder="Enter pickup address"
        value={pickupLocation}
        onChangeText={setPickupLocation}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Add details about the food..."
        placeholderTextColor="#94A3B8"
        style={styles.textarea}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          submitting && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>List Donation</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        editable
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 22,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    color: COLORS.text,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 7,
  },
  categories: {
    flexDirection: "row",
    gap: 8,
  },
  category: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectedCategory: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  selectedCategoryText: {
    color: COLORS.primaryDark,
  },
  textarea: {
    minHeight: 110,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 15,
    textAlignVertical: "top",
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 25,
    minHeight: 54,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});