import { PermissionMenuType } from "pages/dashboard/Home";
import routers from "helpers/navigator/routers";
import { groupByField } from "./globalHelper";

export function orderRoutersMenu(resultPermisos:PermissionMenuType[]) {
  let arrayRouter:any = []
  resultPermisos?.forEach(el => {
      const router = routers.filter(routerFilter => !routerFilter.hidden).find(route => route.name === el.name_route)
      const routerData = router ? { ...router, name_category: el.name_category } : null
      routerData && arrayRouter.push(routerData)
  })

  // Inyectar manualmente 'HistorialPublicaciones' bajo 'Módulos' si está disponible en routers
  const historialRouter = routers.find(r => r.name === 'HistorialPublicaciones');
  if (historialRouter) {
      arrayRouter.push({ ...historialRouter, name_category: 'Módulos' });
  }

  const dataGroupedRouter = groupByField(arrayRouter, 'name_category')
  return dataGroupedRouter
}