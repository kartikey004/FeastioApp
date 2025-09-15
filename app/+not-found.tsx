import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/loginScreen");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Oops! This screen does not exist.</Text>
        <Text style={styles.subtitle}>Redirecting you to login...</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
  },
});
