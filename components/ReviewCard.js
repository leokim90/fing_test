import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function ReviewCard({ review, canEdit, onEdit, onDelete }) {
  const ratingValue = useMemo(() => {
    if (typeof review.rating === 'number') return review.rating;
    const parsed = parseFloat(review.rating || 0);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [review.rating]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.user}>{review.userName || '익명'}</Text>
        <Text style={styles.rating}>★ {ratingValue.toFixed(1)}</Text>
      </View>
      <Text style={styles.content}>{review.content}</Text>
      <View style={styles.images}>
        {(review.images || []).map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.image} />
        ))}
      </View>
      {canEdit && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Text style={styles.actionText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Text style={styles.actionText}>삭제</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  user: {
    fontWeight: 'bold',
  },
  rating: {
    color: '#ff7043',
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 12,
    color: '#333',
  },
  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ff7043',
    marginLeft: 8,
  },
  actionText: {
    color: '#fff',
  },
});
