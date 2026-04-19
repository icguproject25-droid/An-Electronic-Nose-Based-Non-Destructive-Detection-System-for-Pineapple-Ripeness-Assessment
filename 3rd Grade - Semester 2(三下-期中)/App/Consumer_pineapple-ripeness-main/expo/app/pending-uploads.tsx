import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, RefreshCw, Trash2, Upload, Clock, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUploadQueue, QueuedRecord } from '@/contexts/UploadQueueContext';

export default function PendingUploadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { queue, queueCount, isRetrying, retryItem, retryAll, removeFromQueue, clearQueue } = useUploadQueue();

  const handleBack = () => {
    router.back();
  };

  const handleRetryItem = async (id: string) => {
    console.log('[PendingUploads] Retrying item:', id);
    await retryItem(id);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      t('delete'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => removeFromQueue(id) },
      ]
    );
  };

  const handleRetryAll = async () => {
    console.log('[PendingUploads] Retry all');
    await retryAll();
  };

  const handleClearQueue = () => {
    Alert.alert(
      t('clearQueue'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('clearQueue'), style: 'destructive', onPress: () => clearQueue() },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderItem = ({ item }: { item: QueuedRecord }) => (
    <View style={styles.queueItem}>
      <View style={styles.queueItemHeader}>
        <View style={styles.queueItemInfo}>
          <Clock size={16} color={Colors.textLight} />
          <Text style={styles.queueItemTime}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.retryCount > 0 && (
          <View style={styles.retryBadge}>
            <AlertCircle size={12} color={Colors.ripeOrange} />
            <Text style={styles.retryBadgeText}>{item.retryCount}x</Text>
          </View>
        )}
      </View>
      
      <View style={styles.queueItemDetails}>
        {item.payload.fruit_id && (
          <Text style={styles.queueItemDetail}>ID: {item.payload.fruit_id}</Text>
        )}
        <Text style={styles.queueItemDetail}>
          {item.payload.ripeness_pred} • {item.payload.Temp_C}°C
        </Text>
      </View>

      <View style={styles.queueItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRetryItem(item.id)}
          disabled={isRetrying}
        >
          <RefreshCw size={18} color={Colors.leafGreen} />
          <Text style={styles.actionButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Trash2 size={18} color="#E53935" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.warmWhite, Colors.cream]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} testID="btn-back">
          <ChevronLeft size={28} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('pendingUploads')}</Text>
        <View style={styles.headerRight} />
      </View>

      {queueCount > 0 ? (
        <>
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[styles.bulkButton, isRetrying && styles.bulkButtonDisabled]}
              onPress={handleRetryAll}
              disabled={isRetrying}
            >
              <RefreshCw size={18} color={Colors.white} />
              <Text style={styles.bulkButtonText}>
                {isRetrying ? t('uploading') : t('retryAll')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearQueue}
            >
              <Trash2 size={18} color={Colors.textLight} />
              <Text style={styles.clearButtonText}>{t('clearQueue')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={queue}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Upload size={64} color={Colors.textLight} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyText}>{t('noQueuedItems')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textDark,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  bulkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.leafGreen,
    borderRadius: 12,
  },
  bulkButtonDisabled: {
    opacity: 0.6,
  },
  bulkButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  queueItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  queueItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  queueItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueItemTime: {
    fontSize: 13,
    color: Colors.textLight,
  },
  retryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  retryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.ripeOrange,
  },
  queueItemDetails: {
    marginBottom: 12,
  },
  queueItemDetail: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 2,
  },
  queueItemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F0F8F0',
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.leafGreen,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#E53935',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
});
