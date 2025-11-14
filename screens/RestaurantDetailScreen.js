import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { doc, onSnapshot, collection, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import ReviewCard from '../components/ReviewCard';

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsubscribeRestaurant = onSnapshot(doc(db, 'restaurants', restaurantId), (snapshot) => {
      if (snapshot.exists()) {
        setRestaurant({ id: snapshot.id, ...snapshot.data() });
      }
    });

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
      setReviews(items);
    });

    return () => {
      unsubscribeRestaurant();
      unsubscribeReviews();
    };
  }, [restaurantId]);

  const handleAddReview = () => {
    navigation.navigate('AddReview', { restaurantId });
  };

  const handleEditReview = (review) => {
    navigation.navigate('AddReview', { restaurantId, review });
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert('삭제 확인', '리뷰를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'reviews', reviewId));
          } catch (error) {
            Alert.alert('오류', error.message);
          }
        },
      },
    ]);
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, item) => {
      const value = typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || 0);
      const numeric = Number.isNaN(value) ? 0 : value;
      return sum + numeric;
    }, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  const currentUserId = auth.currentUser?.uid;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>이미지 없음</Text>
        </View>
      )}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.category}>{restaurant.category}</Text>
        <Text style={styles.address}>{restaurant.address}</Text>
        <Text style={styles.rating}>평균 평점: {averageRating.toFixed(1)} ({reviews.length}개 리뷰)</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddReview}>
        <Text style={styles.addButtonText}>리뷰 작성</Text>
      </TouchableOpacity>
      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>리뷰</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>첫 리뷰를 작성해보세요!</Text>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canEdit={review.userId === currentUserId}
              onEdit={() => handleEditReview(review)}
              onDelete={() => handleDeleteReview(review.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {
    color: '#777',
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#ff7043',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  rating: {
    marginTop: 8,
    fontWeight: '600',
  },
  addButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ff7043',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
  },
});
