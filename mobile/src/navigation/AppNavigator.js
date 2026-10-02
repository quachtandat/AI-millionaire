import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '../redux/slices/authSlice';
import GameScreen from '../screens/game/GameScreen';
import ResultScreen from '../screens/game/ResultScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainNavigator from './MainNavigator';
import GameDetailScreen from '../screens/history/GameDetailScreen';
import AdminManagementScreen from '../screens/admin/AdminManagementScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const dispatch = useDispatch();
  const { initialized, user } = useSelector((state) => state.auth);

  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);

  if (!initialized) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#176B5B" /></View>;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'admin' ? (
          <Stack.Screen name="AdminManagement" component={AdminManagementScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="GameDetail" component={GameDetailScreen} />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return <NavigationContainer><RootNavigator /></NavigationContainer>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7F4' },
});
