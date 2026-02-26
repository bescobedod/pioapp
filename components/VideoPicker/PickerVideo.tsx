import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon, IconButton, useTheme } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { VideoView, useVideoPlayer } from "expo-video";
import { permissionCamera } from "helpers/camara/cameraHelper";
import { locationPermission, getLocation } from "helpers/ubicacion/ubicacionHelper";
import globalState from "helpers/states/globalState";
import alertsState from "helpers/states/alertsState";
import videografyState from "helpers/states/videografyState";
import TouchRipple from "components/Touch/TouchRipple";
import { AppTheme } from "types/ThemeTypes";
import { compressVideo, openCameraVideo } from "helpers/video/VideoHelper";

type PickerVideoProps = {
    disabled?: boolean;
    location?: boolean;
}

export default function PickerVideo({
    disabled = false,
    location = true
}: PickerVideoProps){

    const theme = useTheme() as AppTheme

    const { openVisibleSnackBar } = alertsState()
    const { setOpenScreenLoading, setCloseScreenLoading } = globalState()

    const {
        metadatosVideo,
        setMetadatosVideo,
        clearMetadatosVideo
    } = videografyState()

    // NUEVO PLAYER expo-video
    const player = useVideoPlayer(
        metadatosVideo.videoUri
            ? { uri: metadatosVideo.videoUri }
            : null,
        (player) => {
            player.loop = false
        }
    )

    const getVideoCamera = async () => {

        try{
            setOpenScreenLoading()
            let resultLocation:any = null
            const cameraPermisos = await permissionCamera()
            if(!cameraPermisos)
                throw new Error("Permiso de cámara denegado")
            if(location) {
                const locationPermisos = await locationPermission()
                if(!locationPermisos)
                    throw new Error("Permiso de ubicación denegado")
            }
            const resultVideo:any = await openCameraVideo()
            if(!resultVideo)
                throw new Error("Error al capturar video")
            if(location) {
                resultLocation = await getLocation()
            }
            openVisibleSnackBar(`Optimizando video.`, 'normal')
            const resultOptimizadedVideoUri = await compressVideo(resultVideo.uri)
            setMetadatosVideo(
                // resultVideo.uri,
                resultOptimizadedVideoUri,
                resultVideo.exif || null,
                resultLocation?.coords || null,
                resultVideo.mimeType || "video/mp4",
                resultVideo.uri.split('/').pop()
            )
        }
        catch(error){
            openVisibleSnackBar(`${error}`, "error")
        }
        finally{
            setCloseScreenLoading()
        }

    }

    return (

        <View
            style={{
                height: 200,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: theme.colors.background,
                borderWidth: metadatosVideo.videoUri ? 0 : 2,
                borderStyle: metadatosVideo.videoUri ? "solid" : "dashed",
                borderColor: theme.colors.outlineVariant,
                opacity: disabled ? 0.5 : 1,
            }}
        >

            <TouchRipple
                disabled={disabled}
                onPress={disabled || metadatosVideo.videoUri ? () => {} : getVideoCamera}
                style={{ flex: 1 }}
            >

                {
                    metadatosVideo.videoUri
                    ? (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            style={{ flex: 1 }}
                        >

                            {/* VIDEO NUEVO */}
                            <VideoView
                                style={{ width: "100%", height: "100%" }}
                                player={player}
                                allowsFullscreen
                                allowsPictureInPicture
                                nativeControls
                            />

                            {/* Overlay */}
                            {/* <View style={[
                                styles.overlay,
                                { backgroundColor: "rgba(0,0,0,0.45)" }
                            ]}>

                                <Text style={{ color: "#fff" }}>
                                    Video capturado
                                </Text>

                                <Text
                                    variant="bodySmall"
                                    style={{ color: "#ccc" }}
                                >
                                    Pulsa para reemplazar
                                </Text>

                            </View> */}

                            {/* Delete */}
                            <IconButton
                                icon="trash-can-outline"
                                mode="contained"
                                containerColor="rgba(0,0,0,0.6)"
                                iconColor="#fff"
                                size={18}
                                style={styles.deleteIcon}
                                onPress={clearMetadatosVideo}
                                disabled={disabled}
                            />

                            {/* Indicator */}
                            <View
                                style={[
                                    styles.indicator,
                                    { backgroundColor: theme.colors.success }
                                ]}
                            />

                        </Animated.View>
                    )
                    : (
                        <View style={styles.emptyContainer}>

                            <View style={[
                                styles.iconCamera,
                                { backgroundColor: theme.colors.primary }
                            ]}>
                                <Icon
                                    source="video-outline"
                                    size={30}
                                    color={theme.colors.background}
                                />
                            </View>

                            <Text>
                                Video
                            </Text>

                            <Text
                                variant="bodySmall"
                                style={{ color: theme.colors.secondary }}
                            >
                                Pulsa para grabar video
                            </Text>

                        </View>
                    )
                }

            </TouchRipple>

        </View>

    )

}

const styles = StyleSheet.create({

    emptyContainer:{
        flex:1,
        alignItems:"center",
        justifyContent:"center",
        gap:8
    },

    iconCamera:{
        width:62,
        height:62,
        borderRadius:31,
        alignItems:"center",
        justifyContent:"center"
    },

    overlay:{
        position:"absolute",
        bottom:0,
        width:"100%",
        padding:16
    },

    deleteIcon:{
        position:"absolute",
        top:12,
        right:12
    },

    indicator:{
        position:"absolute",
        top:12,
        left:12,
        width:12,
        height:12,
        borderRadius:6
    }

})
