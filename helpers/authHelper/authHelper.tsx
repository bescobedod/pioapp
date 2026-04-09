import { NavigationService } from "helpers/navigator/navigationScreens";
import { getValueStorage, setValueStorage } from "helpers/store/storeApp";
import { AJAX, URLPIOAPP } from "helpers/http/ajax";
import { uniqueIdDevice } from "helpers/Device/DeviceHelper";

export const logout = async (biometricAutomatic: boolean = true): Promise<void> => {
    try {
        const user = getValueStorage('user');
        const deviceId = await uniqueIdDevice();
        
        // Notificar al servidor antes de borrar los datos locales
        if (user && user.token) {
            // Intentamos notificar al servidor. 
            // Usamos un try/catch interno para que fallos de red no bloqueen el logout local.
            try {
                await AJAX(`${URLPIOAPP}/auth/logout`, 'POST', {
                    id_unique_device: deviceId || 'unknown'
                });
            } catch (err) {
                console.log('Error notify logout to server:', err);
            }
        }
    } catch (error) {
        console.log('Logout Process Error:', error);
    } finally {
        // Limpiamos siempre los datos locales
        setValueStorage('user', null);
        setTimeout(() => NavigationService.reset('Login', { biometricAutomatic }), 200);
    }
}