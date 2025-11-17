import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import RestaurantMarker from '../components/RestaurantMarker';
import RestaurantCard from '../components/RestaurantCard';

const DEFAULT_REGION = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('AddRestaurant')}>
            <Text style={styles.headerButtonText}>등록</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSignOut}>
            <Text style={styles.headerButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const q = query(collection(db, 'restaurants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
      setRestaurants(items);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const initialRegion = useMemo(() => {
    if (restaurants.length > 0) {
      const first = restaurants[0];
      return {
        latitude: first.lat || DEFAULT_REGION.latitude,
        longitude: first.lng || DEFAULT_REGION.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return DEFAULT_REGION;
  }, [restaurants]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {restaurants.map((restaurant) => (
          <RestaurantMarker
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
          />
        ))}
      </MapView>
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {restaurants.length === 0 ? (
          <Text style={styles.emptyText}>등록된 맛집이 없습니다. 첫 리뷰를 남겨보세요!</Text>
        ) : (
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  listContainer: {
    maxHeight: 240,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ff7043',
    borderRadius: 16,
    marginLeft: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
