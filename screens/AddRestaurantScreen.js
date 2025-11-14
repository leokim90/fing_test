import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import uploadImage from '../utils/uploadImage';

const DEFAULT_REGION = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function AddRestaurantScreen({ navigation }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      setRegion((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [lat, lng]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '이미지를 선택하려면 사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !category || !lat || !lng) {
      Alert.alert('오류', '필수 정보를 입력해주세요.');
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Alert.alert('오류', '위도와 경도를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      let image = null;
      if (imageUri) {
        image = await uploadImage(imageUri, `restaurants/${Date.now()}`);
      }

      await addDoc(collection(db, 'restaurants'), {
        name,
        category,
        address,
        lat: latitude,
        lng: longitude,
        image,
        createdBy: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      Alert.alert('완료', '맛집이 등록되었습니다.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event) => {
    const { latitude: pressedLat, longitude: pressedLng } = event.nativeEvent.coordinate;
    setLat(pressedLat.toFixed(6));
    setLng(pressedLng.toFixed(6));
    setRegion((prev) => ({
      ...prev,
      latitude: pressedLat,
      longitude: pressedLng,
    }));
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '현재 위치를 사용하려면 위치 권한이 필요합니다.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude: currentLat, longitude: currentLng } = position.coords;
      setLat(currentLat.toFixed(6));
      setLng(currentLng.toFixed(6));
      setRegion((prev) => ({
        ...prev,
        latitude: currentLat,
        longitude: currentLng,
      }));
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="맛집 이름"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="카테고리"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        placeholder="주소"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />
      <View style={styles.mapSection}>
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
          >
            {!Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng)) && (
              <Marker coordinate={{ latitude: parseFloat(lat), longitude: parseFloat(lng) }} />
            )}
          </MapView>
        </View>
        <View style={styles.coordInputs}>
          <TextInput
            placeholder="위도"
            style={[styles.input, styles.coordInput, styles.coordInputLeft]}
            value={lat}
            onChangeText={setLat}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder="경도"
            style={[styles.input, styles.coordInput]}
            value={lng}
            onChangeText={setLng}
            keyboardType="decimal-pad"
          />
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation}>
          <Text style={styles.locationButtonText}>현재 위치 사용</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>사진 선택</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? '등록 중...' : '등록하기'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mapSection: {
    marginBottom: 16,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  coordInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  coordInput: {
    flex: 1,
  },
  coordInputLeft: {
    marginRight: 12,
  },
  locationButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePicker: {
    padding: 12,
    backgroundColor: '#ff7043',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    padding: 16,
    backgroundColor: '#ff7043',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
