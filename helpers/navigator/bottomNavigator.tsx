import Home from 'pages/Inicio';
import Visitas from 'pages/Visitas/Visitas';
import Rutas from 'pages/Rutas/Rutas';
import Boleta from 'pages/Boleta/Boleta';
import SaveVisitas from 'pages/Visitas/GuardarVisita/SaveVisitas';

export type BottomNavKey = (typeof bottomNavigation)[number]['key'];

export function getIndexByKey(key: BottomNavKey): number {
  return bottomNavigation.findIndex((item) => item.key === key);
}

const bottomNavigation = [
  {
    key: 'home',
    title: 'Inicio',
    focusedIcon: 'home',
    unfocusedIcon: 'home-outline',
    appBarTitle: '',
    element: Home,
  },
  {
    key: 'rutas',
    title: 'Rutas',
    focusedIcon: 'truck',
    unfocusedIcon: 'truck-outline',
    appBarTitle: 'Rutas',
    element: Rutas,
  },
  {
    key: 'visitas',
    title: 'Visitas',
    focusedIcon: 'storefront',
    unfocusedIcon: 'storefront-outline',
    // appBarTitle: 'Visitas',
    appBarTitle: '',
    element: SaveVisitas,
  },
  {
    key: 'boleta',
    title: 'Boleta',
    focusedIcon: 'file-sign',
    // unfocusedIcon: 'storefront-outline',
    appBarTitle: 'Boleta',
    element: Boleta,
  },
] as const;

export default bottomNavigation;
