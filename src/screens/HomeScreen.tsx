import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import TrackPlayer, { State } from 'react-native-track-player';

const HomeScreen = () => {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      let permission =
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const result = await check(permission);
      console.log('Résultat de la vérification de permission :', result);

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        console.log('Résultat de la demande de permission :', requestResult);
        if (requestResult === RESULTS.GRANTED) fetchAudioFiles();
        else Alert.alert('Erreur', 'Permission refusée. Activez-la manuellement.');
      } else if (result === RESULTS.GRANTED) {
        fetchAudioFiles();
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission bloquée',
          'Veuillez activer la permission dans les paramètres.'
        );
      }
    };

    requestPermissions();
  }, []);

  const fetchAudioFiles = async () => {
    setIsLoading(true);
    try {
      const basePath = '/storage/emulated/0/';
      console.log('Début de la recherche dans :', basePath);
      const mp3Files = await scanDirectory(basePath);
      console.log('Tous les fichiers MP3 trouvés :', mp3Files);
      setAudioFiles(mp3Files);
    } catch (error) {
      console.log('Erreur globale :', error);
      Alert.alert('Erreur', `Impossible de lire les dossiers : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const scanDirectory = async (dirPath: string): Promise<string[]> => {
    try {
      const files = await RNFS.readDir(dirPath);
      console.log(`Scan de ${dirPath} : ${files.length} éléments trouvés`);
      let mp3Files: string[] = [];

      for (const file of files) {
        if (file.isFile() && file.name.toLowerCase().endsWith('.mp3')) {
          console.log('MP3 détecté :', file.path);
          mp3Files.push(file.path);
        } else if (file.isDirectory()) {
          try {
            const subDirFiles = await scanDirectory(file.path);
            mp3Files = mp3Files.concat(subDirFiles);
          } catch (subError) {
            console.log(`Erreur dans sous-dossier ${file.path} :`, subError);
          }
        }
      }
      return mp3Files;
    } catch (error) {
      console.log(`Erreur dans ${dirPath} :`, error);
      return [];
    }
  };

  const playTrack = async (path: string) => {
    try {
      // Réinitialise le lecteur
      await TrackPlayer.reset();

      // Ajoute le fichier à la file d’attente
      await TrackPlayer.add({
        id: path,
        url: `file://${path}`, // Chemin local
        title: path.split('/').pop(),
        artist: 'Unknown',
      });

      // Démarre la lecture
      await TrackPlayer.play();
      setIsPlaying(true);
      setCurrentTrack(path);
      console.log('Lecture démarrée :', path);
    } catch (error) {
      console.log('Erreur lors de la lecture :', error);
      Alert.alert('Erreur', `Impossible de lire le fichier : ${error.message}`);
    }
  };

  const togglePlayback = async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => playTrack(item)}>
      <View style={styles.item}>
        <Text style={styles.itemText}>{item.split('/').pop()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fichiers Audio</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Chargement des fichiers...</Text>
      ) : audioFiles.length === 0 ? (
        <Text style={styles.noFilesText}>Aucun fichier MP3 trouvé</Text>
      ) : (
        <>
          <FlatList
            data={audioFiles}
            renderItem={renderItem}
            keyExtractor={item => item}
          />
          {currentTrack && (
            <View style={styles.playerControls}>
              <Text style={styles.currentTrack}>
                En lecture : {currentTrack.split('/').pop()}
              </Text>
              <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                <Text style={styles.buttonText}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  noFilesText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  playerControls: {
    padding: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  currentTrack: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;