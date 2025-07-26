import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import Welcome from './screens/Welcome';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import TabNavigator from './navigation/TabNavigator';
import ApiService from './utils/api';
import AsyncStorage from './utils/storage';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('[App] Checking auth status...');
      
      // 스토리지 내용 확인 (디버깅용)
      const token = await AsyncStorage.getItem('accessToken');
      console.log('[App] Current token in storage:', token ? 'exists' : 'not found');
      
      const isAuth = await ApiService.checkAuth();
      console.log('[App] Auth check result:', isAuth);
      setIsAuthenticated(isAuth);
    } catch (error) {
      console.error('[App] Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#F63F4E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome">
              {(props: NativeStackScreenProps<RootStackParamList, 'Welcome'>) => (
                <Welcome
                  onLoginPress={() => props.navigation.navigate('Login')}
                  onSignUpPress={() => props.navigation.navigate('SignUp')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {(props: NativeStackScreenProps<RootStackParamList, 'Login'>) => (
                <LoginScreen
                  onLoginSuccess={() => setIsAuthenticated(true)}
                  onSignUpPress={() => props.navigation.navigate('SignUp')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {(props: NativeStackScreenProps<RootStackParamList, 'SignUp'>) => (
                <SignUpScreen
                  onSignUpSuccess={() => setIsAuthenticated(true)}
                  onLoginPress={() => props.navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
