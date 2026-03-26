import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

export type ThemedPressableProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'primary' | 'secondary' | 'error';
};

export function ThemedPressable({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedPressableProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = theme === 'light' ? lightColor : darkColor;

  return (
    <Pressable
      style={(state) => [
        { backgroundColor },
        type === 'default' ? styles.default : undefined,
        type === 'primary' ? styles.primary : undefined,
        type === 'secondary' ? styles.secondary : undefined,
        type === 'error' ? styles.error : undefined,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    padding: 10,
    borderRadius: 6,
  },
  primary: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#0a7ea4',
  },
  secondary: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  error: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#e57373',
  },
});
