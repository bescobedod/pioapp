import { AJAX, URLPIOAPP } from "../ajax";
import { ResponseService } from "../../../types/RequestType";

// Definición de tipos esperados desde el backend
export interface CategoriaPublicacionType {
  id_categoria_publicacion: number;
  nombre: string;
  color: string;
}

export interface ArchivoPublicacionType {
  id_archivo_pub: number;
  url_archivo: string;
  nombre_archivo: string;
  tipo: string;
}

export interface PublicacionType {
  id_publicacion: number;
  id_categoria_publicacion: number;
  titulo: string;
  mensaje: string;
  estado: boolean;
  leido?: boolean;
  createdAt: string;
  categoria: CategoriaPublicacionType;
  archivos: ArchivoPublicacionType[];
}

// Consumir el feed del Dashboard (las que no he visto)
export const getPublicacionesDashboard = async (): Promise<ResponseService<PublicacionType[]>> => {
  return await AJAX(
    `${URLPIOAPP}/publicaciones/dashboard`,
    "GET"
  );
};

// Historial (todas, filtrables opcionalmente)
export const getPublicacionesHistorial = async (id_categoria?: number): Promise<ResponseService<PublicacionType[]>> => {
  let url = `${URLPIOAPP}/publicaciones/historial`;
  if (id_categoria) {
    url += `?id_categoria=${id_categoria}`;
  }
  return await AJAX(
    url,
    "GET"
  );
};

// Marcar como visto
export const postMarcarPublicacionLeida = async (id_publicacion: number): Promise<ResponseService<any>> => {
  return await AJAX(
    `${URLPIOAPP}/publicaciones/leido`,
    "POST",
    { id_publicacion }
  );
};

// Obtener categorías
export const getCategoriasPublicacion = async (): Promise<ResponseService<CategoriaPublicacionType[]>> => {
  return await AJAX(
    `${URLPIOAPP}/publicaciones/categorias`,
    "GET"
  );
};
