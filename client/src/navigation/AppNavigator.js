import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

import useAuthStore from "../stores/authStore";
import { colors } from "../utils/theme";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Main Screens
import HomeScreen from "../screens/main/HomeScreen";
import ClubsScreen from "../screens/clubs/ClubsScreen";
import ClubDetailsScreen from "../screens/clubs/ClubDetailsScreen";
import CreateClubScreen from "../screens/clubs/CreateClubScreen";
import AdminScreen from "../screens/admin/AdminScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import MyClubsScreen from "../screens/MyClubsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Screen Component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Club Stack Navigator
const ClubStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}
  >
    <Stack.Screen
      name="ClubsList"
      component={ClubsScreen}
      options={{ title: "Clubs" }}
    />
    <Stack.Screen
      name="ClubDetails"
      component={ClubDetailsScreen}
      options={{ title: "Club Details" }}
    />
    <Stack.Screen
      name="CreateClub"
      component={CreateClubScreen}
      options={{ title: "Create Club" }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Clubs") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Admin") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Clubs"
        component={ClubStack}
        options={{ tabBarLabel: "Clubs" }}
      />
      {user?.role === "admin" && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ tabBarLabel: "Admin" }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
      {/* This screen is part of the navigator but hidden from the tab bar */}
      <Tab.Screen
        name="MyClubs"
        component={MyClubsScreen}
        options={{
          tabBarButton: () => null, // Hides the tab from the bar
        }}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen
      name="MyClubs"
      component={MyClubsScreen}
      options={{
        headerShown: true,
        title: "My Clubs",
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
      }}
    />
    <Stack.Screen
      name="ClubDetails"
      component={ClubDetailsScreen}
      options={{
        headerShown: true,
        title: "Club Details",
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
      }}
    />
    <Stack.Screen
      name="CreateClub"
      component={CreateClubScreen}
      options={{
        headerShown: true,
        title: "Create Club",
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
      }}
    />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;
