import { ImageSourcePropType, StyleProp, ViewStyle, Image, View } from "react-native";
import { useTheme, Avatar } from "react-native-paper";

type AvatarImageType = {
    size?: number;
    img: ImageSourcePropType;
    style?: StyleProp<ViewStyle>;
}

export default function AvatarImage({
    size = 24,
    img,
    style
} : AvatarImageType) {
    const theme = useTheme();
    return (
        <Avatar.Image 
            size={size}
            source={img}
            style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: theme.colors.primary }, style]}
        />
    )
}