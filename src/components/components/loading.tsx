import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Loading: React.FC = () => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Loading;