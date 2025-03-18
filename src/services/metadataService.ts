import musicMetadata from 'react-native-music-metadata';
import { Track } from '../types';

export const extractMetadata = async (path: string): Promise<Track> => {
  try {
    const metadata = await musicMetadata(path);
    const cover = metadata.common.picture?.[0]?.data
      ? `data:${metadata.common.picture[0].format};base64,${metadata.common.picture[0].data.toString('base64')}`
      : undefined;
    return {
      path,
      title: metadata.common.title || path.split('/').pop() || 'Unknown Title',
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      cover,
    };
  } catch (error) {
    console.log(`Erreur pour ${path} :`, error);
    return {
      path,
      title: path.split('/').pop() || 'Unknown Title',
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      cover: undefined,
    };
  }
};