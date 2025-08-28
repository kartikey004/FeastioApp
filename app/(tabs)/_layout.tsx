import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import { Image, useColorScheme } from "react-native";

// Import your icons
import assistantFilled from "../../assets/images/assistantIconFilled.png";
import assistantOutlined from "../../assets/images/assistantIconOutlined.png";
import dashboardFilled from "../../assets/images/dashboardFilledIcon.png";
import dashboardOutlined from "../../assets/images/dashboardOutlinedIcon.png";
import mealPlanFilled from "../../assets/images/mealPlanFilledIcon.png";
import mealPlanOutlined from "../../assets/images/mealPlanOutlinedIcon.png";
import personFilled from "../../assets/images/profileFilledIcon.png";
import personOutlined from "../../assets/images/profileOutlinedIcon.png";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="homeScreen"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="homeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? dashboardFilled : dashboardOutlined}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="aiAssistantScreen"
        options={{
          title: "Sage AI",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? assistantFilled : assistantOutlined}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mealPlanScreen"
        options={{
          title: "Meal Plan",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? mealPlanFilled : mealPlanOutlined}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? personFilled : personOutlined}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
