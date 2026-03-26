import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import { Colors } from '@/constants/theme';

interface PaperInputProps {
    name: string;
    control: any;
    label: string;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    error?: string;
    secureTextEntry?: boolean;
    showPasswordToggle?: boolean;
    watch?: any;
    focusable?: boolean;
    autoFocus?: boolean;

    [key: string]: any;
}

export default function PaperInput({
    name,
    control,
    label,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    error,
    secureTextEntry = false,
    showPasswordToggle = false,
    focusable = false,
    autoFocus = false,
    watch,
    ...rest
}: PaperInputProps) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const isPasswordField = secureTextEntry || showPasswordToggle;
    const actualSecureEntry = isPasswordField ? !passwordVisible : false;
    const fieldValue = watch ? watch(name) : '';

    return (
        <View style={styles.inputContainer}>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        mode="outlined"
                        outlineStyle={styles.outlineStyle}
                        style={styles.input}
                        label={label}
                        placeholder={placeholder}
                        activeUnderlineColor={Colors.primary}
                        contentStyle={styles.inputContent}
                        activeOutlineColor={Colors.primary}
                        dense={false}
                        focusable={focusable}
                        autoFocus={autoFocus}

                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        secureTextEntry={actualSecureEntry}
                        right={
                            isPasswordField && fieldValue ? (
                                <TextInput.Icon
                                    icon={passwordVisible ? "eye-off" : "eye"}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                />
                            ) : null
                        }
                        {...rest}
                    />
                )}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginTop: 0,
        minHeight: 80,
    },
    outlineStyle: {
        borderRadius: 80,
    },
    input: {
        backgroundColor: 'transparent',
    },
    inputContent: {
        backgroundColor: 'transparent',
    },
    errorText: {
        color: '#ad3a3aff',
        left: 16,
        top: 1,
        
    },
});
