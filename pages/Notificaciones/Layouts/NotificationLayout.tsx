import AnimatedListItem from "components/Animaciones/AnimatedListItem";
import FlatListVirtualize from "components/List/FlatListVirtualize";
import ListItemComponent from "components/List/ListItemComponent";
import ListSubheader from "components/List/ListSubheader";
import TextInfo from "components/typografy/TextInfo";
import Title from "components/typografy/Title";
import { GestureResponderEvent, View } from "react-native";
import { Badge, Icon, useTheme } from "react-native-paper";
import NotificacionAppType from "types/Notificaciones/NotificacionAppType";
import { AppTheme } from "types/ThemeTypes";

type NotificationLayoutProps = {
    notifications: NotificacionAppType[];
    onPressNoti: (data:NotificacionAppType) => void;
}

export default function NotificationLayout({
    notifications,
    onPressNoti
} : NotificationLayoutProps) {

    const theme:AppTheme = useTheme() as AppTheme

    return (
        <>
            {
                notifications.length > 0 
                ?  
                <FlatListVirtualize
                    data={notifications}
                    keyExtractor={(_, i) => i.toString()}
                    scrollEnabled={false}
                    renderItem={({ item, index }: { item: NotificacionAppType; index: number }) => (
                        <AnimatedListItem key={index} index={index}>
                            <ListSubheader label={item.AsuntoNotificacionModel.name_asunto}/>
                                <View className="w-full flex flex-row">
                                    <View style={{
                                       width: 3,
                                       height: '100%',
                                       ...(item.leido ? {} : { backgroundColor: theme.colors.primary  })
                                    }}></View>
                                    <ListItemComponent 
                                        // descriptionNumberOfLines={1}
                                        onPress={() => onPressNoti(item)}
                                        styleList={{ 
                                            width: '100%',
                                            ...(item.leido ? {} : { backgroundColor: theme.colors.surfaceVariant, borderTopEndRadius: 10, borderBottomEndRadius: 10 }) 
                                        }}
                                        iconLeft="bell"
                                        title={item.title} 
                                        titleStyle={{ ...(item.leido ? { } : { color: theme.colors.primary }) }}
                                        description={item.body}
                                        rightElements={
                                            <View className="justify-center">
                                                <Badge 
                                                    size={12} 
                                                    style={{ 
                                                        backgroundColor: 
                                                            item.leido 
                                                                ? theme.colors.success
                                                                : theme.colors.error
                                                    }}
                                                />
                                            </View>
                                        }
                                    />
                                </View>
                        </AnimatedListItem>
                    )}
                />
                :
                <View className="w-full flex-col items-center justify-center gap-3.5" style={{ marginTop: 80 }}>
                    <Icon source={'bell-off-outline'} size={60}/>
                    <Title>Notificaciones</Title>
                    <TextInfo style={{ textAlign: 'center', paddingHorizontal: 35 }}>No tienes ninguna notificacion. Aqui se mostraran todo el listado de las mismas.</TextInfo>
                </View>
            }
        </>
    )
}