import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Modal, Portal, Card, Divider, Button, IconButton, useTheme } from 'react-native-paper';
import { BoletaType, TipoPeriodoEnum } from 'types/BoletaType';
import { AppTheme } from 'types/ThemeTypes';
import ButtonForm from 'components/form/ButtonForm';
import { formatCurrency } from 'helpers/currency/currencyHelper';
import { formatDateGT } from 'helpers/periods/periodHelper';
import { getStatusText } from 'helpers/theme/themeHelper';
import { descargarBoletaPDF, descargarBoletaPDFBono14AndAguinaldo, descargarBoletaVacacion } from 'helpers/pdf/pdfHelper';
import alertsState from 'helpers/states/alertsState';
import { BOLETA_MESSAGES } from 'constants/boletaConstants';
import CardContent from 'components/Cards/CardContent';
import { formatString } from './BoletaHelper';
import ModalPortal from 'components/Modals/ModalPortal';

interface BoletaDetailModalProps {
    visible: boolean;
    boleta: BoletaType | null;
    onDismiss: () => void;
}

export default function BoletaDetailModal({ visible, boleta, onDismiss }: BoletaDetailModalProps) {

    const theme = useTheme() as AppTheme;
    const { openVisibleSnackBar } = alertsState();
    const [isDownloading, setIsDownloading] = useState(false);

    // console.log(boleta)

    const handleDescargarPDF = async () => {
        if (!boleta?.periodo?.id || !boleta?.empleado?.codigo) {
            openVisibleSnackBar(BOLETA_MESSAGES.ERROR.FALTAN_DATOS_PDF, 'error');
            return;
        }

        setIsDownloading(true);
        openVisibleSnackBar(BOLETA_MESSAGES.WARNING.DESCARGANDO_PDF, 'warning');

        try {
            let success = false

            if(TipoPeriodoEnum.QUINCENA == boleta.tipo)
                success = await descargarBoletaPDF(boleta.periodo.id, boleta.empleado.codigo);
            
            if(TipoPeriodoEnum.BONO14 == boleta.tipo || TipoPeriodoEnum.AGUINALDO == boleta.tipo)
                success = await descargarBoletaPDFBono14AndAguinaldo(boleta.periodo.fechaFin, boleta.empleado.codigo, boleta.tipo)

            if(TipoPeriodoEnum.VACACION == boleta.tipo)
                success = await descargarBoletaVacacion(boleta.empleado.codigo, boleta.numeroBoleta)

            if (success) {
                openVisibleSnackBar(BOLETA_MESSAGES.SUCCESS.PDF_DESCARGADO, 'success');
            } else {
                openVisibleSnackBar(BOLETA_MESSAGES.ERROR.ERROR_DESCARGAR_PDF, 'error');
            }
        } catch (error) {
            openVisibleSnackBar(BOLETA_MESSAGES.ERROR.ERROR_DESCARGAR_PDF, 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    if (!boleta) return null;

    return (
            <ModalPortal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={{ maxHeight: '90%', height: '80%' }}
                header={
                    <View className="flex-row justify-between items-center">
                        <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 'bold' }}>
                            Detalle de Boleta
                        </Text>
                        <IconButton
                            size={20}
                            icon="close"
                            iconColor={theme.colors.onSurface}
                            onPress={onDismiss}
                            style={{ margin: 0 }}
                        />
                    </View>
                }
                footer={
                    <View className="flex-row gap-3">
                        {/* Botones de acción */}
                        <View className="flex-1">
                            <ButtonForm
                                label="Descargar PDF"
                                icon="download"
                                buttonColor={theme.colors.primary}
                                onPress={handleDescargarPDF}
                                loading={isDownloading}
                                disabled={isDownloading}
                            />
                        </View>
                    </View>
                }
            >
                <View className="my-4" style={{ maxHeight: '100%' }}>

                    {/* <ScrollView showsVerticalScrollIndicator={false}> */}
                        {/* Información general */}
                        <CardContent className='mb-4' classNameCardContent='p-4' style={{ backgroundColor: theme.colors.surfaceVariant }}>
                            <View className="flex-row items-center mb-3">
                                <IconButton
                                    icon="file-document-outline"
                                    iconColor={theme.colors.primary}
                                    size={20}
                                    style={{ margin: 0 }}
                                />
                                <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '600' }}>
                                    Información General
                                </Text>
                            </View>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text style={{ color: theme.colors.onSurfaceVariant }}>Número de Boleta:</Text>
                                    <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>{boleta.numeroBoleta || 'N/A'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text style={{ color: theme.colors.onSurfaceVariant }}>Período:</Text>
                                    <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                                        {boleta.periodo.rango || 'N/A'}
                                    </Text>
                                </View>
                                {boleta.diasTrabajados > 0 && (
                                    <View className="flex-row justify-between">
                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Días Trabajados:</Text>
                                        <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>{boleta.diasTrabajados || 0}</Text>
                                    </View>
                                )}
                                <View className="flex-row justify-between">
                                    <Text style={{ color: theme.colors.onSurfaceVariant }}>Estado:</Text>
                                    <Text style={{
                                        fontWeight: '500',
                                        color: boleta.firma?.valido ? theme.colors.success : theme.colors.error
                                    }}>
                                        {boleta.firma?.valido ? getStatusText(true) : 'NO FIRMADA'}
                                    </Text>
                                </View>
                                {boleta.firma?.valido && boleta.firma.fechaFirma && (
                                    <>
                                        <View className="flex-row justify-between">
                                            <Text style={{ color: theme.colors.onSurfaceVariant }}>Fecha de Firma:</Text>
                                            <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                                                {formatDateGT(boleta.firma.fechaFirma)}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </CardContent>

                        {/* Ingresos */}
                        {boleta.ingresos.totalIngresos > 0 && (
                            <CardContent className='mb-4' classNameCardContent='p-4' style={{ backgroundColor: theme.colors.surfaceVariant }}>
                                <View className="flex-row items-center mb-3">
                                    <IconButton
                                        icon="cash-plus"
                                        iconColor={theme.colors.success}
                                        size={20}
                                        style={{ margin: 0 }}
                                    />
                                    <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '600' }}>
                                        Ingresos
                                    </Text>
                                </View>
                                <View className="space-y-2">
                                    {
                                        Object.entries(boleta.ingresos).map(([key, value]) => (
                                            <React.Fragment key={key}>
                                                {(value > 0 && key !== 'totalIngresos') && (
                                                    <View className="flex-row justify-between">
                                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>{ formatString(key) }:</Text>
                                                        <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                                                            {formatCurrency(value)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </React.Fragment>
                                        ))
                                    }
                                    <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 8 }} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold', flex: 1, flexShrink: 1 }}>Total Ingresos:</Text>
                                        <Text style={{ color: theme.colors.success, fontWeight: 'bold', marginLeft: 8 }}>
                                            {formatCurrency(boleta.ingresos?.totalIngresos || 0)}
                                        </Text>
                                    </View>
                                </View>
                            </CardContent>
                        )}

                        {/* Descuentos */}
                        {boleta.descuentos?.totalDescuentos > 0 && (
                            <CardContent className='mb-4' classNameCardContent='p-4' style={{ backgroundColor: theme.colors.surfaceVariant }}>
                                <View className="flex-row items-center mb-3">
                                    <IconButton
                                        icon="credit-card-minus"
                                        iconColor={theme.colors.error}
                                        size={20}
                                        style={{ margin: 0 }}
                                    />
                                    <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '600' }}>
                                        Descuentos
                                    </Text>
                                </View>
                                <View className="space-y-2">
                                    {
                                        Object.entries(boleta.descuentos).map(([key, value]) => (
                                            <React.Fragment key={key}>
                                                {
                                                    (value && key !== 'totalDescuentos') > 0 && (
                                                        <View className="flex-row justify-between">
                                                            <Text style={{ color: theme.colors.onSurfaceVariant }}>{ formatString(key) }:</Text>
                                                            <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                                                                -{formatCurrency(value)}
                                                            </Text>
                                                        </View>
                                                    )
                                                }
                                            </React.Fragment>
                                        ))
                                    }
                                    <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 8 }} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold', flex: 1, flexShrink: 1 }}>Total Descuentos:</Text>
                                        <Text style={{ color: theme.colors.error, fontWeight: 'bold', marginLeft: 8 }}>
                                            -{formatCurrency(boleta.descuentos.totalDescuentos)}
                                        </Text>
                                    </View>
                                </View>
                            </CardContent>
                        )}

                        {/* Resumen total */}
                        <Card style={{ backgroundColor: theme.colors.surfaceVariant }}>
                            <Card.Content className="p-4">
                                <View className="flex-row items-center mb-3">
                                    <IconButton
                                        icon="chart-line"
                                        iconColor={theme.colors.primary}
                                        size={20}
                                        style={{ margin: 0 }}
                                    />
                                    <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: '600' }}>
                                        Resumen
                                    </Text>
                                </View>

                                <View className="space-y-2">
                                    <View className="flex-row justify-between">
                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Total Ingresos:</Text>
                                        <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                                            {formatCurrency(boleta.ingresos?.totalIngresos || 0)}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Total Descuentos:</Text>
                                        <Text style={{ color: theme.colors.error, fontWeight: '500' }}>
                                            -{formatCurrency(boleta.descuentos?.totalDescuentos || 0)}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal Neto:</Text>
                                        <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                                            {formatCurrency(boleta.neto || 0)}
                                        </Text>
                                    </View>

                                    <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 8 }} />

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: 'bold', flex: 1, flexShrink: 1 }}>Total Líquido:</Text>
                                        <Text style={{ color: theme.colors.onSurface, fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                                            {formatCurrency(boleta.liquido || 0)}
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    {/* </ScrollView> */}

                </View>
            </ModalPortal>
    );
}