import ButtonForm from 'components/form/ButtonForm';
import InputFormHook from 'components/form/InputFormHook';
import TextInfo from 'components/typografy/TextInfo';
import Title from 'components/typografy/Title';
import { View } from 'react-native';
import BoxImage from 'components/container/BoxImage';
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import schemaLoginFormValidate, { schemaLoginFormValidateType } from 'helpers/validatesForm/schemaLoginFormValidate';
import { NavigationService } from 'helpers/navigator/navigationScreens'; 
import FormAdaptiveKeyBoard from 'components/container/FormAdaptiveKeyBoard';
import { AJAX, URLPIOAPP } from 'helpers/http/ajax';
import { ResponseService, generateJsonError } from 'types/RequestType';
import { useEffect, useState } from 'react';
import alertsState from 'helpers/states/alertsState';
import { getValueStorage, setValueStorage } from 'helpers/store/storeApp';
import CheckBoxForm from 'components/form/CheckBoxForm';
import SurfaceTapButton from 'components/container/SurfaceTapButton';
import { isDeviceReal, uniqueIdDevice } from 'helpers/Device/DeviceHelper';
import { generateTokenNotificationPush, getNotificationPermission, notificationPermissionGranted } from 'helpers/Notification/NotificationPushHelper';
import { LOGOPINULITOORIGINAL } from 'assets/Providers/ImageProvider';
import { authenticateBiometric, checkBiometricStatus } from 'helpers/Biometric/BiometricHelper';
import { BiometricStatus } from 'types/Biometric/BiometricTypes';
import globalState from 'helpers/states/globalState';
import BiometricStorageType from 'types/Biometric/BiometricStorageType';
import { UserSessionType } from 'types/auth/UserSessionType';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMicrosoftAuth } from 'helpers/auth/MicrosoftAuthHelper';

type DataFcmType = {
  idDevice: string|null;
  exponentPushToken: string|null;
}

type ParamsRouteLogin = {
  biometricAutomatic?: boolean;
}

export default function Login() {

  // const [idDevice, setIdDevice] = useState<string|null>(null)
  // const [exponentPushToken, setExponentPushToken] = useState<string|null>(null);
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>();
  const { openVisibleSnackBar } = alertsState()
  const [ loadingLogin, setLoadingLogin ] = useState<boolean>(false)
  const { setOpenScreenLoading, setCloseScreenLoading } = globalState()
  const route = useRoute<RouteProp<{ params:ParamsRouteLogin }, 'params'>>();
  const biometricAutomatic:boolean = route.params?.biometricAutomatic ?? true;
  
  // Microsoft Auth Hook
  const { request: msRequest, response: msResponse, promptAsync: msPromptAsync, getMicrosoftUserInfo } = useMicrosoftAuth();

  const validLogin = async(data: schemaLoginFormValidateType, idDevice:string|null, exponentPushToken:string|null) : Promise<ResponseService> => {
    try {
      const result:ResponseService = await AJAX(`${ URLPIOAPP }/auth/login`, 'POST', {
        ...data,
        ...(idDevice && exponentPushToken ? { 
          id_unique_device: idDevice,
          exponent_push_token: exponentPushToken
        } : {})
      })
      return result
    } catch (error:any) {
      openVisibleSnackBar(`${ error }`, 'error')
      return generateJsonError(error)
    }
  }

  const postLoginBiometric = async (user:number, idDevice:string|null, exponentPushToken:string|null) : Promise<ResponseService<UserSessionType>> => {
    try {
      const result = await AJAX(
        `${URLPIOAPP}/auth/biometric`,
        'POST',
        { 
          user,
          ...(idDevice && exponentPushToken ? { 
            id_unique_device: idDevice,
            exponent_push_token: exponentPushToken
          } : {})
        },
        false,
        false,
        null,
        'basic'
      )
      return result
    } catch (error) {
      openVisibleSnackBar(`${error}`, 'error')
      return generateJsonError(`${error}`, 'object')
    }
  }

  const { control, handleSubmit, formState: { errors }, resetField } = useForm({
    resolver: yupResolver(schemaLoginFormValidate),
    mode: 'all'
  })

  const submitFormLogin = async(data: schemaLoginFormValidateType) => {
    setLoadingLogin(true)
    const dataFcm = await generateTokenFCM()
    const login = await validLogin(
      data, 
      dataFcm.idDevice, 
      dataFcm.exponentPushToken
    )
    setLoadingLogin(false)
    if (login.status) {
      if (login.data?.is_temporal_password) {
        NavigationService.reset('FirstTimePassword', { codigo: login.data.codigoEmpleado })
      } else if (login.data?.baja) {
        NavigationService.reset('UserDeactivated')
      } else {
        NavigationService.reset('Home')
        setValueStorage('user', login.data)
        if(data.recordar_btn) setValueStorage('credentialsLogin', { user: data.codigo })
      }
    }
  }

  const onChangeCheckBoxRemember = (value:boolean) => {
    setValueStorage('rememberCredentials', { value })
  }

  const validRememberCredentials = () => {
    const valueStore = getValueStorage('rememberCredentials')
    const value = valueStore?.value || false
    resetField('recordar_btn', { defaultValue: value })
    if(!value) return
    const valueStoreUser = getValueStorage('credentialsLogin')
    const user = valueStoreUser?.user || ''
    resetField('codigo', { defaultValue: user }) 
  }

  //token de dispositivo para notificaciones push
  const generateTokenFCM = async () : Promise<DataFcmType> => {
    try {
      //validar si el dispositivo es fisico y no es un emulador
      const isDevice:boolean = isDeviceReal()
      if(!isDevice) {
        openVisibleSnackBar(`Ooops no se puede recibir notificacion porque estas en un emulador.`, 'warning')
        return { exponentPushToken: null, idDevice: null }
      }
      //validar permisos para las notificaciones
      const resultNotification = await getNotificationPermission()
      if(resultNotification !== 'granted') return { exponentPushToken: null, idDevice: null }
      //generar token de notificaciones push
      const tokenPushNotification = await generateTokenNotificationPush()
      //obtener el id unico de dispositivo
      const idUniqueDispositivo = await uniqueIdDevice()
      //debug
      // console.log(tokenPushNotification)
      // console.log(idUniqueDispositivo)
      //setear estados
      return { exponentPushToken: tokenPushNotification, idDevice: idUniqueDispositivo }
      // setIdDevice(idUniqueDispositivo)
      // setExponentPushToken(tokenPushNotification)
    } catch (error) {
      openVisibleSnackBar(`${error}`, 'error') 
      return { exponentPushToken: null, idDevice: null }
    }
  } 

  //datos biometricos
  const validBiometricEnable = async () => {
    const status = await checkBiometricStatus()
    setBiometricStatus(status)
  }

  //biometric auth
  const getConfigBiometric = () : BiometricStorageType|null => {
    const biometric = getValueStorage('biometrico') as BiometricStorageType
    return biometric
  }

  //auth by biometric
  const AUTHBIOMETRIC = async () : Promise<boolean> => {
    const resultBiometricAuth = await authenticateBiometric()
    return resultBiometricAuth.success
  }

  //inicio session login Biometrico
  const loginBiometric = async(type:'button'|'automatic') => {
    const resultConfigBiometrico = getConfigBiometric()
    if(!resultConfigBiometrico) {
      if(type === 'button') openVisibleSnackBar(`Porfavor configura el biometrico en tu cuenta primero.`, 'warning')
      return
    }
    setOpenScreenLoading()
    const authBio = await AUTHBIOMETRIC()
    if(authBio) {
      const dataFcm = await generateTokenFCM()
      const login = await postLoginBiometric(
        Number(resultConfigBiometrico?.id_users ?? '0'), 
        dataFcm.idDevice, 
        dataFcm.exponentPushToken
      )
      if (login.status) {
        if (login.data?.baja) {
          NavigationService.reset('UserDeactivated')
        } else {
          NavigationService.reset('Home')
          setValueStorage('user', login.data)
        }
      }
    }
    setCloseScreenLoading()
  }

  //validar si tiene configurada la huella entonces mostrarla
  const biometricFocusLogin = async () => {
    const config = getConfigBiometric()
    if(!config || !biometricStatus?.enrolled || !biometricStatus.hasHardware || !biometricAutomatic) return
    await loginBiometric('automatic')
  }

  const init = async () => {
    setLoadingLogin(true)
    //vaidar si el dispositivo tiene huella disponible
    await validBiometricEnable()
    validRememberCredentials()
    setLoadingLogin(false)
    //Despues cargar todo pedir permisos para notificaciones
    //pedir permisos para enviar notificaciones
    await notificationPermissionGranted()
  }

  useEffect(() => {
    biometricFocusLogin()
  }, [biometricStatus])

  useEffect(()=> {
    init()
  }, [])

  // ======= MICROSOFT LOGIN EFFECT ======= //
  useEffect(() => {
    if (msResponse?.type === 'success') {
      const { authentication } = msResponse;
      if (authentication?.accessToken) {
        handleMicrosoftLogin(authentication.accessToken);
      }
    } else if (msResponse?.type === 'error') {
      openVisibleSnackBar('Error en autenticación con Microsoft', 'error');
    }
  }, [msResponse]);

  const handleMicrosoftLogin = async (accessToken: string) => {
    setLoadingLogin(true);
    setOpenScreenLoading();
    try {
      // Pedir información básica a Graph API para obtener el ID real
      const msUser = await getMicrosoftUserInfo(accessToken);
      if (!msUser || !msUser.id) {
        throw new Error("No se pudo obtener el perfil de Microsoft");
      }

      const dataFcm = await generateTokenFCM();
      
      const payload = {
        ms_account_id: msUser.id,
        raw_data: msUser,
        id_unique_device: dataFcm.idDevice,
        exponent_push_token: dataFcm.exponentPushToken
      };

      const result = await AJAX(`${URLPIOAPP}/auth/microsoft/login`, 'POST', payload, false, false, null, 'basic');

      if (result.status) {
        if (result.data?.baja) {
          NavigationService.reset('UserDeactivated');
        } else {
          NavigationService.reset('Home');
          setValueStorage('user', result.data);
          openVisibleSnackBar('¡Bienvenido!', 'success');
        }
      } else {
        openVisibleSnackBar(result.message || 'Error en login de Microsoft', 'error');
      }

    } catch (error: any) {
      openVisibleSnackBar(error.message || 'Error al procesar login de Microsoft', 'error');
    } finally {
      setLoadingLogin(false);
      setCloseScreenLoading();
    }
  };

  return (
    <FormAdaptiveKeyBoard>
      <View className='flex-1 items-center justify-center px-8'>
        <BoxImage width={70} height={80} img={LOGOPINULITOORIGINAL}/>
        
        <View className='flex flex-col justify-center items-center gap-1 mt-10'>
          <Title>Login</Title>
          <TextInfo>Ingresa tus credenciales</TextInfo>
        </View>
    
        <View className='w-full flex flex-column mt-10 gap-3.5'>
    
          <InputFormHook 
            disabled={loadingLogin}
            name='codigo' 
            control={control} 
            label='Codigo Empleado' 
            placeholder='Ingrese un codigo'
            errors={errors}
          />
  
          <InputFormHook 
            disabled={loadingLogin}
            name='password' 
            control={control} 
            label='Contraseña' 
            placeholder='Ingrese su contraseña' 
            isPassword={true}
            errors={errors}
          />
  
        </View>

        <View className='flex flex-row justify-center items-center mt-3'>
          <CheckBoxForm 
            control={control} 
            name='recordar_btn'
            label='Recordarme'
            positionLabel='leading'
            disabled={loadingLogin}
            onChangeExtra={onChangeCheckBoxRemember}
          />
        </View>

        <View className='w-full mt-3'>
          <ButtonForm 
            disabled={loadingLogin}
            loading={loadingLogin}
            onPress={handleSubmit(submitFormLogin)} 
            label='Ingresar'/>
        </View>

        <View className='w-full mt-3 flex-row justify-center items-center'>
          <SurfaceTapButton 
            title='¿Olvidaste tu contraseña?'
            onPress={() => NavigationService.navigate('ForgotPassword')}
            disabled={loadingLogin}
            icon='lock-question'
          />
        </View>

        <View className='w-full mt-3 flex-row justify-center items-center flex-wrap' style={{ gap: 5 }}>
          <SurfaceTapButton 
            icon='fingerprint'
            title='Huella'
            onPress={() => loginBiometric('button')}
            visible={biometricStatus?.enrolled && biometricStatus?.hasHardware}
            disabled={loadingLogin}
          />
          <SurfaceTapButton 
            icon='microsoft'
            title='Office 365'
            onPress={() => {
                if(msRequest) msPromptAsync();
                else openVisibleSnackBar("Espere a que cargue la configuración de Microsoft", "normal");
            }}
            disabled={loadingLogin || !msRequest}
          />
        </View>

      </View>
    </FormAdaptiveKeyBoard>
  );
}