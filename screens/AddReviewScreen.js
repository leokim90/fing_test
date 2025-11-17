import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import uploadImage from '../utils/uploadImage';

export default function AddReviewScreen({ route, navigation }) {
  const { restaurantId, review } = route.params || {};
  const [rating, setRating] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating ? String(review.rating) : '');
      setContent(review.content || '');
      setImages((review.images || []).map((uri) => ({ uri, uploaded: true })));
    }
  }, [review]);

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
      const asset = result.assets[0];
      setImages((prev) => [...prev, { uri: asset.uri, uploaded: false }]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating || !content) {
      Alert.alert('오류', '평점과 내용을 입력해주세요.');
      return;
    }

    const numericRating = parseFloat(rating);
    if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      Alert.alert('오류', '평점은 0부터 5 사이의 숫자로 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        images.map(async (image, index) => {
          if (image.uploaded) {
            return image.uri;
          }
          return uploadImage(image.uri, `reviews/${restaurantId}/${Date.now()}_${index}`);
        })
      );

      const payload = {
        restaurantId,
        userId: auth.currentUser?.uid || null,
        userName: auth.currentUser?.displayName || '익명',
        rating: numericRating,
        content,
        images: uploadedUrls,
        updatedAt: serverTimestamp(),
      };

      if (review) {
        await updateDoc(doc(db, 'reviews', review.id), payload);
      } else {
        await addDoc(collection(db, 'reviews'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert('완료', '리뷰가 저장되었습니다.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="평점 (0-5)"
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        keyboardType="decimal-pad"
      />
      <TextInput
        placeholder="리뷰 내용"
        style={[styles.input, styles.textarea]}
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>사진 추가</Text>
      </TouchableOpacity>
      <View style={styles.imageGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? '저장 중...' : '저장'}</Text>
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
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#333',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
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
