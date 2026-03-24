import { AJAX, URLPIOAPP } from "helpers/http/ajax"
import { generateJsonError, ResponseService } from "types/RequestType"

export const getConfigAppVersion = async (): Promise<ResponseService<any>> => {
    try {
        const result: ResponseService = await AJAX(`${URLPIOAPP}/config/version`, "GET", null, false, false, null, "bearer", 10, { validarInternetConnection: true })
        return result
    } catch (error) {
        return generateJsonError(`${error}`)
    }
}
