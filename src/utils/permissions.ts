import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestStoragePermission = async (): Promise<boolean> => {
  let permission =
    Platform.Version >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  const result = await check(permission);
  console.log('Résultat de la vérification de permission :', result);

  if (result === RESULTS.DENIED) {
    const requestResult = await request(permission);
    console.log('Résultat de la demande de permission :', requestResult);
    if (requestResult === RESULTS.GRANTED) return true;
    else {
      Alert.alert('Erreur', 'Permission refusée. Activez-la manuellement.');
      return false;
    }
  } else if (result === RESULTS.GRANTED) {
    return true;
  } else if (result === RESULTS.BLOCKED) {
    Alert.alert(
      'Permission bloquée',
      'Veuillez activer la permission dans les paramètres.'
    );
    return false;
  }
  return false;
};