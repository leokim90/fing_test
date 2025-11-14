import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';

export default function RestaurantMarker({ restaurant, onPress }) {
  if (!restaurant.lat || !restaurant.lng) {
    return null;
  }

  return (
    <Marker coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }} onPress={onPress}>
      <Callout onPress={onPress}>
        <View style={styles.callout}>
          <Text style={styles.title}>{restaurant.name}</Text>
          <Text style={styles.subtitle}>{restaurant.category}</Text>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  callout: {
    width: 160,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#555',
  },
});
