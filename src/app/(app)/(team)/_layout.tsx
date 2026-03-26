import { Stack } from 'expo-router';
import React from 'react';


export default function TeamStack() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{headerShown: true, headerTitle: 'Team'}} />
  );
}


