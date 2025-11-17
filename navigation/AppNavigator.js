import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import AddRestaurantScreen from '../screens/AddRestaurantScreen';
import AddReviewScreen from '../screens/AddReviewScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '밥이다' }} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: '맛집 정보' }} />
      <Stack.Screen name="AddRestaurant" component={AddRestaurantScreen} options={{ title: '맛집 등록' }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: '리뷰 작성' }} />
    </Stack.Navigator>
  );
}
