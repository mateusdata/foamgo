import React, { createContext, useContext, useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';





interface SubscriptionContextType {
  getOfferings: () => Promise<any>
}

const SubscriptionContext = createContext<SubscriptionContextType>({} as SubscriptionContextType)

export default function SubscriptionProvider({ children }: React.PropsWithChildren<{}>) {

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: "appl_QobGaASIscPCCWEGrzakxibbdgS" });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: "goog_domcvZyyCkZBbwIBnDkzUHRRyiw" });
    }
  }, []);


  const getOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      // 🔴 ERRADO - Pega apenas a offering default/current
      // const packages = offerings.current.availablePackages;

      // ✅ CORRETO - Pega uma offering específica pelo identifier
      const ofertaAnual = offerings.all['Identifier:  Oferta anual']; // Use o identifier exato
      console.log('Offerings recebidos:', ofertaAnual);
      purchasePackage(ofertaAnual.availablePackages[0]); // Exemplo: compra o primeiro pacote disponível da oferta anual
      return ofertaAnual;


    } catch (error: any) {
      Alert.alert('Error fetching offerings', error.message);
      return null;
    }
  };
  const purchasePackage = async (pkg: any) => {
    // Using Offerings/Packages
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (
        typeof customerInfo.entitlements.active["Foam go Partner Pro"] !==
        "undefined"
      ) {
        // Unlock that great "pro" content
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error during purchase', e.message);
      }
    }

    //nota: se você não estiver usando ofertas/pacotes para comprar produtos no aplicativo, pode usar purchaseStoreProduct e getProducts
    try {
      // Defina o productToBuy antes de usar
      const products = await Purchases.getProducts(["your_product_identifier"]);
      const productToBuy = products[0]; // substitua "your_product_identifier" pelo identificador correto do produto

      const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
      return customerInfo;
      if (
        typeof customerInfo.entitlements.active["my_entitlement_identifier"] !==
        "undefined"
      ) {
        // Unlock that great "pro" content
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error during purchase', e.message);
      }
    }
  }


  const values = {
    getOfferings,
  }

  return (
    <SubscriptionContext value={values}>
      {children}
    </SubscriptionContext>
  )
}

export const useSubscription = () => {
  return useContext(SubscriptionContext)
}