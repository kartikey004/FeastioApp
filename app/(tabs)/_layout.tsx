import { Tabs } from "expo-router";
import { Image } from "react-native";

// Import your icons
import { COLORS } from "@/utils/stylesheet";
import { SafeAreaView } from "react-native-safe-area-context";
import assistantFilled from "../../assets/images/assistantIconFilled.png";
import assistantOutlined from "../../assets/images/assistantIconOutlined.png";
import dashboardFilled from "../../assets/images/dashboardFilledIcon.png";
import dashboardOutlined from "../../assets/images/dashboardOutlinedIcon.png";
import mealPlanFilled from "../../assets/images/mealPlanFilledIcon.png";
import mealPlanOutlined from "../../assets/images/mealPlanOutlinedIcon.png";
import personFilled from "../../assets/images/profileFilledIcon.png";
import personOutlined from "../../assets/images/profileOutlinedIcon.png";

// Enhanced Icon Component
const TabIcon = ({
  focused,
  source,
  size = 20,
}: {
  focused: boolean;
  source: any;
  size?: number;
}) => (
  <SafeAreaView
    style={{
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      height: 30,
      borderRadius: 16,
      backgroundColor: focused ? "trasnparent" : "transparent",
      transform: [{ scale: focused ? 1.1 : 1 }],
    }}
  >
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        tintColor: focused ? COLORS.primaryDark : "#666",
      }}
      resizeMode="contain"
    />
  </SafeAreaView>
);

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="homeScreen"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: "#666",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          // paddingTop: 8,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E5E5",
          // elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="homeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? dashboardFilled : dashboardOutlined}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="aiAssistantScreen"
        options={{
          title: "Sage AI",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? assistantFilled : assistantOutlined}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mealPlanScreen"
        options={{
          title: "Meal Plan",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? mealPlanFilled : mealPlanOutlined}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              source={focused ? personFilled : personOutlined}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
