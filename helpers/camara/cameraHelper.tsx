import { requestCameraPermissionsAsync, launchCameraAsync, launchImageLibraryAsync, getCameraPermissionsAsync, CameraPermissionResponse, PermissionStatus } from 'expo-image-picker'

export const permissionCamera = async () => {

    const { status } = await requestCameraPermissionsAsync()

    if(status !== 'granted') return false

    return true

}

export const openCamera = async () => {

    let result = await launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        exif: true
    })

    if(result.canceled) return null

    const img:any = result?.assets[0] || null

    return img ? img : null

}

export const openGallery = async () => {

    let result = await launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
        exif: true
    })

    if(result.canceled) return null

    const img:any = result?.assets[0] || null

    return img ? img : null

}

export const getCameraPermission = async () : Promise<PermissionStatus|null> => {
  try {
    const { status } = await getCameraPermissionsAsync();
    return status; // 'granted' | 'denied' | 'undetermined'
  } catch (error) {
    return null
  }
  
};