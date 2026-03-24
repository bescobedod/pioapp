import TextInfo from 'components/typografy/TextInfo';
import { TouchableOpacity, Dimensions, View, Keyboard, Animated, ScrollViewProps } from 'react-native';
import { Modalize } from 'react-native-modalize'
import { useTheme, Divider } from 'react-native-paper';

type ModalizeComponentProps= {
    children?: React.ReactNode;
    modalizeRef?: any;
    title?: string;
    footerComponent?: React.ReactNode;
    heightModalizeSreen?: number;
    onOpen?(): void;
    panGestureEnabled?: boolean | undefined;
    scrollViewProps?: Animated.AnimatedProps<ScrollViewProps> | undefined;
    closeOnOverlayTap?: boolean | undefined;
    // onOpen?: () => void;
}

export default function ModalizeComponent({
    children,
    modalizeRef,
    title = '',
    footerComponent,
    heightModalizeSreen = 0.80,
    onOpen,
    panGestureEnabled,
    scrollViewProps,
    closeOnOverlayTap
    // onOpen = () => {}
} : ModalizeComponentProps){

    const theme = useTheme()

    const { height } = Dimensions.get('window');

    return (
        <>  
            {/* <TouchableOpacity onPress={onOpen}/> */}
            <Modalize 
                closeOnOverlayTap={closeOnOverlayTap}
                panGestureEnabled={panGestureEnabled}
                handlePosition='inside'
                ref={modalizeRef}
                onOpen={onOpen}
                adjustToContentHeight={true}
                //modalHeight={height * heightModalizeSreen}
                modalStyle={{ backgroundColor: theme.colors.background }}
                handleStyle={{ backgroundColor: theme.colors.outline }}
                scrollViewProps={{ 
                    contentContainerStyle: { padding: 25 },
                    keyboardShouldPersistTaps: 'always',
                    keyboardDismissMode: 'on-drag',
                    ...scrollViewProps
                }}
                HeaderComponent={
                    <>
                        <View className='w-full p-9'>
                            <TextInfo>{ title }</TextInfo>
                        </View>
                        <Divider/>
                    </>
                }
                FooterComponent={  
                    <>
                        { 
                            footerComponent && 
                            <>
                                <Divider/>
                                <View style={{ padding: 25 }}>
                                    { footerComponent }
                                </View>
                            </>
                        } 
                    </>
                }
            >
                { children }
            </Modalize>
        </>
    )
}