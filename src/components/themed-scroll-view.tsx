import { ScrollView, type ScrollViewProps } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedScrollViewProps = ScrollViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedScrollView({ style, lightColor, darkColor, ...otherProps }: ThemedScrollViewProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = theme === 'light' ? lightColor : darkColor;

  return <ScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
}
