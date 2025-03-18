import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import TrackPlayer, { State } from 'react-native-track-player';
import { requestStoragePermission } from '../utils/permissions';
import { scanDirectory } from '../services/fileService';
import { extractMetadata } from '../services/metadataService';
import TrackItem from '../components/TrackItem';
import PlayerControls from '../components/PlayerControls';
import { Track } from '../types';

const HomeScreen = () => {
  const [audioFiles, setAudioFiles] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const hasPermission = await requestStoragePermission();
      if (hasPermission) {
        fetchAudioFiles();
      }
    };
    initialize();
  }, []);

  const fetchAudioFiles = async () => {
    setIsLoading(true);
    try {
      const basePath = '/storage/emulated/0/';
      console.log('Début de la recherche dans :', basePath);
      const mp3Paths = await scanDirectory(basePath);
      console.log('Tous les chemins MP3 trouvés :', mp3Paths);

      const mp3Files = await Promise.all(
        mp3Paths.map(async (path) => await extractMetadata(path))
      );
      console.log('Fichiers audio avec métadonnées :', mp3Files);
      setAudioFiles(mp3Files);
    } catch (error) {
      console.log('Erreur globale :', error);
      Alert.alert('Erreur', `Impossible de lire les dossiers : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = async (index: number) => {
    try {
      await TrackPlayer.reset();
      const tracks = audioFiles.map((track, i) => ({
        id: i.toString(),
        url: `file://${track.path}`,
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.cover,
      }));

      await TrackPlayer.add(tracks);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      setIsPlaying(true);
      setCurrentTrackIndex(index);
      console.log('Lecture démarrée :', audioFiles[index].path);
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

  const playNext = async () => {
    if (currentTrackIndex === null || currentTrackIndex >= audioFiles.length - 1) {
      return;
    }
    const nextIndex = currentTrackIndex + 1;
    await TrackPlayer.skip(nextIndex);
    await TrackPlayer.play();
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    console.log('Passage au suivant :', audioFiles[nextIndex].path);
  };

  const playPrevious = async () => {
    if (currentTrackIndex === null || currentTrackIndex <= 0) {
      return;
    }
    const prevIndex = currentTrackIndex - 1;
    await TrackPlayer.skip(prevIndex);
    await TrackPlayer.play();
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    console.log('Retour au précédent :', audioFiles[prevIndex].path);
  };

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
            renderItem={({ item, index }) => (
              <TrackItem track={item} onPress={() => playTrack(index)} />
            )}
            keyExtractor={(item) => item.path}
          />
          {currentTrackIndex !== null && (
            <PlayerControls
              track={audioFiles[currentTrackIndex]}
              isPlaying={isPlaying}
              onPrevious={playPrevious}
              onTogglePlayback={togglePlayback}
              onNext={playNext}
            />
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
});

export default HomeScreen;