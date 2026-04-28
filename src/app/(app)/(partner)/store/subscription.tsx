import { PrimaryButton } from '@/components/buttons/primary-button'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Linking, StyleSheet, TouchableOpacity, useColorScheme, View, ActivityIndicator, Platform } from 'react-native'
import Purchases, { PurchasesPackage } from 'react-native-purchases'

const Subscription = () => {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual')
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null)
    const [annualPackage, setAnnualPackage] = useState<PurchasesPackage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPurchasing, setIsPurchasing] = useState(false)

    useEffect(() => {
        const fetchOfferings = async () => {
            setIsLoading(true);
            try {
                const offerings = await Purchases.getOfferings();

                if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
                    const monthly = offerings.current.availablePackages.find(
                        (p) => p.packageType === "MONTHLY" || p.identifier === "$rc_monthly"
                    );
                    const annual = offerings.current.availablePackages.find(
                        (p) => p.packageType === "ANNUAL" || p.identifier === "$rc_annual"
                    );

                    if (monthly) setMonthlyPackage(monthly);
                    if (annual) setAnnualPackage(annual);

                } else {
                    const iosIds = ['foam.go.partner.month', 'foam.go.partner.year'];
                    const androidIds = ['com.m2.blippartner:foamgopartnermonth', 'com.m2.blippartner:foamgoparteryear'];

                    const idsToFetch = Platform.OS === 'ios' ? iosIds : androidIds;

                    const products = await Purchases.getProducts(idsToFetch);

                    if (products.length > 0) {
                        const monthlyProd = products.find(p => p.identifier === (Platform.OS === 'ios' ? 'foam.go.partner.month' : 'com.m2.blippartner:foamgopartnermonth'));
                        const annualProd = products.find(p => p.identifier === (Platform.OS === 'ios' ? 'foam.go.partner.year' : 'com.m2.blippartner:foamgoparteryear'));

                        if (monthlyProd) setMonthlyPackage({ product: monthlyProd } as any);
                        if (annualProd) setAnnualPackage({ product: annualProd } as any);
                    }
                }
            } catch (e: any) {
                console.log('Error fetching offerings:', e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOfferings();
    }, []);

    const handleSubscribe = async () => {
        const itemToBuy = selectedPlan === 'monthly' ? monthlyPackage : annualPackage;

        if (!itemToBuy) {
            Alert.alert('Erro', 'Pacote não encontrado. Verifique sua conexão ou configuração.');
            return;
        }

        setIsPurchasing(true);
        try {
            let customerInfo;

            if ('packageType' in itemToBuy) {
                const purchaseResult = await Purchases.purchasePackage(itemToBuy as PurchasesPackage);
                customerInfo = purchaseResult.customerInfo;
            } else {
                const product = (itemToBuy as any).product;
                const purchaseResult = await Purchases.purchaseStoreProduct(product);
                customerInfo = purchaseResult.customerInfo;
            }

            if (customerInfo.entitlements.active["Foam go Partner Pro"] !== undefined) {
                try {
                    const updateUser = await api.patch('/users', {
                        hasPlan: true,
                    });
                    console.log('User updated on server:', updateUser.data);
                } catch (error: any) {
                    console.log('Error updating user on server:', error?.response?.data || error.response || error.message);
                    alert('Erro ao atualizar plano no servidor. Entre em contato com o suporte.');
                }
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert('Erro na compra', e.message);
            }
        } finally {
            setIsPurchasing(false);
        }
    }

    const handleRestore = async () => {
        setIsPurchasing(true);
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (customerInfo.entitlements.active["Foam go Partner Pro"] !== undefined) {
                Alert.alert("Sucesso", "Compras restauradas com sucesso!");
            } else {
                Alert.alert("Aviso", "Nenhuma assinatura ativa encontrada.");
            }
        } catch (e: any) {
            Alert.alert('Erro ao restaurar', e.message);
        } finally {
            setIsPurchasing(false);
        }
    }

    const getPriceString = (plan: 'monthly' | 'annual') => {
        if (plan === 'monthly') return monthlyPackage?.product.priceString || '...';
        return annualPackage?.product.priceString || '...';
    }

    const getDiscountPercentage = () => {
        if (monthlyPackage?.product.price && annualPackage?.product.price) {
            const monthlyPrice = monthlyPackage.product.price;
            const annualPrice = annualPackage.product.price;
            const discount = (1 - (annualPrice / (monthlyPrice * 12))) * 100;
            return Math.round(discount);
        }
        return 0;
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Image
                        source={isDark
                            ? require('@/assets/images/logo-dark.png')
                            : require('@/assets/images/logo.png')
                        }
                        style={[styles.appIcon, { bottom: Platform.OS === 'ios' ? 50 : 50 }]}
                        resizeMode="contain"
                    />
                    <ThemedText style={[styles.title, { bottom: Platform.OS === 'ios' ? 70 : 70 }]}>Foam go Parceiro Pro</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Desbloqueie recursos premium
                    </ThemedText>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary || '#4285F4'} />
                ) : (
                    <>
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, selectedPlan === 'monthly' && styles.tabActive]}
                                onPress={() => setSelectedPlan('monthly')}
                            >
                                <ThemedText style={[styles.tabText, selectedPlan === 'monthly' && styles.tabTextActive]}>
                                    Mensal
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, selectedPlan === 'annual' && styles.tabActive]}
                                onPress={() => setSelectedPlan('annual')}
                            >
                                <ThemedText style={[styles.tabText, selectedPlan === 'annual' && styles.tabTextActive]}>
                                    Anual
                                </ThemedText>
                                {getDiscountPercentage() > 0 && (
                                    <View style={styles.badge}>
                                        <ThemedText style={styles.badgeText}>
                                            -{getDiscountPercentage()}%
                                        </ThemedText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.priceContainer}>
                            <ThemedText style={styles.price}>
                                {getPriceString(selectedPlan)}
                            </ThemedText>
                            <ThemedText style={styles.period}>
                                por {selectedPlan === 'monthly' ? 'mês' : 'ano'}
                            </ThemedText>
                            <ThemedText style={styles.description}>
                                {selectedPlan === 'monthly'
                                    ? 'Cancele quando quiser'
                                    : 'Melhor custo-benefício'
                                }
                            </ThemedText>
                        </View>
                    </>
                )}

                <View style={styles.features}>
                    <Feature text="Lava jato ativo no aplicativo" />
                    <Feature text="Agendamentos ilimitados" />
                    <Feature text="Times ilimitados" />
                    <Feature text="Criação de horários e disponibilidade" />
                    <Feature text="Gestão completa de times" />
                </View>

                <PrimaryButton
                    name={isPurchasing ? "Processando..." : "Assinar Agora"}
                    onPress={handleSubscribe}
                    disabled={isPurchasing || isLoading}
                />

                <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                    <ThemedText style={styles.restoreText}>Restaurar Compras</ThemedText>
                </TouchableOpacity>

                {/* ✅ Footer atualizado para aprovação Apple Guideline 3.1.2(c) */}
                <View style={styles.footerLinks}>
                    <ThemedText style={styles.disclaimer}>
                    Assinatura com renovação automática {selectedPlan === 'monthly' ? 'mensal' : 'anual'} por {getPriceString(selectedPlan)}/{selectedPlan === 'monthly' ? 'mês' : 'ano'}.{' '}
                    Ao assinar, você concorda com nossos:
                    </ThemedText>
                    <View style={styles.footerLinksRow}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://blip2m.vercel.app/terms-of-use')}>
                            <ThemedText style={styles.footerLink}>Termos de Uso</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.disclaimer}> e </ThemedText>
                        <TouchableOpacity onPress={() => Linking.openURL('https://blip2m.vercel.app/policy')}>
                            <ThemedText style={styles.footerLink}>Política de Privacidade</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

            </ThemedScrollView>
            {Platform.OS === 'android' && (
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar tela de assinatura"
                >
                    <Ionicons name="close" size={18} color={isDark ? '#FFFFFF' : '#111111'} />
                </TouchableOpacity>
            )}
        </ThemedView>
    )
}

const Feature = ({ text }: { text: string }) => (
    <View style={styles.feature}>
        <View style={styles.check}>
            <ThemedText style={styles.checkText}>✓</ThemedText>
        </View>
        <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
)

export default Subscription;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        left: 0,
        right: 0,
        marginHorizontal: 16,
        zIndex: 10,
        width: 24,
        height: 24,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    content: {
        padding: 20,
        paddingTop: 76,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
    },
    appIcon: {
        width: 160,
        height: 160,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingBottom: 15,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 80,
        marginBottom: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 80,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: Colors.primary || '#4285F4',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: '#fff',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: 8,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    priceContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    price: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    period: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
    },
    description: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
    features: {
        marginBottom: 30,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    check: {
        width: 23,
        height: 23,
        borderRadius: 12,
        backgroundColor: Colors.primary || '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 16,
    },
    restoreButton: {
        marginTop: 15,
        alignItems: 'center',
        padding: 10,
    },
    restoreText: {
        fontSize: 14,
        color: Colors.primary || '#4285F4',
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    footerLinks: {
        alignItems: 'center',
        marginTop: 8,
    },
    footerLinksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    footerLink: {
        fontSize: 13,
        color: Colors.primary || '#4285F4',
        fontWeight: '600',
        paddingHorizontal: 2,
    },
})