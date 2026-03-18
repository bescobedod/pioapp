import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, RefreshControl } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { Title, useTheme, Chip, ActivityIndicator, Text } from 'react-native-paper';
import PageLayout from '../../components/Layouts/PageLayout';
import CardPublicacion from '../../components/Cards/CardPublicacion';
import {
  getPublicacionesHistorial,
  getCategoriasPublicacion,
  PublicacionType,
  CategoriaPublicacionType,
} from '../../helpers/http/Apis/PublicacionesApi';
import alertsState from '../../helpers/states/alertsState';
import * as ScreenCapture from 'expo-screen-capture';

export default function HistorialPublicacionesScreen() {
  const theme = useTheme();
  const { openVisibleSnackBar } = alertsState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historial, setHistorial] = useState<PublicacionType[]>([]);
  const [categorias, setCategorias] = useState<CategoriaPublicacionType[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);

  // Bloqueo de Pantallas (Seguridad Historial)
  useEffect(() => {
    let isActive = true;
    const preventCapture = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (e) {
        console.warn('Screen capture prevention error:', e);
      }
    };
    preventCapture();

    return () => {
      isActive = false;
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  const fetchCategorias = async () => {
    try {
      const resp = await getCategoriasPublicacion();
      if (resp.status && resp.data) {
        setCategorias(resp.data);
      }
    } catch (error) {
      console.warn('Error categorias:', error);
    }
  };

  const fetchHistorial = async (id_cat?: number) => {
    try {
      const resp = await getPublicacionesHistorial(id_cat);
      if (resp.status && resp.data) {
        setHistorial(resp.data);
      } else {
        setHistorial([]);
      }
    } catch (error) {
      openVisibleSnackBar('Error cargando historial de publicaciones', 'error');
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchCategorias();
    await fetchHistorial(selectedCategoria || undefined);
    setLoading(false);
  }, [selectedCategoria]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistorial(selectedCategoria || undefined);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSelectCategoria = (id: number | null) => {
    setSelectedCategoria(id);
  };

  return (
    <PageLayout titleAppBar="Historial" goBack={true}>
      <View className="flex-1 px-4 py-4">
        {/* Categories Horizontal Scroll */}
        <View style={{ marginBottom: 16, height: 40 }}>
          <GHScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingRight: 20, alignItems: 'center' }}
            keyboardShouldPersistTaps="handled">
            <Chip
              selected={selectedCategoria === null}
              onPress={() => handleSelectCategoria(null)}
              style={{
                marginRight: 8,
                backgroundColor: selectedCategoria === null ? theme.colors.primary : '#e0e0e0',
              }}
              textStyle={{ color: selectedCategoria === null ? 'white' : 'black' }}>
              Todas
            </Chip>
            {categorias.map((cat) => (
              <Chip
                key={cat.id_categoria_publicacion}
                selected={selectedCategoria === cat.id_categoria_publicacion}
                onPress={() => handleSelectCategoria(cat.id_categoria_publicacion)}
                style={{
                  marginRight: 8,
                  backgroundColor:
                    selectedCategoria === cat.id_categoria_publicacion ? cat.color : '#e0e0e0',
                }}
                textStyle={{
                  color: selectedCategoria === cat.id_categoria_publicacion ? 'white' : 'black',
                }}>
                {cat.nombre}
              </Chip>
            ))}
          </GHScrollView>
        </View>

        {loading ? (
          <View className="mt-20 flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 100 }}>
            {historial.length === 0 ? (
              <View className="mt-10 items-center">
                <Text variant="bodyLarge" style={{ color: 'gray' }}>
                  No hay publicaciones para mostrar
                </Text>
              </View>
            ) : (
              historial.map((pub) => (
                <View key={pub.id_publicacion} className="mb-4">
                  <CardPublicacion publicacion={pub} />
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </PageLayout>
  );
}
