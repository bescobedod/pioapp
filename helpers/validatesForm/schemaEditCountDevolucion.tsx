import * as Yup from 'yup';

const emptyStringToNull = (value: any, originalValue: string) => {
  if (typeof originalValue === 'string' && originalValue.trim() === '') return null;
  return value;
};

const schemaEditCountDevolucion = () =>
    Yup.object({
      id_devolucion_motivo: Yup.number()
        .transform(emptyStringToNull)
        .typeError("Selecciona un motivo válido")
        .required("El motivo de devolucion es obligatorio."),
      cantidad_devolucion: Yup.number().transform(emptyStringToNull).nullable().optional(),
      unidad_devolucion: Yup.string().nullable().optional(),
      pieza_1: Yup.number().transform(emptyStringToNull).nullable().optional(), // Pierna
      pieza_2: Yup.number().transform(emptyStringToNull).nullable().optional(), // Ala
      pieza_3: Yup.number().transform(emptyStringToNull).nullable().optional(), // Pechuga
      pieza_4: Yup.number().transform(emptyStringToNull).nullable().optional(), // Cuadril
      tipo_pollo_reclamo: Yup.string().nullable().optional(),
      peso_bascula_reclamo: Yup.string().nullable().optional()
    });

export type schemaEditCountDevolucionType = Yup.InferType<
  ReturnType<typeof schemaEditCountDevolucion>
>;

export default schemaEditCountDevolucion;