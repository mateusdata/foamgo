import { Stack } from 'expo-router';
import React from 'react';


export default function ClientStack() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{headerShown: false}} />
  );
}


