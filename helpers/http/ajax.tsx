import { AuthorizationHeaders } from "constants/Authorization/AuthorizationConstant";
import { logout } from "helpers/authHelper/authHelper";
import { currentRouteName, NavigationService } from "helpers/navigator/navigationScreens";
import { validateConnectionInternetActive } from "helpers/network/internetHelper";
import { getValueStorage } from "helpers/store/storeApp";
import { UserSessionType } from "types/auth/UserSessionType";
import { AuthHedearsType } from "types/Request/AuthorizationTypes";
import MethodRequestType from "types/Request/MethodRequestType";

export const URLDIVIDENDOS = `http://3.22.33.142/`
// export const URLDIVIDENDOS = `http://sistema.grupopinulito.com:81`

//export const URLPIOAPP = `http://192.168.0.153:5001/api`

//local pruva PORT
// export const URLPIOAPP = `http://10.0.2.2:5000/api`
// export const URLPIOAPP = `https://1n42gnjd-5001.use2.devtunnels.ms/api`

//Produccion
export const URLPIOAPP = `https://services.sistemaspinulito.com/pioapi`

//variables para authentication con basic auth
// export const BASIC_AUTH_USERNAME = process.env.EXPO_PUBLIC_BASIC_AUTH_USERNAME
// export const BASIC_AUTH_PASSWORD = process.env.EXPO_PUBLIC_BASIC_AUTH_PASSWORD
export const BASIC_AUTH_USERNAME = 'pioapp'
export const BASIC_AUTH_PASSWORD = 'Pioapp12200107!'

export const timeout = function(s:number)
{
    return new Promise(function(_, reject) {
        setTimeout(() => {
            reject(new Error(`Lo sentimos la consulta tardo ${s} segundos!, intente de nuevo.`));
        }, s * 1000);
    });
};

type OptionsAjaxType = {
    validarInternetConnection?:boolean;
}

const defaultOptionsAjax:Required<OptionsAjaxType> = {
    validarInternetConnection: true
}

export async function AJAX(
    url: string = '',
    method:MethodRequestType = 'GET',
    uploadData:any = null,
    formData = false,
    blob:boolean = false,
    headers:any = null,
    authorization:AuthHedearsType = 'bearer',
    timeout:number = 60,
    options:OptionsAjaxType = {}
) {
    //default options 
    const finalOptionsAjax = { ...defaultOptionsAjax, ...options }
    //timeout 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(); //CORTA la petición
    }, timeout * 1000);

    try {
        //validar intenert antes de comenzar el fetch
        const resultInternetActive = await validateConnectionInternetActive()

        if(!resultInternetActive && finalOptionsAjax.validarInternetConnection) {
            NavigationService.reset('InternetFail', { route: currentRouteName })
            throw new Error("Sin conexión a internet");
        }

        const user = getValueStorage('user') as UserSessionType
        // const user = { token: '' }

        const api_token = (user?.token ?? null) || ''

        let valueHeaderAuth = AuthorizationHeaders[authorization]({
            api_token: api_token,
            basic_username: BASIC_AUTH_USERNAME,
            basic_password: BASIC_AUTH_PASSWORD,
        })

        const fetchResponse = fetch(`${ url }`, {
            method,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                ...(blob === false && !formData && {
                    'Content-Type': 'application/json; charset=utf-8'
                }),
                // 'Cookie': 'PHPSESSID=jnps6kvd7kp5lf0h7j0b6anivg',
                // 'X-CSRF-TOKEN': `${csrf_token}`,
                // 'Authorization': `Bearer ${api_token}`,
                'Authorization': valueHeaderAuth,
                ...headers
            },
            ...(uploadData ? { body: formData ? uploadData : JSON.stringify(uploadData) } : {})
        })

        // const response:Response = await Promise.race([fetchResponse, timeout(30)]) as Response
        const response:Response = await fetchResponse as Response
        const data:object | any = blob ? await response.blob() : await response.json()

        if(response.status == 401 && authorization === 'bearer') logout()

        if(!response.ok) throw new Error(data?.message || 'Internal Server error response.')

        return data
        
    } catch (error:any) { 

        if (error.name === 'AbortError') 
            throw new Error(`Lo sentimos la consulta tardo ${timeout} segundos!, intente de nuevo.`);

        throw error

    } finally {
        //limpiar timeout para evitar fugas de memoria
        clearTimeout(timeoutId)
    }

}

export const FormDataGenerate = (data:object) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value])=> formData.append(
            `${key}`, 
            value
        )
    )
    return formData
}

export const ParamsDataGenerate = (params:object) => {
    const query = new URLSearchParams(
        Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
        ).toString()
    return query
}