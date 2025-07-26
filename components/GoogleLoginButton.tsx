import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

type Props = {
  onPress: () => void;
};

const GoogleLoginButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image
        source={{
          uri: 'https://developers.google.com/identity/images/g-logo.png',
        }}
        style={styles.icon}
      />
      <Text style={styles.text}>Google로 로그인</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
});

export default GoogleLoginButton;
