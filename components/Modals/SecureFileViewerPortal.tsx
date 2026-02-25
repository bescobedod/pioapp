import React, { useEffect } from "react";
import { View, Dimensions, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Portal, Modal, useTheme, IconButton, Text } from "react-native-paper";
import { BlurView } from "expo-blur";
import globalState from "../../helpers/states/globalState";
import ZoomableImage from "../Image/ZoomableImage";
import { AppTheme } from "../../types/ThemeTypes";
import * as ScreenCapture from "expo-screen-capture";
import { WebView } from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import PdfViewer from "../../helpers/pdf/pdfViewer";

const { width, height } = Dimensions.get("window");

export type FileType = "image" | "video" | "audio" | "document" | "other";

type SecureFileViewerPortalProps = {
  url: string;
  name?: string;
  type: string; // The mime type or general type
  visible: boolean;
  onClose: () => void;
};

// Helper to determine the internal file category from the mime type or extension
const getInternalFileType = (type: string, url: string): FileType => {
  const t = type.toLowerCase();
 if (t.includes("image")) return "image";
  if (t.includes("video")) return "video";
  if (t.includes("audio")) return "audio";
  if (
    t.includes("pdf") ||
    t.includes("pdf") ||
    t.includes("document") ||
    t.includes("sheet") ||
    t.includes("msword") ||
    t.includes("excel") ||
    t.includes("powerpoint")
  ) {
    return "document";
  }
  
  // Fallback by extension
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (["mp4", "mov", "avi"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a", "ogg", "aac"].includes(ext)) return "audio";
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return "document";

  return "other";
};

export default function SecureFileViewerPortal({
  url,
  name,
  type,
  visible,
  onClose,
}: SecureFileViewerPortalProps) {
  const theme = useTheme() as AppTheme;
  const { dark } = globalState();
  const fileType = getInternalFileType(type, url);

  const player = useVideoPlayer(url, (p) => {
    if ((fileType === "video" || fileType === "audio") && visible) {
      p.play();
    }
  });

  // Bloquear capturas de pantalla manualmente al abrir el componente y liberarlo al cerrar.
  useEffect(() => {
    let isActive = true;
    const preventCapture = async () => {
      if (visible && isActive) {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
        } catch (error) {
          console.warn("Could not prevent screen capture", error);
        }
      } else {
        try {
          await ScreenCapture.allowScreenCaptureAsync();
        } catch (error) {
          console.warn("Could not allow screen capture", error);
        }
      }
    };

    preventCapture();

    return () => {
      isActive = false;
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, [visible]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        dismissable
        style={{ margin: 0, backgroundColor: "transparent" }}
        contentContainerStyle={{
          backgroundColor: "transparent",
          padding: 0,
          margin: 0,
          borderRadius: 0,
          elevation: 0,
          shadowColor: "transparent",
          position: "relative",
          height: "100%",
        }}
      >
        <View style={{ flex: 1, backgroundColor: "transparent", position: "relative" }}>
        {/* Blur de Fondo */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          onPress={onClose}
        >
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={25}
            tint={dark ? "dark" : "light"}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: dark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
            }}
          />
        </Pressable>

        {/* Botón de Cierre */}
        <IconButton
          icon={"close"}
          mode="contained-tonal"
          style={{ position: "absolute", top: 15, right: 15, zIndex: 10 }}
          onPress={onClose}
          size={25}
        />

        {/* Contenido Central */}
        <View style={styles.contentWrapper}>
          <View style={[styles.cardContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            
            {/* Header / Titulo */}
            <View style={styles.header}>
              <Text variant="titleMedium" numberOfLines={1} style={{ flex: 1, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                {name || "Archivo Adjunto"}
              </Text>
            </View>

            {/* Renderizado dinámico según tipo de archivo */}
            <View style={styles.fileContainer}>
              {visible && fileType === "image" && (
                <ZoomableImage>
                  <Image
                    source={{ uri: url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </ZoomableImage>
              )}

              {visible && (fileType === "video" || fileType === "audio") && (
                <View style={{ width: "100%", height: fileType === "audio" ? 120 : "100%", justifyContent: "center", backgroundColor: "black" }}>
                  <VideoView
                    style={{ width: "100%", height: "100%" }}
                    player={player}
                    allowsFullscreen={false}
                    allowsPictureInPicture={false}
                  />
                  {fileType === "audio" && (
                     <Text style={{ position: 'absolute', top: 20, color: 'white', width: '100%', textAlign: 'center' }}>
                       Reproductor de Audio
                     </Text>
                  )}
                </View>
              )}

              {visible && fileType === "document" && (
                <View style={{ flex: 1, width: "100%", height: "100%" }}>
                  <PdfViewer
                    source={{ uri: url }}
                    useGoogleDriveViewer={true}
                    style={{ flex: 1, width: "100%", height: "100%" }}
                    webviewProps={{
                      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    }}
                  />
                </View>
              )}

              {visible && fileType === "other" && (
                <View style={styles.errorContainer}>
                  <Text style={{ textAlign: "center" }}>
                    No hay un visor disponible para este tipo de archivo.{"\n"}
                    Por seguridad, no permitimos la descarga en aplicaciones externas.
                  </Text>
                </View>
              )}
            </View>
            
            {/* Footer de Seguridad */}
            <View style={styles.footer}>
              <Text variant="labelSmall" style={{ color: theme.colors.error, textAlign: 'center' }}>
                🔒 Protegido contra capturas y descargas
              </Text>
            </View>

          </View>
        </View>
      </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    pointerEvents: "box-none", // Para que los taps pasen al BlurView cuando se haga clic fuera
  },
  cardContainer: {
    width: "100%",
    height: "80%",
    maxWidth: 600,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  fileContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
