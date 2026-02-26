// schemaFormNwDevoluciones
import * as Yup from 'yup'

const schemaFormNwDevoluciones = Yup.object({
    tienda: Yup.string().required('El campo tienda es obligatorio.'),
    recepcion: Yup.string().required('El campo recepcion es obligatorio.'),
}).required()

export type schemaFormNwDevolucionesType = Yup.InferType<typeof schemaFormNwDevoluciones>;

export default schemaFormNwDevoluciones