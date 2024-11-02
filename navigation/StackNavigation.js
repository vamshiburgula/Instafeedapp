import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigation from './TabNavigation';

const Stack = createStackNavigator();

export default function StackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigation} />
    </Stack.Navigator>
  );
}
