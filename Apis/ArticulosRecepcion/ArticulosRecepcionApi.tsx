import { AJAX, ParamsDataGenerate, URLDIVIDENDOS, URLPIOAPP } from 'helpers/http/ajax';
import alertsState from 'helpers/states/alertsState';
import { generateJsonError, ResponseService } from 'types/RequestType';

type ParamsRecepcionesValidDay = {
  empresa: string;
  tienda: string;
};

export type EntradaInventarioType = {
  idEntradaInventario: number;
  serie: string;
  numero: number;
  empresa: string;
  tienda: string;
  fecha: string;
  anulado: boolean;
  docEntry: number;
  docNum: number;
  title_resumen?: string;
};

export type DetalleEntradaInventario = {
  nombreProducto: string;
  quantity: number;
  cantidadReal: string;
  ItemCode: string;
  lienaEntradaMer: number;
};

export const getRecepcionesValidDay = async (
  params: ParamsRecepcionesValidDay
): Promise<ResponseService<EntradaInventarioType[]>> => {
  try {
    const queryParams = ParamsDataGenerate(params);
    const result = await AJAX(
      `${URLPIOAPP}/recepcion/articulos/list/recepciones/valid/day?${queryParams}`,
      'GET'
    );
    console.log(result);
    return result;
  } catch (error) {
    alertsState.getState().openVisibleSnackBar(`${error}`, 'error');
    return generateJsonError(`${error}`, 'array');
  }
};

type BodyArticulosRecepcionType = {
  codigoPOS: string;
  numero: number;
  serie: string;
};

export const getArticulosDevolucion = async (
  body: BodyArticulosRecepcionType
): Promise<DetalleEntradaInventario[]> => {
  console.log('body', body);
  try {
    const result = await AJAX(
      `${URLDIVIDENDOS}/dividendos/services/PINULITO_PDV/Inventario/getDevolucionEntradaInventarioDetalle`,
      'POST',
      {
        boleta: null,
        docEntry: null,
        fechas: '',
        ...body,
      }
    );
    return result;
  } catch (error) {
    alertsState.getState().openVisibleSnackBar(`${error}`, 'error');
    return [];
  }
};
