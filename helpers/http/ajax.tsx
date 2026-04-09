import { AuthorizationHeaders } from 'constants/Authorization/AuthorizationConstant';
import { logout } from 'helpers/authHelper/authHelper';
import { currentRouteName, NavigationService } from 'helpers/navigator/navigationScreens';
import { validateConnectionInternetActive } from 'helpers/network/internetHelper';
import { getValueStorage, setValueStorage } from 'helpers/store/storeApp';
import alertsState from 'helpers/states/alertsState';
import { UserSessionType } from 'types/auth/UserSessionType';
import { AuthHedearsType } from 'types/Request/AuthorizationTypes';
import MethodRequestType from 'types/Request/MethodRequestType';

export const URLDIVIDENDOS = process.env.EXPO_PUBLIC_DIVIDENDOS_URL;
// export const URLDIVIDENDOS = `http://3.22.33.142`

export const URLPIOAPP = process.env.EXPO_PUBLIC_API_URL;

//local pruva PORT
// export const URLPIOAPP = `http://10.0.2.2:5000/api`
// export const URLPIOAPP = `https://5ddd8gl6-5001.use2.devtunnels.ms/api`;

//Produccion
// export const URLPIOAPP = `https://services.sistemaspinulito.com/pioapi`

//variables para authentication con basic auth
export const BASIC_AUTH_USERNAME = process.env.EXPO_PUBLIC_BASIC_AUTH_USERNAME
export const BASIC_AUTH_PASSWORD = process.env.EXPO_PUBLIC_BASIC_AUTH_PASSWORD
// export const BASIC_AUTH_USERNAME = 'pioapp';
// export const BASIC_AUTH_PASSWORD = 'Pioapp12200107!';

export const timeout = function (s: number) {
  return new Promise(function (_, reject) {
    setTimeout(() => {
      reject(new Error(`Lo sentimos la consulta tardo ${s} segundos!, intente de nuevo.`));
    }, s * 1000);
  });
};

type OptionsAjaxType = {
  validarInternetConnection?: boolean;
};

const defaultOptionsAjax: Required<OptionsAjaxType> = {
  validarInternetConnection: true,
};

export async function AJAX(
  url: string = '',
  method: MethodRequestType = 'GET',
  uploadData: any = null,
  formData = false,
  blob: boolean = false,
  headers: any = null,
  authorization: AuthHedearsType = 'bearer',
  timeout: number = 60,
  options: OptionsAjaxType = {}
) {
  //default options
  const finalOptionsAjax = { ...defaultOptionsAjax, ...options };
  //timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(); //CORTA la petición
  }, timeout * 1000);

  try {
    //validar intenert antes de comenzar el fetch
    const resultInternetActive = await validateConnectionInternetActive();

    if (!resultInternetActive && finalOptionsAjax.validarInternetConnection) {
      NavigationService.reset('InternetFail', { route: currentRouteName });
      throw new Error('Sin conexión a internet');
    }

    const user = getValueStorage('user') as UserSessionType;
    // const user = { token: '' }

    const api_token = (user?.token ?? null) || '';

    let valueHeaderAuth = AuthorizationHeaders[authorization]({
      api_token: api_token,
      basic_username: BASIC_AUTH_USERNAME,
      basic_password: BASIC_AUTH_PASSWORD,
    });

    const fetchResponse = fetch(`${url}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(blob === false &&
          !formData && {
            'Content-Type': 'application/json; charset=utf-8',
          }),
        // 'Cookie': 'PHPSESSID=jnps6kvd7kp5lf0h7j0b6anivg',
        // 'X-CSRF-TOKEN': `${csrf_token}`,
        // 'Authorization': `Bearer ${api_token}`,
        Authorization: valueHeaderAuth,
        ...headers,
      },
      ...(uploadData ? { body: formData ? uploadData : JSON.stringify(uploadData) } : {}),
    });

    // const response:Response = await Promise.race([fetchResponse, timeout(30)]) as Response
    const response: Response = (await fetchResponse) as Response;
    const data: object | any = blob ? await response.blob() : await response.json();

    if (response.status == 401 && authorization === 'bearer') {
      // Evitar bucle infinito si la ruta de refresh o logout falla
      if (url.includes('/refresh-token') || url.includes('/auth/logout')) {
        if (!url.includes('/auth/logout')) {
           alertsState.getState().openVisibleSnackBar('Su sesión ha expirado, ingrese nuevamente.', 'error');
           logout();
        }
        await new Promise(() => {}); // Promesa infinita para congelar el hilo y evitar catches
        return null;
      }

      const refreshTokenValue = (user as any)?.refresh_token;

      if (!refreshTokenValue) {
        alertsState.getState().openVisibleSnackBar('Su sesión ha finalizado, debe ingresar nuevamente.', 'error');
        logout();
        await new Promise(() => {});
        return null;
      }

      try {
        // Ejecutamos la peticion de refresh transparente
        const refreshResp = await fetch(`${URLPIOAPP}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshTokenValue })
        });
        const refreshData = await refreshResp.json();

        if (refreshData.status && refreshData.data?.token) {
          // Token renovado! Guardamos
          const newUserData = { 
            ...user, 
            token: refreshData.data.token, 
            refresh_token: refreshData.data.refresh_token || refreshTokenValue,
            ...(refreshData.data.is_expired_password ? { is_expired_password: true } : {})
          };
          
          await setValueStorage('user', newUserData);

          // Reintentamos la peticion original con el nuevo token
          const newTokenValue = AuthorizationHeaders[authorization]({
            api_token: refreshData.data.token,
            basic_username: BASIC_AUTH_USERNAME,
            basic_password: BASIC_AUTH_PASSWORD,
          });

          const retryResponse = await fetch(`${url}`, {
            method,
            headers: {
              Accept: 'application/json',
              ...(blob === false && !formData && { 'Content-Type': 'application/json; charset=utf-8' }),
              Authorization: newTokenValue,
              ...headers,
            },
            ...(uploadData ? { body: formData ? uploadData : JSON.stringify(uploadData) } : {}),
          });

          const retryData = blob ? await retryResponse.blob() : await retryResponse.json();
          if (!retryResponse.ok) throw new Error(retryData?.message || 'Error del servidor en reintento.');
          return retryData;

        } else {
          // Si el refresh backendea validaciones (ej. contraseña expirada o baja) 
          if(refreshData.data?.baja) {
            alertsState.getState().openVisibleSnackBar('Tu sesión ha finalizado o la cuenta no está activa.', 'error');
            await setValueStorage('user', null);
            setTimeout(() => NavigationService.reset('Login'), 200);
            await new Promise(() => {});
            return null;
          }

          if(refreshData.data?.is_expired_password || refreshData.data?.is_temporal_password) {
            await setValueStorage('user', null);
            NavigationService.reset('FirstTimePassword', { codigo: refreshData.data.codigoEmpleado });
            await new Promise(() => {});
            return null;
          }

          // O si de plano ya expiró el token de 60 días
          alertsState.getState().openVisibleSnackBar('Tu sesión ha finalizado, ingresa nuevamente.', 'error');
          logout();
          await new Promise(() => {});
          return null;
        }

      } catch (err:any) {
        // En caso que el refresh tire network error o algo imprevisto
        alertsState.getState().openVisibleSnackBar('Sesión expirada o error de red, vuelve a ingresar.', 'error');
        logout();
        await new Promise(() => {});
        return null;
      }
    }

    if (!response.ok) throw new Error(data?.message || 'Internal Server error response.');

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError')
      throw new Error(`Lo sentimos la consulta tardo ${timeout} segundos!, intente de nuevo.`);

    throw error;
  } finally {
    //limpiar timeout para evitar fugas de memoria
    clearTimeout(timeoutId);
  }
}

export const FormDataGenerate = (data: object) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(`${key}`, value);
    }
  });
  return formData;
};

export const ParamsDataGenerate = (params: object) => {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return query;
};
