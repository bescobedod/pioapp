import { yupResolver } from '@hookform/resolvers/yup';
import {
  DetalleEntradaInventario,
  EntradaInventarioType,
} from 'Apis/ArticulosRecepcion/ArticulosRecepcionApi';
import { getTiendas } from 'Apis/TiendasModulo/TiendasModuloApi';
import FormAdaptiveKeyBoard from 'components/container/FormAdaptiveKeyBoard';
import PickerFile from 'components/container/PickerFile';
import ScrollViewContainer from 'components/container/ScrollViewContainer';
import ButtonForm from 'components/form/ButtonForm';
import DropdownForm from 'components/form/DropdownForm';
import InputFormHook from 'components/form/InputFormHook';
import IconButtomForm from 'components/form/IconButtomForm';
import PageLayout from 'components/Layouts/PageLayout';
import ListItemComponent from 'components/List/ListItemComponent';
import ListRender from 'components/List/ListRender';
import DataTableInfo from 'components/tables/DataTableInfo';
import PickerVideo from 'components/VideoPicker/PickerVideo';
import { onOpenModalize } from 'helpers/Modalize/ModalizeHelper';
import alertsState from 'helpers/states/alertsState';
import fotografyState from 'helpers/states/fotografyState';
import globalState from 'helpers/states/globalState';
import videografyState from 'helpers/states/videografyState';
import schemaFormNwDevoluciones, {
  schemaFormNwDevolucionesType,
} from 'helpers/validatesForm/schemaFormNwDevoluciones';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, StyleSheet, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { ActivityIndicator, Icon, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import Option from 'types/Dropdown/Option';
import { AppTheme } from 'types/ThemeTypes';
import ModalizeDevolucionArticulo from './Layout/ModalizeDevolucionArticulo';
import { getSAPRecepciones, postCreateDevolucion, PurchaseDeliveryNote, getMotivosDevolucion, MotivoDevolucionType } from 'Apis/Devolucion/DevolucionApi';
import { NavigationService } from 'helpers/navigator/navigationScreens';


export type TableDataArticulosDevolucion = DetalleEntradaInventario & { 
  cantidadDevolver: number; 
  unidadMedida?: string | null; 
  unidadMedidaDevolucion?: string | null; 
  id_devolucion_motivo?: number | null; 
  motivo_devolucion?: string | null; 
  nota_reclamo?: string | null;
  piezas?: { id_pieza: number, cantidad: number }[] | null;
};

export default function DevolucionPollosCreacionPage() {
  const theme = useTheme() as AppTheme;
  const {
    control,
    handleSubmit,
    reset,
    resetField,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(schemaFormNwDevoluciones),
    mode: 'all',
    shouldUnregister: true,
  });
  const { metadatosPicture, clearMetadatosPicture } = fotografyState();
  const { metadatosVideo, clearMetadatosVideo } = videografyState();
  const { setOpenScreenLoading, setCloseScreenLoading } = globalState();
  const [tiendasState, setTiendasState] = useState<Option[]>([]);
  const [tiendasList, setTiendasList] = useState<any[]>([]);
  const [initLoadingPage, setInitLoadingPage] = useState<boolean>(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const [recepciones, setRecepciones] = useState<PurchaseDeliveryNote[]>([]);
  const [motivosList, setMotivosList] = useState<Option[]>([]);
  const [loadingRecepciones, setLoadingRecepciones] = useState<boolean>(false);
  const [articulosDevolucion, setArticulosDevolucion] = useState<TableDataArticulosDevolucion[]>(
    []
  );
  const { openVisibleSnackBar } = alertsState();
  const valueTienda = watch('tienda');
  const valueRecepcion = watch('recepcion');
  const modalizeRefDevolucionArticulo = useRef<Modalize>(null);
  const [selectArticuloDevolucion, setSelectArticuloDevolucion] =
    useState<TableDataArticulosDevolucion | null>(null);
  const [loadingFormDevolucion, setLoadingFormDevolucion] = useState<boolean>(false);

  const clearHook = () => {
    clearMetadatosPicture();
    clearMetadatosVideo();
  };

  const renderTiendas = async () => {
    const listTiendas = await getTiendas();
    setTiendasList(listTiendas.data ?? []);
    const flatTiendas: any = listTiendas.data?.flatMap((el) => ({
      label: el.nombre_tienda,
      value: `${el.codigo_empresa}-${el.codigo_tienda}`,
    }));
    setTiendasState(flatTiendas);
    setInitLoadingPage(false);
  };

  const renderMotivos = async () => {
    const result = await getMotivosDevolucion('pollos');
    console.log('Motivos Pollos:', result);
    if (result.status && result.data) {
       const mapped = result.data.map((m: any) => ({ label: m.motivo, value: m.id_devolucion_motivo }));
       setMotivosList([{ label: 'Selecciona tu motivo...', value: '' as any }, ...mapped]);
    }
  };

  const onFocusDropdownRecepciones = async () => {
    try {
      setLoadingRecepciones(true);
      const [empresa, tienda] = valueTienda.split('-');
      const result = await getSAPRecepciones({ empresa, tienda, tipoReclamo: 'pollos' });
      setRecepciones(result?.data ?? []);
    } catch (error) {
      openVisibleSnackBar(`${error}`, 'error');
    } finally {
      setLoadingRecepciones(false);
    }
  };

  const onChangeValueRecepcionSeleccionada = async () => {
    if (!valueRecepcion) return;
    try {
      setOpenScreenLoading();
      const recepcionSelect =
        recepciones?.find((el) => el.DocEntry == Number(valueRecepcion)) ?? null;
      console.log(recepcionSelect);
      if(!recepcionSelect) return;
      
      const resultMapRecepciones = recepcionSelect.DocumentLines.map((el) => {
        const unidadDevolucion = el.ItemCode === 'MP0006' ? 'LIBRAS' : 'ONZAS';
        let customUnidadMedida = "Bolsa de 5 Libras";
        if (el.ItemCode === 'MP0006') customUnidadMedida = "Pollo(s)";
        else if (el.ItemCode === 'MP0010') customUnidadMedida = "Unidad(es)";
        else if (el.ItemCode === 'MP0004') customUnidadMedida = "Bolsa de 64 Unidades";

        return { 
          nombreProducto: el.ItemDescription,
          quantity: el.Quantity,
          cantidadReal: String(el.Quantity),
          ItemCode: el.ItemCode,
          lienaEntradaMer: el.LineNum,
          cantidadDevolver: 0,
          unidadMedida: customUnidadMedida,
          unidadMedidaDevolucion: unidadDevolucion,
        };
      });
      setArticulosDevolucion(resultMapRecepciones ?? []);
    } catch (error) {
      openVisibleSnackBar(`${error}`, 'error');
    } finally {
      setCloseScreenLoading();
    }
  };

  const editCantidadDevolverState = (
    id_devolucion_motivo: number, 
    motivoName: string, 
    cantidadDevolver: number, 
    unidadMedidaDevolucion: string | null, 
    piezas: { id_pieza: number, cantidad: number }[] | null, 
    nota_reclamo: string | null
  ) => {
    if (!selectArticuloDevolucion) return;
    setArticulosDevolucion((prev) =>
      prev.map((item) =>
        item.ItemCode === selectArticuloDevolucion.ItemCode ? { ...item, cantidadDevolver, id_devolucion_motivo, motivo_devolucion: motivoName, unidadMedidaDevolucion, piezas, nota_reclamo } : item
      )
    );
    setSelectArticuloDevolucion((prev) => (prev ? { ...prev, cantidadDevolver, id_devolucion_motivo, motivo_devolucion: motivoName, unidadMedidaDevolucion, piezas, nota_reclamo } : prev));
  };

  const onSubmitFormSaveDevolucion = async (data: schemaFormNwDevolucionesType) => {
    try {
      const { imgUri, mimeType: mimeTypeImage, nameImg } = metadatosPicture;
      const { videoUri, mimeType: mimeTypeVideo, fileName } = metadatosVideo;
      if (!imgUri || !mimeTypeImage || !nameImg)
        return openVisibleSnackBar(`Porfavor ingresa un imagen de la temperatura.`, 'warning');
      if (!videoUri || !mimeTypeVideo || !fileName)
        return openVisibleSnackBar(`Porfavor ingresa un video de comprobante.`, 'warning');
      const [empresa, tienda] = data.tienda.split('-');

      const selectedTienda = tiendasList.find(
        (el) => el.codigo_empresa === empresa && el.codigo_tienda === tienda
      );

      const articulosDevolucionValid = articulosDevolucion.filter(
        (el) => Number(el?.cantidadDevolver ?? 0) > 0
      );
      const recepcionSeleccionada = recepciones.find((el) => el.DocEntry === Number(data.recepcion));
      let idEntradaFinal: number | string = data.recepcion;
      if (recepcionSeleccionada && recepcionSeleccionada.U_NDGFACE && !isNaN(Number(recepcionSeleccionada.U_NDGFACE))) {
        idEntradaFinal = Number(recepcionSeleccionada.U_NDGFACE);
      }

      const bodyFormData: any = {
        empresa,
        tienda,
        nombre_empresa: selectedTienda?.nombre_empresa ?? '',
        nombre_tienda: selectedTienda?.nombre_tienda ?? '',
        detalle: data.detalle,
        tipo_balanza: data.tipo_balanza || 'digital',
        idEntradaInventario: Number(idEntradaFinal),
        detalle_devolucion: JSON.stringify(articulosDevolucionValid),
        foto_temperatura: {
          uri: imgUri,
          type: mimeTypeImage,
          name: nameImg,
        },
        video_comprobante: {
          uri: videoUri,
          type: mimeTypeVideo,
          name: fileName,
        },
      };
      setLoadingFormDevolucion(true);
      const result = await postCreateDevolucion(bodyFormData);
      if (result.status) {
        openVisibleSnackBar(`${result?.message ?? 'Devolucion creada correctamente.'}`, 'success');
        NavigationService.reset('Home');
      }
    } catch (error) {
      openVisibleSnackBar(`${error}`, 'error');
    } finally {
      setLoadingFormDevolucion(false);
    }
  };

  useEffect(() => {
    clearHook();
    return clearHook();
  }, []);

  useEffect(() => {
    renderTiendas();
    renderMotivos();
  }, []);

  useEffect(() => {
    if (!initLoadingPage) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [initLoadingPage]);

  useEffect(() => {
    resetField('recepcion', { defaultValue: '' });
    resetField('detalle', { defaultValue: '' });
    setRecepciones([]);
    setArticulosDevolucion([]);
  }, [valueTienda]);

  useEffect(() => {
    onChangeValueRecepcionSeleccionada();
  }, [valueRecepcion]);

  return (
    <>
      {/* loading */}
      <Animated.View
        pointerEvents={initLoadingPage ? 'auto' : 'none'}
        style={[
          {
            backgroundColor: theme.colors.background,
            opacity,
          },
          stylesDevolucionCreate.screenLoading,
        ]}>
        <ActivityIndicator animating={true} size={'large'} color={theme.colors.primary} />
      </Animated.View>

      {/* modalize para editar articulo devolucion */}
      <ModalizeDevolucionArticulo
        modalizeRefDevolucionArticulo={modalizeRefDevolucionArticulo}
        selectArticuloDevolucion={selectArticuloDevolucion}
        motivosDropdown={motivosList}
        editCantidadDevolverState={editCantidadDevolverState}
      />

      <PageLayout goBack notification={false} titleAppBar="Nueva devolucion">
        <ScrollViewContainer>
          <View className="my-6 w-full">
            <FormAdaptiveKeyBoard>
              <View className="w-full flex-col gap-3.5">
                <DropdownForm
                  label="Tienda"
                  data={tiendasState}
                  control={control}
                  name="tienda"
                  errors={errors}
                  disable={loadingFormDevolucion}
                />
                <DropdownForm
                  loading={loadingRecepciones}
                  label="Recepciones"
                  onFocus={onFocusDropdownRecepciones}
                  data={recepciones.map((el) => ({
                    label: `${el.Comments || 'Doc ' + el.DocNum}`,
                    value: el.DocEntry,
                  }))}
                  control={control}
                  name="recepcion"
                  errors={errors}
                  disable={!valueTienda || loadingFormDevolucion}
                />
                {/* Productos para dar de baja */}
                <ListItemComponent
                  titleStyle={{ color: theme.colors.primary }}
                  title="PRODUCTOS DE BAJA"
                  description="Ingresa las cantidades que quieres dar de baja."
                  descriptionNumberOfLines={0}
                />
                <View className="flex w-full flex-col gap-4">
                  {articulosDevolucion.map((item, index) => {
                    const isReturning = Number(item.cantidadDevolver) > 0;
                    return (
                      <View
                        key={`articulo-${item.ItemCode}-${index}`}
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderColor: isReturning ? theme.colors.error : theme.colors.outlineVariant,
                          borderWidth: isReturning ? 1.5 : 1,
                        }}
                        className="flex-col rounded-2xl p-4 shadow-sm w-full">
                        <View className="flex-row items-start justify-between mb-2">
                           <View className="flex-1 pr-2">
                              <Text style={{ color: theme.colors.onSurface }} className="font-bold text-base mb-1">
                                {item.nombreProducto}
                              </Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                Código: {item.ItemCode}
                              </Text>
                           </View>
                           <IconButtomForm
                              icon="pencil"
                              disabled={loadingFormDevolucion}
                              onPress={() => {
                                setSelectArticuloDevolucion({ ...item });
                                onOpenModalize(modalizeRefDevolucionArticulo);
                              }}
                            />
                        </View>
                        
                        {item.motivo_devolucion && (
                           <View className="mb-3 mt-1">
                              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                Motivo seleccionado:
                              </Text>
                              <Text style={{ color: theme.colors.error }} className="font-bold">
                                {item.motivo_devolucion}
                              </Text>
                           </View>
                        )}

                        <View className="flex-col mt-2 pt-3 border-t border-gray-100">
                           <View className="flex-row items-center justify-between mb-1">
                             <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Recepcionado:</Text>
                             <Text style={{ color: theme.colors.onSurface }} className="font-bold">
                               {item.cantidadReal} {item.unidadMedida}
                             </Text>
                           </View>

                           {item.cantidadDevolver > 0 && (
                             <View className="flex-row items-center justify-between mb-1">
                               <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>A Devolver:</Text>
                               <Text style={{ color: theme.colors.error }} className="font-bold">-{item.cantidadDevolver} {item.unidadMedidaDevolucion}</Text>
                             </View>
                           )}

                           {item.piezas && item.piezas.length > 0 && item.id_devolucion_motivo !== 23 && (
                             <View className="flex-col mt-2">
                               <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Piezas Devueltas:</Text>
                               <View className="flex-row flex-wrap mt-1">
                                 {item.piezas.map((p: any, i: number) => (
                                   <View key={i} className="mr-3 mb-1 bg-gray-100 px-2 py-1 rounded">
                                     <Text variant="bodySmall" className="font-bold">
                                       {p.id_pieza === 1 ? 'Pierna' : p.id_pieza === 2 ? 'Ala' : p.id_pieza === 3 ? 'Pechuga' : 'Cuadril'}: {p.cantidad}
                                     </Text>
                                   </View>
                                 ))}
                               </View>
                             </View>
                           )}

                           {item.nota_reclamo && (
                              <View className="mt-2 text-xs">
                                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}>
                                  Notas: {item.nota_reclamo}
                                </Text>
                              </View>
                           )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                <ListItemComponent
                  titleStyle={{ color: theme.colors.primary }}
                  title="FOTOGRAFIA TEMPERATURA"
                  description="Porfavor toma una fotografia clara de la temperatura."
                  descriptionNumberOfLines={0}
                />
                <PickerFile location={false} disabled={loadingFormDevolucion} />
                <ListItemComponent
                  titleStyle={{ color: theme.colors.primary }}
                  title="VIDEO COMPROBANTE"
                  description="Porfavor captura un video de comprobante de baja y que cumpla los siguientes requisitos:"
                  descriptionNumberOfLines={0}
                />
                <ListRender
                  titleSubheader={''}
                  items={[
                    {
                      title: 'Indicar tienda',
                      left(props) {
                        return <Icon source="circle-small" size={20} />;
                      },
                    },
                    {
                      title: 'Fecha de reclamo',
                      left(props) {
                        return <Icon source="circle-small" size={20} />;
                      },
                    },
                    {
                      title: 'Color de cinta',
                      left(props) {
                        return <Icon source="circle-small" size={20} />;
                      },
                    },
                    {
                      title: 'Motivo',
                      left(props) {
                        return <Icon source="circle-small" size={20} />;
                      },
                    },
                    {
                      title: 'Video claro',
                      left(props) {
                        return <Icon source="circle-small" size={20} />;
                      },
                    },
                    {
                      title: 'Pesas en buen estado',
                      left(props) {
                        return <Icon source="circle-small" size={20} />;
                      },
                    },
                  ]}
                />
                <PickerVideo location={false} disabled={loadingFormDevolucion} />

                <ListItemComponent
                  titleStyle={{ color: theme.colors.primary }}
                  title="TIPO DE BALANZA"
                  description="Selecciona el tipo de equipo utilizado para el pesaje."
                  descriptionNumberOfLines={0}
                />
                <View className="px-1">
                  <Controller
                    control={control}
                    name="tipo_balanza"
                    render={({ field: { onChange, value } }) => (
                      <SegmentedButtons
                        value={value || 'digital'}
                        onValueChange={onChange}
                        buttons={[
                          {
                            value: 'digital',
                            label: 'Digital',
                            icon: 'numeric',
                            checkedColor: theme.colors.primary,
                          },
                          {
                            value: 'reloj',
                            label: 'Reloj',
                            icon: 'clock-outline',
                            checkedColor: theme.colors.primary,
                          },
                        ]}
                      />
                    )}
                  />
                </View>

                <ListItemComponent
                  titleStyle={{ color: theme.colors.primary }}
                  title="DETALLE DE DEVOLUCIÓN"
                  description="Porfavor ingresa los detalles, comentarios u observaciones sobre la baja."
                  descriptionNumberOfLines={0}
                />
                <InputFormHook
                  label="Detalle / Comentario"
                  control={control}
                  name="detalle"
                  errors={errors}
                  disabled={loadingFormDevolucion}
                  multiline={true}
                  numberOfLines={4}
                  maxLength={1000}
                />

                <ButtonForm
                  className="mb-5 mt-3"
                  label="Guardar"
                  icon="content-save"
                  buttonColor={theme.colors.error}
                  onPress={handleSubmit(onSubmitFormSaveDevolucion)}
                  disabled={!isValid || loadingFormDevolucion}
                  loading={loadingFormDevolucion}
                />
              </View>
            </FormAdaptiveKeyBoard>
          </View>
        </ScrollViewContainer>
      </PageLayout>
    </>
  );
}

const stylesDevolucionCreate = StyleSheet.create({
  screenLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
});
