import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import Splash from './screens/Splash';
import Welcome from './screens/Welcome';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash">
              {(props: NativeStackScreenProps<RootStackParamList, 'Splash'>) => (
                <Splash onFinish={() => props.navigation.navigate('Welcome')} />
              )}
            </Stack.Screen>
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
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
