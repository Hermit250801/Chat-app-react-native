// import {StatusBar} from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import {ImageBackground, StyleSheet, StatusBar, Text} from 'react-native';
import { getAuthUser } from "../../utils/api";
import {MAIN_COLOR} from '../../styles';
import { SocketContext } from '../../utils/context/SocketContext';

const SplashScreen = () => {
  const socket = useContext(SocketContext);

  const getStatusApi = async () => {
    try {
      const { data } = await getAuthUser();
      if(data.id) {
        socket.connect();
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    getStatusApi();
  }, []);
  return (
    <ImageBackground
      style={styles.background}
      source={require('../../assets/splashscreen.jpg')}
      resizeMode="cover">
      <StatusBar backgroundColor={MAIN_COLOR} barStyle="light-content" />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0068FF',
    resizeMode: 'cover',
    width: '100%'
  },
});

export default SplashScreen;
