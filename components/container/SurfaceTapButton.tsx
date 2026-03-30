import { Surface, Icon, Text } from "react-native-paper"
import { GestureResponderEvent, Pressable, View } from "react-native"

type SurfaceTapButtonProps = {
    icon?: string;
    title?: string;
    onPress?: ((event: GestureResponderEvent) => void) | null,
    disabled?: boolean;
    visible?: boolean;
}

export default function SurfaceTapButton({
    icon,
    title,
    onPress,
    disabled = false,
    visible = true
} : SurfaceTapButtonProps){

    return (
      <>
        {
          visible && (
            <Pressable onPress={disabled ? ()=>{} : onPress}>
              <View 
                style={{ 
                  backgroundColor: 'white', // fallback or theme color
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 5,
                  borderRadius: 5,
                  opacity: disabled ? 0.6 : 1,
                  elevation: disabled ? 0 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 1,
                }} 
              >
                <Icon source={icon} size={25}/>
                <Text>{ title }</Text>
              </View>
            </Pressable>
          )
        }
      </>
    )
}