import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import RankingScreen from '../screens/ranking/RankingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#176B5B',
      tabBarInactiveTintColor: '#84918A',
      tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
      tabBarStyle: { height: 64, paddingTop: 8, borderTopColor: '#E7ECE8', backgroundColor: '#FFFFFF' },
      tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19, fontWeight: '700' }}>{'●'}</Text>,
    }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Trang chủ', tabBarLabel: 'Trang chủ', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⌂</Text> }} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ title: 'Lịch sử', tabBarLabel: 'Lịch sử', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>◷</Text> }} />
      <Tab.Screen name="RankingTab" component={RankingScreen} options={{ title: 'Xếp hạng', tabBarLabel: 'Xếp hạng', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>♛</Text> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Hồ sơ', tabBarLabel: 'Hồ sơ', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>♙</Text> }} />
    </Tab.Navigator>
  );
}
