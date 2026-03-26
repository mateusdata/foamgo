import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';


export default function ClientStack() {
  return (
   <>
   <StatusBar style='auto' />
    <Stack initialRouteName="(tabs)" screenOptions={{headerShown: true, headerTitle: 'Client'}} />
   </>
  );
}


