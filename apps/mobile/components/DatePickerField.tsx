import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLanguage } from '../lib/i18n';

interface Props {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export function DatePickerField({ label, value, onChange, placeholder }: Props) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'set' && date) onChange(date);
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <TouchableOpacity
        className="border border-gray-300 rounded-lg px-3 py-3"
        onPress={() => setShow(true)}
      >
        <Text className={value ? 'text-gray-900 text-base' : 'text-gray-400 text-base'}>
          {value ? value.toLocaleDateString() : (placeholder ?? label)}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="slide">
          <Pressable className="flex-1 bg-black/40" onPress={() => setShow(false)} />
          <View className="bg-white rounded-t-2xl pb-8 px-4 pt-4">
            <View className="flex-row justify-end mb-2">
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text className="text-primary text-base font-semibold">{t('done')}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={value ?? new Date()}
              mode="date"
              display="spinner"
              onChange={handleChange}
            />
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={value ?? new Date()}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}
