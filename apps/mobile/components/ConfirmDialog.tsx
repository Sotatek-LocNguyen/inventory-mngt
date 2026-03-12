import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useLanguage } from '../lib/i18n';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, message, onConfirm, onCancel }: Props) {
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/40 items-center justify-center" onPress={onCancel}>
        <View className="bg-white rounded-2xl mx-6 p-5 w-[85%]" onStartShouldSetResponder={() => true}>
          <Text className="text-lg font-semibold text-gray-900 mb-2">{title}</Text>
          <Text className="text-sm text-gray-600 mb-5">{message}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-gray-100 items-center"
              onPress={onCancel}
            >
              <Text className="text-sm font-medium text-gray-700">{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-2.5 rounded-lg bg-red-500 items-center"
              onPress={onConfirm}
            >
              <Text className="text-sm font-medium text-white">{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
