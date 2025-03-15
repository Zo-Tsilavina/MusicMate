import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const HomeScreen = () => {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.split('/').pop()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fichiers Audio</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Chargement des fichiers...</Text>
      ) : audioFiles.length === 0 ? (
        <Text style={styles.noFilesText}>Aucun fichier MP3 trouvé</Text>
      ) : (
        <FlatList
          data={audioFiles}
          renderItem={renderItem}
          keyExtractor={item => item}
        />
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
});

export default HomeScreen;