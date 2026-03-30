import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Title from 'components/typografy/Title';
import TextInfo from 'components/typografy/TextInfo';
import InputFormHook from 'components/form/InputFormHook';
import ButtonForm from 'components/form/ButtonForm';
import FormAdaptiveKeyBoard from 'components/container/FormAdaptiveKeyBoard';
import { AJAX, URLPIOAPP } from 'helpers/http/ajax';
import alertsState from 'helpers/states/alertsState';
import { NavigationService } from 'helpers/navigator/navigationScreens';
import { RouteProp, useRoute } from '@react-navigation/native';
import BoxImage from 'components/container/BoxImage';
import { LOGOPINULITOORIGINAL } from 'assets/Providers/ImageProvider';
import SurfaceTapButton from 'components/container/SurfaceTapButton';

const schema = yup.object().shape({
  newPassword: yup.string()
    .required('Nueva contraseña es requerida')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/, 'Debe tener más de 5 caracteres, incluir números y letras'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerido'),
});

type FirstTimePasswordParams = {
  codigo: string;
};

export default function FirstTimePassword() {
  const [loading, setLoading] = useState(false);
  const { openVisibleSnackBar } = alertsState();
  const route = useRoute<RouteProp<{ params: FirstTimePasswordParams }, 'params'>>();
  const [codigo] = useState(route.params?.codigo || '');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const onSubmit = async (data: any) => {
    if (!codigo) {
        openVisibleSnackBar('Error: No se recibió el código de empleado.', 'error');
        return;
    }
    setLoading(true);
    try {
      const response: any = await AJAX(`${URLPIOAPP}/auth/change-first-password`, 'POST', {
        codigo,
        newPassword: data.newPassword,
      });
      if (response.status) {
        openVisibleSnackBar('Contraseña actualizada correctamente. Por favor, inicia sesión.', 'success');
        NavigationService.reset('Login');
      } else {
        openVisibleSnackBar(response.message || 'Error al actualizar contraseña.', 'error');
      }
    } catch (error: any) {
      openVisibleSnackBar(`${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormAdaptiveKeyBoard>
      <View className='flex-1 items-center justify-center px-8'>
        <BoxImage width={70} height={80} img={LOGOPINULITOORIGINAL}/>
        
        <View className='flex flex-col justify-center items-center gap-1 mt-10'>
          <Title style={{ textAlign: 'center' }}>Cambio de Contraseña</Title>
          <TextInfo style={{ textAlign: 'center' }}>
            Por seguridad, debes cambiar tu contraseña inicial para continuar.
          </TextInfo>
        </View>

        <View className='w-full flex flex-column mt-10 gap-3.5'>
          <InputFormHook 
            disabled={loading}
            name='newPassword' 
            control={control} 
            label='Nueva Contraseña' 
            placeholder='Ingresa tu nueva contraseña'
            isPassword={true}
            errors={errors}
          />

          <InputFormHook 
            disabled={loading}
            name='confirmPassword' 
            control={control} 
            label='Confirmar Contraseña' 
            placeholder='Vuelve a ingresar tu contraseña'
            isPassword={true}
            errors={errors}
          />
        </View>

        <View className='w-full mt-8'>
          <ButtonForm 
            disabled={loading}
            loading={loading}
            onPress={handleSubmit(onSubmit)} 
            label='Guardar y Continuar'
          />
        </View>

        <View className='w-full mt-5 flex-row justify-center items-center'>
          <SurfaceTapButton 
            title='Volver al Login'
            onPress={() => NavigationService.reset('Login')}
            disabled={loading}
            icon='arrow-left'
          />
        </View>
      </View>
    </FormAdaptiveKeyBoard>
  );
}
