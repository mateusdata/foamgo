import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';

type FilterButtonProps = {
    label: string;
    isActive: boolean;
    onPress: () => void;
};

export function FilterButton({ label, isActive, onPress }: FilterButtonProps) {
    const colorScheme = useColorScheme();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: isActive
                        ? Colors.primary
                        : (colorScheme === 'light' ? '#f0f0f0' : '#2C2C2E'),
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <ThemedText
                style={[
                    styles.buttonText,
                    {
                        color: isActive
                            ? '#FFF'
                            : (colorScheme === 'light' ? '#333' : '#FFF')
                    }
                ]}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 14,
    },
});
