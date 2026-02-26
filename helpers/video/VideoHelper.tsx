import * as ImagePicker from 'expo-image-picker';
import { Video } from 'react-native-compressor';

export const openCameraVideo = async () => {

    const result = await ImagePicker.launchCameraAsync({
        // mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        mediaTypes: ['videos'],
        videoMaxDuration: 180,
        quality: 0.7,
        exif: true
    });

    if(result.canceled) return null;

    return result.assets[0];
}

export const compressVideo = async (videoUri: string): Promise<string> => {
  try {
    if (!videoUri) {
      throw new Error('No se proporcionó un URI válido');
    }

    const compressedUri = await Video.compress(
      videoUri,
      {
        compressionMethod: 'auto',
      },
      (progress) => {
        // console.log(`Progreso: ${(progress * 100).toFixed(0)}%`);
      }
    );

    return compressedUri;
  } catch (error) {
    console.error('Error al comprimir el video:', error);
    throw error;
  }
};