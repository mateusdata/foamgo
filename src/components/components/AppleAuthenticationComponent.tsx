import { api } from '@/config/api';
import { useAuth } from '@/contexts/auth-provider';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function AppleAuthenticationComponent() {
    const { signInWithApple } = useAuth();
    return (
        <View style={styles.container}>
            <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={20}
                style={styles.button}
                onPress={async () => {
                    try {
                        const credential = await AppleAuthentication.signInAsync({
                            requestedScopes: [
                                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                            ],
                        });
                        // signed in
                        console.log(credential);

                        const response = await api.post('/auth/apple', credential);
                        console.log(response.data);
                        alert('Login successful!');
                        await signInWithApple(credential);  
                    } catch (e: any) {
                        if (e.code === 'ERR_REQUEST_CANCELED') {
                            // handle that the user canceled the sign-in flow
                        } else {
                            // handle other errors
                            if(e.status) {
                                router.push('/sign-up');
                            }
                        }
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

        alignItems: 'center',
        justifyContent: 'center',
       
    },
    button: {
        width: "100%",
        height: 55,
        borderRadius: 20,
        paddingVertical: 6,
        marginTop: 15,
    },
});
