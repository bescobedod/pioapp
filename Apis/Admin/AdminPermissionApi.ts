import { AJAX, URLPIOAPP } from 'helpers/http/ajax';
import { generateJsonError, ResponseService } from 'types/RequestType';

export const getAdminRoles = async (): Promise<ResponseService<any[]>> => {
  try {
     return await AJAX(`${URLPIOAPP}/admin/roles`, 'GET');
  } catch (error: any) {
     return generateJsonError(`${error}`, 'array');
  }
};

export const getAdminMenus = async (): Promise<ResponseService<any[]>> => {
  try {
     return await AJAX(`${URLPIOAPP}/admin/menus`, 'GET');
  } catch (error: any) {
     return generateJsonError(`${error}`, 'array');
  }
};

export const getAdminPermissionsByRol = async (id_rol: number): Promise<ResponseService<any[]>> => {
  try {
     return await AJAX(`${URLPIOAPP}/admin/permissions/${id_rol}`, 'GET');
  } catch (error: any) {
     return generateJsonError(`${error}`, 'array');
  }
};

export const updateAdminPermissionsByRol = async (id_rol: number, menuIds: number[]): Promise<ResponseService<any>> => {
  try {
     return await AJAX(`${URLPIOAPP}/admin/permissions/${id_rol}`, 'PUT', { menuIds });
  } catch (error: any) {
     return generateJsonError(`${error}`, 'object');
  }
};
