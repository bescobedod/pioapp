import * as Yup from 'yup'

// const schemaEditCountDevolucion = Yup.object({
//     cantidad_devolucion: Yup.string().required("La cantidad devolucion es obligatorio.")
// }).required()

const schemaEditCountDevolucion = (maxCantidad: number) =>
    Yup.object({
      cantidad_devolucion: Yup.number()
        .transform((value, originalValue) => {
          return originalValue === '' ? undefined : Number(originalValue)
        })
        .typeError("Debe ser un número válido")
        .required("La cantidad devolución es obligatoria.")
        .positive("Debe ser mayor a 0")
        .max(maxCantidad, `No puede ser mayor a ${maxCantidad}`)
        .test(
          "max-decimals",
          "Máximo 2 decimales permitidos",
          (value) => {
            if (!value) return true
            return /^\d+(\.\d{1,2})?$/.test(value.toString())
          }
        )
})

// export type schemaEditCountDevolucionType = Yup.InferType<typeof schemaEditCountDevolucion>
export type schemaEditCountDevolucionType = Yup.InferType<
  ReturnType<typeof schemaEditCountDevolucion>
>


export default schemaEditCountDevolucion