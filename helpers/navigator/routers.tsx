import Login from 'pages/auth/Login';
import UserDeactivated from 'pages/auth/UserDeactivated';
import FirstTimePassword from 'pages/auth/FirstTimePassword';
import ForgotPassword from 'pages/auth/ForgotPassword';
// import Inicio from "pages/dashboard/Inicio"
import SaveVisitas from 'pages/Visitas/GuardarVisita/SaveVisitas';
import ScannnerQr from 'pages/Features/ScannerQr/ScannnerQr';
import Home from 'pages/Inicio';
import Rutas from 'pages/Rutas/Rutas';
import Boleta from 'pages/Boleta/Boleta';
import ShowQrRuta from 'pages/Rutas/MostrarQr/ShowQrRuta';
import RecepcionRutas from 'pages/Rutas/Recepcion/RecepcionRutas';
import Marcaje from 'pages/auth/Marcaje';
import FailConnectInternet from 'pages/Features/Conexion/FailConnectInternet';
import ConvivioInvitacion from 'pages/Convivio/Invitacion/ConvivioInvitacion';
import NominaConvivio from 'pages/Convivio/NominaConvivio/NominaConvivio';
import CrearQrConvivio from 'pages/Convivio/NominaConvivio/CrearQrConvivio/CrearQrConvivio';
import CrearProductoConvivio from 'pages/Convivio/NominaConvivio/CrearProductoConvivio/CrearProductoConvivio';
import ListNotification from 'pages/Notificaciones/ListNotification';
import PersonalUser from 'pages/Perfil/PersonalUser';
import DevolucionesListadoPage from 'pages/Rutas/Devolucion/DevolucionesListado/DevolucionesListadoPage';
import DevolucionCreacionPage from 'pages/Rutas/Devolucion/DevolucionCreacion/DevolucionCreacionPage';
import HistorialPublicacionesScreen from 'pages/Publicaciones/HistorialPublicacionesScreen';
import PublicacionDetalleScreen from 'pages/Publicaciones/PublicacionDetalleScreen';
import DevolucionDetallePage from 'pages/Rutas/Devolucion/DevolucionDetalle/DevolucionDetallePage';

type RoutersType = {
  name: string;
  component?: any;
  default?: boolean;
  hidden?: boolean;
  icon?: string;
  title?: string;
};

const routers = [
  {
    name: 'Login',
    component: Login,
    default: true,
    hidden: true,
    icon: '',
    title: '',
  },
  {
    name: 'Home',
    component: Home,
    default: false,
    icon: 'home',
    title: 'Home',
    hidden: true,
  },
  {
    name: 'Rutas',
    component: Rutas,
    default: false,
    icon: 'truck',
    title: 'Rutas',
    hidden: false,
  },
  {
    name: 'SaveVisitas',
    component: SaveVisitas,
    default: false,
    icon: 'storefront',
    title: 'Visitas',
    hidden: false,
  },
  {
    name: 'Boleta',
    component: Boleta,
    default: false,
    icon: 'file-sign',
    title: 'Boleta',
    hidden: false,
  },
  {
    name: 'ScannerQr',
    component: ScannnerQr,
    default: false,
    hidden: true,
    icon: '',
    title: '',
  },
  {
    name: 'QrRutas',
    component: ShowQrRuta,
    default: false,
    hidden: true,
    icon: '',
    title: '',
  },
  {
    name: 'RecepcionRutas',
    component: RecepcionRutas,
    default: false,
    hidden: false,
    icon: 'package-variant',
    title: 'Recepcion',
  },
  {
    name: 'Marcaje',
    component: Marcaje,
    default: false,
    hidden: false,
    icon: 'gesture-tap-button',
    title: 'Marcaje',
  },
  {
    name: 'InternetFail',
    component: FailConnectInternet,
    default: false,
    hidden: false,
    icon: '',
    title: 'Sin conexion',
  },
  {
    name: 'UserDeactivated',
    component: UserDeactivated,
    default: false,
    hidden: true,
    icon: '',
    title: 'Acceso Denegado',
  },
  {
    name: 'FirstTimePassword',
    component: FirstTimePassword,
    default: false,
    hidden: true,
    icon: '',
    title: 'Cambiar Contraseña',
  },
  {
    name: 'ForgotPassword',
    component: ForgotPassword,
    default: false,
    hidden: true,
    icon: '',
    title: 'Recuperar Contraseña',
  },
  {
    name: 'InvitacionConvivio',
    component: ConvivioInvitacion,
    default: false,
    hidden: false,
    icon: 'party-popper',
    title: 'Convivio',
  },
  {
    name: 'NominaConvivio',
    component: NominaConvivio,
    default: false,
    hidden: false,
    icon: 'calendar-star',
    title: 'Gestion convivio',
  },
  {
    name: 'CrearQrConvivio',
    component: CrearQrConvivio,
    default: false,
    hidden: true,
    icon: '',
    title: 'Generar Qr Convivio',
  },
  {
    name: 'CrearProductoConvivio',
    component: CrearProductoConvivio,
    default: false,
    hidden: true,
    icon: '',
    title: 'Crear producto convivio',
  },
  {
    name: 'Notificaciones',
    component: ListNotification,
    default: false,
    hidden: true,
    icon: '',
    title: 'Notificaciones',
  },
  {
    name: 'PersonalUser',
    component: PersonalUser,
    default: false,
    hidden: true,
    icon: '',
    title: 'Personal',
  },
  {
    name: 'DevolucionListado',
    component: DevolucionesListadoPage,
    default: false,
    hidden: false,
    icon: 'package-variant-closed',
    title: 'Historial',
  },
  {
    name: 'DevolucionCreacion',
    component: DevolucionCreacionPage,
    default: false,
    hidden: false,
    icon: 'package-variant-closed',
    title: 'Crear Devolución',
  },
  {
    name: 'HistorialPublicaciones',
    component: HistorialPublicacionesScreen,
    default: false,
    hidden: false,
    icon: 'newspaper-variant-multiple',
    title: 'Publicaciones',
  },
  {
    name: 'PublicacionDetalle',
    component: PublicacionDetalleScreen,
    default: false,
    hidden: true,
    icon: '',
    title: 'Detalle Publicación',
  },
  {
    name: 'DevolucionDetalle',
    component: DevolucionDetallePage,
    default: false,
    hidden: true,
    icon: '',
    title: 'Detalle de Devolución',
  },
] as const satisfies readonly RoutersType[];

export type RouterName = (typeof routers)[number]['name'];

export default routers;
