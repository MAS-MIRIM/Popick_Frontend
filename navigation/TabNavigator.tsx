import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import styled from 'styled-components/native';
import { View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ShortPickScreen from '../screens/ShortPickScreen';
import DogamScreen from '../screens/DogamScreen';
import MyPageScreen from '../screens/MyPageScreen';

import { HomeIcon, ShortPickIcon, DogamIcon, ProfileIcon } from '../components/SvgIcons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 92,
          paddingTop: 12,
          paddingBottom: 34,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
        },
        tabBarActiveTintColor: '#F63F4E',
        tabBarInactiveTintColor: '#999999',
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="ShortPickTab"
        component={ShortPickScreen}
        options={{
          tabBarLabel: '숏픽',
          tabBarIcon: ({ color }) => (
            <ShortPickIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="DogamTab"
        component={DogamScreen}
        options={{
          tabBarLabel: '도감',
          tabBarIcon: ({ color }) => (
            <DogamIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPageTab"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;