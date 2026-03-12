import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ message, onAction, actionLabel }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Ionicons name="file-tray-outline" size={48} color="#d1d5db" />
      <Text className="text-sm text-gray-400 mt-3 text-center">{message}</Text>
      {onAction && actionLabel ? (
        <TouchableOpacity
          className="mt-4 bg-primary px-5 py-2.5 rounded-lg"
          onPress={onAction}
        >
          <Text className="text-white text-sm font-medium">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
