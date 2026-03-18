import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Chip, Divider, useTheme, IconButton } from 'react-native-paper';
import { BoletaType, TipoPeriodoEnum } from 'types/BoletaType';
import { AppTheme } from 'types/ThemeTypes';
import ButtonForm from 'components/form/ButtonForm';
import { formatCurrency } from 'helpers/currency/currencyHelper';
import { getMonthFromPeriod } from 'helpers/periods/periodHelper';
import { getStatusColor, getStatusTextColor, getStatusText } from 'helpers/theme/themeHelper';
import { formatString } from './BoletaHelper';

interface BoletaCardProps {
  boleta: BoletaType;
  onVerBoleta: (boleta: BoletaType) => void;
  onVerDetalle?: (boleta: BoletaType) => void;
}

export default function BoletaCard({ boleta, onVerBoleta, onVerDetalle }: BoletaCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Card
      className="mb-4 w-full"
      style={{ backgroundColor: theme.colors.surface, paddingVertical: 10 }}>
      <Card.Content>
        {/* Mes y Total */}
        <View className="mb-4 flex-row items-center justify-between" style={{ padding: 5 }}>
          <View>
            <Text style={{ color: theme.colors.onSurface, fontSize: 24, fontWeight: 'bold' }}>
              {boleta.periodo.nombre}
            </Text>
            {/* <Text style={{ color: theme.colors.onSurface, fontSize: 18 }}>
                            Total: {formatCurrency(boleta.liquido || 0)}
                        </Text> */}
            <Chip
              mode="flat"
              textStyle={{
                color: getStatusTextColor(theme, boleta.firma?.valido || false),
                fontSize: 12,
              }}
              style={{
                backgroundColor: getStatusColor(theme, boleta.firma?.valido || false),
                marginTop: 4,
                alignSelf: 'flex-start',
              }}>
              {getStatusText(boleta.firma?.valido || false)}
            </Chip>
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Detalles de cobros */}
        <View className="mt-4">
          <View className="mb-3 flex-row items-center">
            <IconButton
              icon="receipt"
              iconColor={theme.colors.primary}
              size={18}
              style={{ margin: 0 }}
            />
            <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
              Detalle de ingresos y descuentos:
            </Text>
          </View>

          {/* Ingresos */}
          <View
            className="flex-row items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: theme.colors.surfaceVariant }}>
            <View>
              <Text style={{ color: theme.colors.onPrimaryContainer, fontWeight: '600' }}>
                Salario Ordinario
                {/* { TipoPeriodoEnum.QUINCENA == boleta.tipo ? `Salario Ordinario` : `Anticipo`}  */}
              </Text>
              <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 13 }}>
                {formatCurrency(boleta.ingresos?.salarioOrdinario || 0)}
              </Text>
              {boleta.ingresos?.bonificacion > 0 && (
                <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 13 }}>
                  Bonificación: {formatCurrency(boleta.ingresos.bonificacion)}
                </Text>
              )}
            </View>
            <View className="items-center">
              <IconButton
                icon="cash"
                iconColor={theme.colors.onPrimary}
                containerColor={theme.colors.primary}
                size={20}
              />
            </View>
          </View>

          {/* Descuentos si existen */}
          {boleta.descuentos?.totalDescuentos > 0 && (
            <View className="mt-3">
              <View className="mb-2 flex-row items-center">
                <IconButton
                  icon="credit-card-minus"
                  iconColor={theme.colors.success}
                  size={16}
                  style={{ margin: 0 }}
                />
                <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>Descuentos</Text>
              </View>
              {Object.entries(boleta.descuentos).map(([key, value]) => (
                <React.Fragment key={key}>
                  {(value && key !== 'totalDescuentos') > 0 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{ color: theme.colors.onSurfaceVariant, flex: 1, flexShrink: 1 }}>
                        {formatString(key)}
                      </Text>
                      <Text style={{ color: theme.colors.success, marginLeft: 8 }}>
                        -{formatCurrency(value)}
                      </Text>
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Total */}
          <Divider style={{ backgroundColor: theme.colors.outlineVariant, marginVertical: 12 }} />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: 'bold',
                fontSize: 18,
                flex: 1,
                flexShrink: 1,
              }}>
              Total líquido:
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: 'bold',
                fontSize: 18,
                marginLeft: 8,
              }}>
              {formatCurrency(boleta.liquido || 0)}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="mt-4 flex-row justify-between">
          <View className="flex-1">
            <ButtonForm
              label="VER BOLETA"
              icon="file-document-outline"
              onPress={() => onVerBoleta(boleta)}
              buttonColor={theme.colors.primary}
            />
          </View>
        </View>

        {/* Indicador de próximo vencimiento */}
        <View className="mt-4 flex-row items-center justify-center">
          <IconButton
            icon="alert-circle"
            iconColor={theme.colors.onErrorContainer}
            size={16}
            style={{ margin: 0 }}
          />
          <Text style={{ color: theme.colors.onErrorContainer }} className="ml-1 text-sm">
            Ingresa para ver el documento completo
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
