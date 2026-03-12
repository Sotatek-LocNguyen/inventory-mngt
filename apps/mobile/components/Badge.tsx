import { Text } from 'react-native';

const COLORS = {
  green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
} as const;

interface Props {
  label: string;
  color: keyof typeof COLORS;
}

export function Badge({ label, color }: Props) {
  const [bg, text] = COLORS[color].split(' ');
  return (
    <Text className={`${bg} ${text} text-xs font-medium px-2 py-0.5 rounded overflow-hidden`}>
      {label}
    </Text>
  );
}
