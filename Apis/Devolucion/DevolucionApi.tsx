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