import RNFS from 'react-native-fs';

export const scanDirectory = async (dirPath: string): Promise<string[]> => {
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