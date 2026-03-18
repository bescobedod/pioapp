import { AJAX, FormDataGenerate, URLPIOAPP } from "helpers/http/ajax"
import alertsState from "helpers/states/alertsState"
import { generateJsonError, ResponseService } from "types/RequestType"

export const postCreateDevolucion = async(data:any):Promise<ResponseService<any>> => {
    try {
        const formData = FormDataGenerate(data)
        const result:ResponseService<any> = await AJAX(`${URLPIOAPP}/devoluciones/create`, "POST", formData, true)
        return result
    } catch (error) {
        alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return generateJsonError(error, 'object')
    }
}

export const postCreateDevolucionInsumo = async(data:any):Promise<ResponseService<any>> => {
    try {
        const formData = FormDataGenerate(data)
        const result:ResponseService<any> = await AJAX(`${URLPIOAPP}/devoluciones/create-insumos`, "POST", formData, true)
        return result
    } catch (error) {
        alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return generateJsonError(error, 'object')
    }
}

export type PurchaseDeliveryNote = {
    DocEntry: number;
    DocNum: number;
    CardCode: string;
    CardName: string;
    DocDate: string;
    U_TiendaExt: string;
    Comments: string | null;
    U_NDGFACE: string | null;
    DocumentLines: Array<{
        LineNum: number;
        ItemCode: string;
        ItemDescription: string;
        Quantity: number;
        MeasureUnit: string;
    }>;
};

export const getSAPRecepciones = async (
  body: { empresa: string; tienda: string, tipoReclamo?: 'pollos' | 'insumos' }
): Promise<ResponseService<PurchaseDeliveryNote[]>> => {
  try {
    const result: ResponseService<PurchaseDeliveryNote[]> = await AJAX(
      `${URLPIOAPP}/devoluciones/sap-recepciones`,
      'POST',
      body,
      false
    );
    return result;
  } catch (error) {
    alertsState.getState().openVisibleSnackBar(`${error}`, 'error');
    return generateJsonError(error, 'array');
  }
};

export type MotivoDevolucionType = {
  id_devolucion_motivo: number;
  motivo: string;
};

export const getMotivosDevolucion = async (
  tipo: 'pollos' | 'insumos'
): Promise<ResponseService<MotivoDevolucionType[]>> => {
  try {
    const result: ResponseService<MotivoDevolucionType[]> = await AJAX(
      `${URLPIOAPP}/devoluciones/motivos/${tipo}`,
      'GET',
      undefined,
      false
    );
    return result;
  } catch (error) {
    alertsState.getState().openVisibleSnackBar(`${error}`, 'error');
    return generateJsonError(error, 'array');
  }
};