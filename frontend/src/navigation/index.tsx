// src/navigation/index.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { loadStoredAuth } from '../store/slices/authSlice';
import { colors, radius, shadows } from '../theme';

// Ekranlar
import OnboardingScreen  from '../screens/auth/OnboardingScreen';
import LoginScreen       from '../screens/auth/LoginScreen';
import RegisterScreen    from '../screens/auth/RegisterScreen';
import HomeScreen        from '../screens/main/HomeScreen';
import AddEntryScreen    from '../screens/main/AddEntryScreen';
import AnalyticsScreen   from '../screens/main/AnalyticsScreen';
import ProfileScreen     from '../screens/main/ProfileScreen';

// AI Ekranları
import AIHubScreen         from '../screens/ai/AIHubScreen';
import CarbonDNAScreen     from '../screens/ai/CarbonDNAScreen';
import CarbonTwinScreen    from '../screens/ai/CarbonTwinScreen';
import TimeMachineScreen   from '../screens/ai/TimeMachineScreen';
import CarbonMemoryScreen  from '../screens/ai/CarbonMemoryScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── TAB İKONLARI ─────────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  Home:      { icon: '🏠', label: 'Ana Sayfa' },
  Analytics: { icon: '📊', label: 'Analiz'    },
  AddEntry:  { icon: '➕', label: 'Giriş'     },
  Leaderboard: { icon: '🏆', label: 'Sıralama' },
  Profile:   { icon: '👤', label: 'Profil'    },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { icon, label } = TAB_ICONS[name] ?? { icon: '•', label: name };
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

// ── ANA TAB NAVIGATOR ────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:    false,
        tabBarShowLabel:false,
        tabBarStyle:    styles.tabBar,
        tabBarIcon:     ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen} />
      <Tab.Screen name="Analytics"  component={AnalyticsScreen} />
      <Tab.Screen
        name="AddEntry"
        component={AddEntryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.fabBtn}>
              <Text style={styles.fabIcon}>➕</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── LEADERBOARD placeholder ───────────────────────────────────────────────────
function LeaderboardScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={{ fontSize: 32 }}>🏆</Text>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Liderboard</Text>
      <Text style={{ color: colors.textSecondary }}>Yakında...</Text>
    </View>
  );
}

// ── ROOT NAVIGATOR ────────────────────────────────────────────────────────────
export default function RootNavigator() {
  const dispatch  = useDispatch<AppDispatch>();
  const { user }  = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    dispatch(loadStoredAuth());
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Oturum açık → Ana uygulama + modal ekranlar
          <>
            <Stack.Screen name="MainApp"       component={MainTabs} />
            <Stack.Screen name="AddEntry"      component={AddEntryScreen}     options={{ presentation: 'modal', headerShown: true, title: 'Emisyon Ekle' }} />
            <Stack.Screen name="AIHub"         component={AIHubScreen}        options={{ headerShown: true, title: '🤖 AI Özellikleri' }} />
            <Stack.Screen name="CarbonDNA"     component={CarbonDNAScreen}    options={{ headerShown: true, title: '🧬 Karbon DNA' }} />
            <Stack.Screen name="CarbonTwin"    component={CarbonTwinScreen}   options={{ headerShown: true, title: '🤖 Karbon İkizi' }} />
            <Stack.Screen name="TimeMachine"   component={TimeMachineScreen}  options={{ headerShown: true, title: '⏰ Zaman Makinesi' }} />
            <Stack.Screen name="CarbonMemory"  component={CarbonMemoryScreen} options={{ headerShown: true, title: '💭 Karbon Hafıza' }} />
          </>
        ) : (
          // Oturum yok → Auth akışı
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Register"   component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  colors.surface,
    borderTopWidth:   1,
    borderTopColor:   colors.border,
    height:           80,
    paddingBottom:    16,
    paddingTop:       8,
    ...shadows.md,
  },
  tabIconWrap: {
    alignItems:     'center',
    gap:            2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius:   radius.md,
  },
  tabIconWrapActive: { backgroundColor: colors.g50 },
  tabIcon:           { fontSize: 20 },
  tabIconActive:     {},
  tabLabel:          { fontSize: 9, color: colors.textMuted, fontWeight: '500' },
  tabLabelActive:    { color: colors.g800, fontWeight: '700' },

  fabBtn: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: colors.g700,
    justifyContent:  'center',
    alignItems:      'center',
    marginTop:       -20,
    shadowColor:     colors.g800,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    8,
    elevation:       8,
  },
  fabIcon: { fontSize: 22, color: '#fff' },

  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: colors.background },
});
