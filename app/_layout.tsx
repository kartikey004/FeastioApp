import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Welcome", headerShown: false }}
        />
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
      </Stack>
    </Provider>
  );
}
