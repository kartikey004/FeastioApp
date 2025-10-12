import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const mealNotificationMessages = {
  Breakfast: [
    "Rise and shine! Your Breakfast is ready 🍳",
    "Time to power up with Breakfast ☀️",
    "Good morning! Don’t skip your Breakfast 🥐",
    "Fuel your day! Breakfast awaits 🍓",
    "Start strong! Enjoy your Breakfast 🥞",
    "Breakfast time! Eat well, feel great 😋",
    "Wake up your taste buds! Breakfast is served 🍴",
    "Morning energy boost! Grab your Breakfast ⚡",
  ],
  Lunch: [
    "It’s Lunch time! Refuel your body 🥗",
    "Time to recharge! Enjoy your Lunch 🍛",
    "Don’t forget your Lunch! Stay strong 💪",
    "Midday fuel! Lunch is ready 🍴",
    "Lunch break! Eat well, stay energized 😋",
    "Keep your day going! Lunch awaits 🍲",
    "Healthy Lunch time! Bon appétit 🥙",
    "Time for a delicious Lunch 🍝",
  ],
  Snack: [
    "Snack time! Grab a quick bite 🍎",
    "Refuel with a Snack! Stay energized ⚡",
    "Snack break! Keep your energy up 🍌",
    "Take a little pause! Snack awaits 😋",
    "Keep going! Enjoy your Snack 🍪",
    "Midday munchies? Snack time 🍇",
    "Quick bite time! Snack up 🍫",
    "Snack attack! Fuel your body 🍍",
  ],
  Dinner: [
    "Dinner is served! Relax and enjoy 🍽️",
    "Time to unwind with Dinner 🌙",
    "End your day right! Dinner awaits 🍲",
    "Dinner time! Healthy and hearty 🍛",
    "Evening fuel! Enjoy your Dinner 😋",
    "Delicious Dinner! Treat yourself tonight 🥘",
    "Wrap up the day with Dinner 🍴",
    "Dinner break! Nourish your body 🍱",
  ],
};

function getRandomMealMessage(
  mealType: "Breakfast" | "Lunch" | "Snack" | "Dinner"
) {
  const messages = mealNotificationMessages[mealType];
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn("Notifications require a physical device");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permissions not granted!");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF4500",
      });
    }

    return true;
  }

  static async scheduleMealNotification(mealType: string, mealTime: string) {
    const [hourStr, minuteStr] = mealTime.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Meal Time! 🍽️",
        body: getRandomMealMessage(
          mealType as "Breakfast" | "Lunch" | "Snack" | "Dinner"
        ),
        sound: true,
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { mealType, mealTime },
      },
      trigger,
    });
  }

  static async scheduleAllMeals(
    mealPlan: { mealType: string; mealTime: string }[]
  ) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const meal of mealPlan) {
      await NotificationService.scheduleMealNotification(
        meal.mealType,
        meal.mealTime
      );
    }

    console.log("All meal notifications scheduled.");
  }

  static async updateMealNotification(meal: {
    mealType: string;
    mealTime: string;
  }) {
    await NotificationService.scheduleMealNotification(
      meal.mealType,
      meal.mealTime
    );
    console.log(`Notification updated for ${meal.mealType}`);
  }
}

export default NotificationService;
