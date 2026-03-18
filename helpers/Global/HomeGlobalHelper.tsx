import { PermissionMenuType } from 'pages/Inicio';
import routers from 'helpers/navigator/routers';
import { groupByField } from './globalHelper';

// Mapa de íconos para los padres de submenús (los que vienen de la DB sin ruta local)
// La llave es el título que viene de la base de datos (case-insensitive match)
const PARENT_ICON_MAP: Record<string, string> = {
  'devoluciones':   'package-variant-closed',
  'publicaciones':  'newspaper-variant-outline',
  'convivio':       'party-popper',
  'rutas':          'map-marker-path',
  'recepcion':      'package-variant',
  'marcaje':        'gesture-tap-button',
};

function getParentIcon(title?: string): string {
  if (!title) return 'view-grid-outline';
  const key = title.toLowerCase().trim();
  return PARENT_ICON_MAP[key] || 'view-grid-outline';
}

export function orderRoutersMenu(resultPermisos: PermissionMenuType[]) {
  let arrayRouter: any = [];
  
  resultPermisos?.forEach((el) => {
    // Buscar el router local que coincida con name_route
    const router = routers
      .filter((routerFilter) => !routerFilter.hidden)
      .find((route) => route.name === el.name_route);
      
    // Si la DB mandó una opción que es "Contenedor Padre" (no tiene component en app) o si es una ruta válida
    // Agregamos metadata de la base de datos (id, parent_id, order) para poder armar el árbol en el Drawer
    if (router || !el.id_menu_parent) {
       const parentIcon = getParentIcon(el.title);
       const routerData = { 
         ...(router || { name: el.name_route, hidden: false, icon: parentIcon, isGroup: !router }), 
         name_category: el.name_category,
         order_category: el.order_category || 0,
         title: el.title || router?.title, // Priorizar título de la DB
         id_menu_app: el.id_menu_app,
         id_menu_parent: el.id_menu_parent,
         order_menu: el.order_menu || 0
       };
       arrayRouter.push(routerData);
    }
  });

  // Ordenar de menor a mayor basado en la DB
  arrayRouter.sort((a: any, b: any) => a.order_menu - b.order_menu);

  const dataGroupedRouter = groupByField(arrayRouter, 'name_category');
  return dataGroupedRouter;
}
