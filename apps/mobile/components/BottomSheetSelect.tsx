import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: Option[];
}

export function BottomSheetSelect({ value, onValueChange, placeholder, options }: Props) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-3"
        onPress={() => setVisible(true)}
      >
        <Text className={selected ? 'text-gray-900 text-base' : 'text-gray-400 text-base'}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9ca3af" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40" onPress={() => setVisible(false)} />
        <View className="bg-white rounded-t-2xl pb-8 max-h-[60%]">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">{placeholder}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-50"
                onPress={() => {
                  onValueChange(item.value);
                  setVisible(false);
                }}
              >
                <Text className="text-base text-gray-800">{item.label}</Text>
                {item.value === value && (
                  <Ionicons name="checkmark" size={20} color="#1677ff" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}
