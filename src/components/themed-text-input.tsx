import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({
  lightColor,
  darkColor,
  ...rest
}: ThemedTextInputProps) {
  const theme = useColorScheme() ?? 'light';
  const textColor = theme === 'light' ? lightColor : darkColor;
  const placeholderColor = theme === 'light' ? '#999' : '#666';
    
  return (
    <TextInput
      {...rest}
      style={[styles.input, { color: textColor }, rest.style]} 
      placeholderTextColor={placeholderColor}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    // Garantir que o TextInput tenha mínimo estilo para aplicar a cor
    // Se não quiser, pode remover e manter só o `color`
  },
});