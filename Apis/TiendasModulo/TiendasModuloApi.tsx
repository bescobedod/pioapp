import { AJAX, ParamsDataGenerate, URLPIOAPP } from "helpers/http/ajax";
import alertsState from "helpers/states/alertsState"
import { generateJsonError, ResponseService } from "types/RequestType"

export type ParamsTiendaByCodigoType = {
    codigo_empresa: string;
    codigo_tienda: string;
}

export type TiendaModuloType = {
    id_departamento: number;
    id_tienda: number;
    codigo_empresa: string;
    codigo_tienda: string;
    nombre_empresa: string;
    nombre_tienda: string;
    direccion_tienda: string;
    altitud: string; 
    latitud: string;   
    numero_establecimiento_sat: number;
    codigo_administrador: number;
    nombre_administrador: string;
    codigo_subadministrador: number;
    nombre_subadministrador: string;
    division: string;
    inactiva: boolean;
    nombre_lista_precio: string;
    listaPrecios: number;
    nombreComercial: string;
    nombre_menu: string;
    divisionNombre: string;
    celular: string;
    idSupervisor: number;
    administrador: string;
    afiliacionCredomatic: string;
    tipoMenu: number;
}

export const getTiendaByCodigo = async (params:ParamsTiendaByCodigoType, alertError:boolean = true) : Promise<ResponseService<TiendaModuloType>> => {
    try {
        const queryParams = ParamsDataGenerate(params)
        const result = await AJAX(`${URLPIOAPP}/tiendas/modulo?${queryParams}`)
        return result
    } catch (error) {
        alertError && alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return generateJsonError(`${error}`, 'array')
    }
}

export const getTiendas = async():Promise<ResponseService<any[]>> => {
    try {
        const result:ResponseService<any[]> = await AJAX(`${URLPIOAPP}/tiendas/modulo/all`)
        return result
    } catch (error) {
        alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return generateJsonError(`${error}`, "array")
    }
}

export const getAssignedTiendas = async():Promise<ResponseService<any[]>> => {
    try {
        const result:ResponseService<any[]> = await AJAX(`${URLPIOAPP}/tiendas/modulo/assigned`)
        return result
    } catch (error) {
        alertsState.getState().openVisibleSnackBar(`${error}`, 'error')
        return generateJsonError(`${error}`, "array")
    }
}