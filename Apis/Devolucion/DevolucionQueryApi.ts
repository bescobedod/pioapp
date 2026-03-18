import { AJAX, URLPIOAPP } from 'helpers/http/ajax';
import { generateJsonError, ResponseService } from 'types/RequestType';

export const getDevolucionesByUserApi = async (): Promise<ResponseService<any[]>> => {
  try {
    const result = await AJAX(`${URLPIOAPP}/devoluciones/user`, 'GET');
    return result;
  } catch (error: any) {
    return generateJsonError(`${error}`, 'array');
  }
};

export const getDevolucionDetalleByIdApi = async (
  idDevolucion: number
): Promise<ResponseService<any>> => {
  try {
    const result = await AJAX(`${URLPIOAPP}/devoluciones/${idDevolucion}`, 'GET');
    return result;
  } catch (error: any) {
    return generateJsonError(`${error}`, 'object');
  }
};
