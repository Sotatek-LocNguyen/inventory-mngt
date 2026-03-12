import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  secureTextEntry,
}: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <TextInput
        className={`border rounded-lg px-3 py-3 text-base text-gray-900 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
      />
      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
