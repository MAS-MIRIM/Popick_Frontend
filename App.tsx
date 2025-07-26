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
import PersonalityTestScreen from './screens/PersonalityTestScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  PersonalityTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

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
      
      // 첫 로그인 여부 확인
      if (isAuth) {
        const hasCompletedTest = await AsyncStorage.getItem('hasCompletedPersonalityTest');
        setIsFirstLogin(!hasCompletedTest);
      }
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
        initialRouteName={isAuthenticated ? (isFirstLogin ? "PersonalityTest" : "MainTabs") : "Welcome"}
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
                  onLoginSuccess={async () => {
                    // \uccab \ud68c\uc6d0\uac00\uc785 \ud6c4 \ub85c\uadf8\uc778\uc778\uc9c0 \ud655\uc778
                    const isFirstSignUp = await AsyncStorage.getItem('isFirstSignUp');
                    if (isFirstSignUp === 'true') {
                      setIsFirstLogin(true);
                      await AsyncStorage.removeItem('isFirstSignUp');
                    } else {
                      setIsFirstLogin(false);
                    }
                    setIsAuthenticated(true);
                  }}
                  onSignUpPress={() => props.navigation.navigate('SignUp')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {(props: NativeStackScreenProps<RootStackParamList, 'SignUp'>) => (
                <SignUpScreen
                  onSignUpSuccess={async () => {
                    setIsFirstLogin(true);
                    setIsAuthenticated(true);
                  }}
                  onLoginPress={() => props.navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="PersonalityTest">
              {() => (
                <PersonalityTestScreen
                  onComplete={async (result) => {
                    await AsyncStorage.setItem('hasCompletedPersonalityTest', 'true');
                    setIsFirstLogin(false);
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
