import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';

type AppButtonProps = {
    name: string;
    variant?: 'primary' | 'secondary' | 'link';
} & Partial<ButtonProps>;

export function PrimaryButton({ name, variant = 'primary', ...props }: AppButtonProps) {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isLink = variant === 'link';

    return (
        <Button
            mode="contained"
            buttonColor={isPrimary ? Colors.primary : isSecondary ? 'transparent' : 'transparent'}
            style={[
                styles.button,
                isSecondary && styles.secondaryButton,
                isLink && styles.linkButton,
                props.style,
            ]}
            labelStyle={[
                styles.text,
                isSecondary && styles.secondaryText,
                isLink && styles.linkText,
                props.labelStyle,
            ]}
            {...props}
        >
            {name}
        </Button>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 100,
        paddingVertical: 6,
        marginTop: 5,
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,

    },
    secondaryButton: {
        borderWidth: 1,
        borderRadius: 100,
        paddingVertical: 6,
        marginTop: 5,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    secondaryText: {
        color: Colors.primary,
    },
    linkButton: {
        backgroundColor: 'transparent',
        paddingVertical: 15,

        textDecorationLine: 'underline',
    },
    linkText: {
        color: "#666",
        textDecorationLine: 'underline',
        fontWeight: '500',
        fontSize: 14,
    },
});
