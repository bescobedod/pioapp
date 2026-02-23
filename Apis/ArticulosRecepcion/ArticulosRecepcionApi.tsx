import { AJAX, ParamsDataGenerate, URLDIVIDENDOS, URLPIOAPP } from "helpers/http/ajax";
import alertsState from "helpers/states/alertsState";
import { generateJsonError, ResponseService } from "types/RequestType";

type ParamsRecepcionesValidDay = {
    empresa: string;
    tienda: string;
}

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

type BodyArticulosRecepcionType = {
    codigoPOS: string;
    numero: number;
    serie: string;
}

export type DetalleEntradaInventario = {
    nombreProducto: string;
    quantity: number;
    cantidadReal: string;
    ItemCode: string;
    lienaEntradaMer: number;
}

export const getRecepcionesValidDay = async(params:ParamsRecepcionesValidDay) : Promise<ResponseService<EntradaInventarioType[]>> => {
    try {
        const queryParams = ParamsDataGenerate(params)
        const result = await AJAX(`${URLPIOAPP}/recepcion/articulos/list/recepciones/valid/day?${queryParams}`, 'GET')
        return result
    } catch (error) {
        alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return generateJsonError(`${error}`, 'array')
    }
}

export const getArticulosDevolucion = async(body:BodyArticulosRecepcionType) : Promise<DetalleEntradaInventario[]> => {
    try {
        const result = await AJAX(`${URLDIVIDENDOS}/dividendos/services/PINULITO_PDV/Inventario/getDevolucionEntradaInventarioDetalle`, 'POST', {
            boleta: null,
            //empresa-tienda
            // codigoPOS: "00001-00047",
            docEntry: null,
            fechas: "",
            //idEntradaInventario
            // numero: 808776,
            // serie: "AG2"
            ...body
        })
        return result
    } catch (error) {
        alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return []
        // return generateJsonError(`${error}`, 'array')
    }
}