import ModalizeComponent from "components/Modals/ModalizeComponent";

type ModalizeDevolucionArticuloProps = {
    modalizeRefDevolucionArticulo:any;
}

export default function ModalizeDevolucionArticulo({
    modalizeRefDevolucionArticulo
}:ModalizeDevolucionArticuloProps) {

    return (
        <>
            <ModalizeComponent
                modalizeRef={modalizeRefDevolucionArticulo}
            >

            </ModalizeComponent>
        </>
    )
}