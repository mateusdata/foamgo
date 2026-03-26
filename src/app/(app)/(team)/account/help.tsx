import { StyleSheet, View, TouchableOpacity, useColorScheme, LayoutAnimation, Linking } from 'react-native'
import React, { useState } from 'react'

import { useForm } from "react-hook-form"
import { Colors } from '@/constants/theme'
import { api } from '@/config/api'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Alert } from 'react-native'
import { useAuth } from '@/contexts/auth-provider'
import { ThemedView } from '@/components/themed-view'
import PaperInput from '@/components/inputs/paper-input'
import { PrimaryButton } from '@/components/buttons/primary-button'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'



type FAQItem = {
    id: number;
    question: string;
    answer: string;
    category: 'account' | 'general' | 'technical' | 'privacy';
};

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Como criar uma conta?",
        answer: "Para criar uma conta, toque no botão 'Cadastrar-se' na tela inicial, preencha suas informações pessoais e confirme seu e-mail. É rápido e gratuito!",
        category: 'account'
    },
    {
        id: 2,
        question: "Esqueci minha senha, como recuperar?",
        answer: "Na tela de login, toque em 'Esqueci minha senha', digite seu e-mail cadastrado e você receberá um link para redefinir sua senha.",
        category: 'account'
    },
    {
        id: 3,
        question: "Como alterar minhas informações pessoais?",
        answer: "Vá em Conta > Configurações > Informações Pessoais. Lá você pode editar seu nome, e-mail, telefone e outras informações do perfil.",
        category: 'account'
    },
    {
        id: 4,
        question: "O aplicativo é gratuito?",
        answer: "Sim! Nosso aplicativo é totalmente gratuito para uso. Algumas funcionalidades premium podem estar disponíveis mediante assinatura.",
        category: 'general'
    },
    {
        id: 5,
        question: "Como funciona o modo escuro?",
        answer: "O modo escuro é ativado automaticamente seguindo as configurações do seu dispositivo. Você também pode alterá-lo manualmente nas configurações do app.",
        category: 'general'
    },
    {
        id: 6,
        question: "O app não está funcionando corretamente",
        answer: "Tente fechar e reabrir o aplicativo. Se o problema persistir, verifique se há atualizações disponíveis na loja de aplicativos ou reinicie seu dispositivo.",
        category: 'technical'
    },
    {
        id: 7,
        question: "Como reportar um problema?",
        answer: "Você pode entrar em contato conosco através do e-mail suporte@foamgo.com.br ou pelo formulário de contato disponível nas configurações.",
        category: 'technical'
    },
    {
        id: 8,
        question: "Meus dados estão seguros?",
        answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança para proteger suas informações pessoais.",
        category: 'privacy'
    },
    {
        id: 9,
        question: "Como excluir minha conta?",
        answer: "Para excluir sua conta permanentemente, vá em Configurações > Privacidade > Excluir Conta. Atenção: esta ação não pode ser desfeita.",
        category: 'privacy'
    }
];

const Help = () => {
    const colorScheme = useColorScheme() || 'light';
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const toggleExpanded = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newExpandedItems = new Set(expandedItems);
        if (newExpandedItems.has(id)) {
            newExpandedItems.delete(id);
        } else {
            newExpandedItems.add(id);
        }
        setExpandedItems(newExpandedItems);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'account':
                return <Ionicons name="person-outline" size={20} color={Colors.primary} />;
            case 'general':
                return <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />;
            case 'technical':
                return <Ionicons name="settings-outline" size={20} color={Colors.primary} />;
            case 'privacy':
                return <Ionicons name="shield-outline" size={20} color={Colors.primary} />;
            default:
                return <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />;
        }
    };

    const getCategoryName = (category: string) => {
        switch (category) {
            case 'account':
                return 'Conta';
            case 'general':
                return 'Geral';
            case 'technical':
                return 'Técnico';
            case 'privacy':
                return 'Privacidade';
            default:
                return 'Geral';
        }
    };

    const groupedFAQ = faqData.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, FAQItem[]>);

    return (
        <ThemedScrollView
            contentInsetAdjustmentBehavior="automatic"
            lightColor="#F8F8F8"
            darkColor="#121212"
            style={styles.container}
        >
            {/* Header */}
            <ThemedView style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <ThemedText style={styles.headerTitle}>Central de Ajuda</ThemedText>
                </View>
                <ThemedText style={styles.headerSubtitle}>
                    Encontre respostas para suas dúvidas
                </ThemedText>
            </ThemedView>

            {/* Contact Support */}
            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Precisa de mais ajuda?</ThemedText>
                <View style={styles.menuGroup}>
                    <ContactItem
                        icon={<Ionicons name="mail-outline" size={24} color={Colors.primary} />}
                        label="Enviar e-mail"
                        description="suporte@foamgo.com.br"
                        onPress={() => Linking.openURL('mailto:suporte@foamgo.com.br')}
                        showBorder={true}
                    />
                    <ContactItem
                        icon={<Ionicons name="chatbubbles-outline" size={24} color={Colors.primary} />}
                        label="WhatsApp"
                        description="+55 71 8293-6699"
                        onPress={() => Linking.openURL('https://wa.me/557182936699')}
                        showBorder={false}
                    />
                </View>
            </View>

            {/* FAQ Sections */}
            {Object.entries(groupedFAQ).map(([category, items]) => (
                <View key={category} style={styles.sectionContainer}>
                    <View style={styles.categoryHeader}>
                        {getCategoryIcon(category)}
                        <ThemedText style={styles.sectionTitle}>
                            {getCategoryName(category)}
                        </ThemedText>
                    </View>
                    <View style={styles.menuGroup}>
                        {items.map((item, index) => (
                            <FAQAccordion
                                key={item.id}
                                item={item}
                                isExpanded={expandedItems.has(item.id)}
                                onToggle={() => toggleExpanded(item.id)}
                                showBorder={index < items.length - 1}
                            />
                        ))}
                    </View>
                </View>
            ))}

            <View style={styles.bottomSpacer} />
        </ThemedScrollView>
    );
};

type ContactItemProps = {
    icon: React.ReactNode;
    label: string;
    description: string;
    onPress: () => void;
    showBorder?: boolean;
};

const ContactItem = ({
    icon,
    label,
    description,
    onPress,
    showBorder = false
}: ContactItemProps) => {
    const colorScheme = useColorScheme() || 'light';

    return (
        <ThemedPressable
            style={[
                styles.menuItem,
                {
                    backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E',
                    borderBottomWidth: showBorder ? 1 : 0,
                    borderBottomColor: colorScheme === 'light' ? '#F0F0F0' : '#2A2A2A',
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                    {icon}
                </View>
                <View style={styles.menuTextContainer}>
                    <ThemedText style={styles.menuLabel}>
                        {label}
                    </ThemedText>
                    <ThemedText style={styles.menuDescription}>
                        {description}
                    </ThemedText>
                </View>
            </View>
            <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color={colorScheme === 'light' ? '#C0C0C0' : '#666666'}
            />
        </ThemedPressable>
    );
};

type FAQAccordionProps = {
    item: FAQItem;
    isExpanded: boolean;
    onToggle: () => void;
    showBorder?: boolean;
};

const FAQAccordion = ({
    item,
    isExpanded,
    onToggle,
    showBorder = false
}: FAQAccordionProps) => {
    const colorScheme = useColorScheme() || 'light';

    return (
        <ThemedView
            style={styles.accordionContainer}
        >
            <ThemedPressable
                style={styles.accordionHeader}
                onPress={onToggle}
            >
                <View style={styles.accordionHeaderContent}>
                    <ThemedText style={styles.questionText}>
                        {item.question}
                    </ThemedText>
                    <Animated.View
                        style={[
                            styles.chevronContainer,
                            {
                                transform: [
                                    {
                                        rotate: isExpanded ? '180deg' : '0deg'
                                    }
                                ]
                            }
                        ]}
                    >
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={colorScheme === 'light' ? '#666666' : '#999999'}
                        />
                    </Animated.View>
                </View>
            </ThemedPressable>

            {isExpanded && (
                <View style={styles.accordionContent}>
                    <ThemedText style={styles.answerText}>
                        {item.answer}
                    </ThemedText>
                </View>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerContainer: {
        marginBottom: 24,
        paddingTop: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        flex: 1,
    },
    headerSubtitle: {
        fontSize: 16,
        opacity: 0.7,
        marginLeft: 44,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    menuGroup: {
        gap: 4,
        marginTop: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    menuDescription: {
        fontSize: 14,
        opacity: 0.6,
    },
    accordionContainer: {
        overflow: 'hidden',
    },
    accordionHeader: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    accordionHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 12,
    },
    chevronContainer: {
        padding: 4,
    },
    accordionContent: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    answerText: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default Help;