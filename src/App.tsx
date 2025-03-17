import React, { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import HomeScreen from './screens/HomeScreen';

const App = () => {
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        console.log('TrackPlayer initialisé');
      } catch (error) {
        console.log('Erreur lors de l’initialisation de TrackPlayer :', error);
      }
    };

    setupPlayer();
  }, []);

  return <HomeScreen />;
};

export default App;