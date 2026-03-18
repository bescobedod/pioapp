import React, { useEffect, useRef, useState } from 'react';
import { Modal, Portal, Text, useTheme, Avatar, Drawer, List } from 'react-native-paper';
import globalState from 'helpers/states/globalState';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  BackHandler,
} from 'react-native';
import ButtonForm from 'components/form/ButtonForm';
// import bottomNavigation from 'helpers/navigator/bottomNavigator';
// import { NavigationService, currentRouteName } from 'helpers/navigator/navigationScreens';
// import routers from 'helpers/navigator/routers';
import { logout } from 'helpers/authHelper/authHelper';
import { getValueStorage } from 'helpers/store/storeApp';
import menuRouterState, { RouterGrouped } from 'helpers/states/menuRouterState';
import { currentRouteName, NavigationService } from 'helpers/navigator/navigationScreens';
import TouchRipple from 'components/Touch/TouchRipple';
import DrawerSkeleton from 'components/Skeletons/DrawerSkeleton';
import AvatarImage from 'components/Avatars/AvatarImage';
import { DEFAULT_USER } from 'assets/Providers/ImageProvider';
// import { useRoute } from '@react-navigation/native';

export default function DrawerDashboard() {
  const { drawer, setCloseDrawer, indexNavigation, loadingMenuInit } = globalState();
  const { routerMenu } = menuRouterState();
  const [visible, setVisible] = useState<boolean>(drawer);
  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(screenWidth)).current;
  const theme = useTheme();
  const userSession = getValueStorage('user');
  // const router = useRoute()

  const onBackPress = () => {
    if (drawer) {
      // solo cambia el estado → la animación ya se ejecuta sola
      setCloseDrawer();
      return true; // bloquea navegación atrás
    }
    return false;
  };

  useEffect(() => {
    drawer && setVisible(drawer);
    Animated.timing(translateX, {
      toValue: drawer ? 0 : screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      !drawer && setVisible(drawer);
    });
  }, [drawer]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [drawer]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={setCloseDrawer}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateX }],
          },
        ]}>
        <View className="flex-1">
          {/* Personal page info */}
          <TouchRipple
            onPress={() => {
              setCloseDrawer();
              setTimeout(() => NavigationService.navigate('PersonalUser'), 200);
            }}>
            <View className="flex w-full flex-row items-center gap-4 px-[25] py-[30]">
              <AvatarImage
                size={50}
                img={userSession?.image_profile ? { uri: userSession.image_profile } : DEFAULT_USER}
              />
              <View className="flex-1">
                <Text variant="bodyLarge">{`${userSession?.first_name || ''} ${userSession?.first_last_name || ''}`}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                  {userSession?.puesto_trabajo || ' -- '}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                  {userSession?.codigo_user || '--'}
                </Text>
              </View>
            </View>
          </TouchRipple>

          {/* Section menu bootom */}
          <View className="w-full" style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
              {loadingMenuInit ? (
                <DrawerSkeleton />
              ) : (
                <>
                  {Object.entries(routerMenu as RouterGrouped)
                    .sort((a, b) => {
                       const orderA = a[1][0]?.order_category || 0;
                       const orderB = b[1][0]?.order_category || 0;
                       return orderA - orderB;
                    })
                    .filter(([key, value]) => {
                       const parentItems = value.filter((el) => !el.id_menu_parent);
                       return parentItems.some((parentEl) => {
                          const children = value.filter((el) => el.id_menu_parent === parentEl.id_menu_app);
                          if (children.length > 0) return true;
                          if ((parentEl as any).isGroup || !parentEl.name) return false;
                          return true;
                       });
                    })
                    .map(([key, value], index) => (
                    <Drawer.Section key={index} className="w-full" title={key}>
                      {(() => {
                        // Buscar elementos principales (que no tienen padre)
                        const parentItems = value.filter((el) => !el.id_menu_parent);

                        return parentItems.map((parentEl, i) => {
                          // Buscar hijos de este elemento
                          const children = value.filter((el) => el.id_menu_parent === parentEl.id_menu_app);

                          // Si tiene hijos, se renderiza un List.Accordion
// ... (Keep existing layout up to parent menu rendering)
                          if (children.length > 0) {
                            return (
                              <DrawerAccordionItem
                                key={`accordion-${parentEl.id_menu_app || i}`}
                                parentEl={parentEl}
                                childrenItems={children}
                                currentRouteName={currentRouteName}
                                setCloseDrawer={setCloseDrawer}
                                i={i}
                              />
                            );
                          }

                          // Si NO tiene hijos, es una opción regular navegable
                          if ((parentEl as any).isGroup || !parentEl.name) return null; // No renderizar carpetas vacías sin hijos o padres inhabilitados
                          return (
                            <Drawer.Item
                              key={`item-${parentEl.id_menu_app || i}`}
                              label={parentEl?.title || ''}
                              icon={parentEl?.icon}
                              disabled={parentEl.name === currentRouteName}
                              active={parentEl.name === currentRouteName}
                              onPress={() => {
                                setCloseDrawer();
                                setTimeout(() => NavigationService.replace(parentEl.name), 200);
                              }}
                            />
                          );
                        });
                      })()}
                    </Drawer.Section>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
        <View className="w-full px-[25] py-[30]">
          {userSession?.id_rol === 5 && (
            <ButtonForm
              onPress={() => {
                setCloseDrawer();
                setTimeout(() => NavigationService.navigate('AdminPermisosMenu'), 200);
              }}
              icon="shield-account"
              label="Configurar Permisos"
              style={{ marginBottom: 16 }}
            />
          )}
          <ButtonForm
            onPress={() => {
              setCloseDrawer();
              logout(false);
            }}
            icon="logout"
            label="Cerrar sesion"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '75%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

function DrawerAccordionItem({ parentEl, childrenItems, currentRouteName, setCloseDrawer, i }: any) {
  const theme = useTheme();
  const validChildren = childrenItems.filter((c: any) => !!c.name);
  if (validChildren.length === 0) return null; // Prevent showing an empty accordion if all children are hidden/empty routes
  
  const isChildActive = validChildren.some((c: any) => c.name === currentRouteName);
  const [expanded, setExpanded] = useState<boolean>(isChildActive);
  
  return (
    <List.Accordion
      expanded={expanded}
      onPress={() => setExpanded(!expanded)}
      title={parentEl.title || 'Submenú'}
      titleStyle={{ fontWeight: "500", fontSize: 14, marginLeft: -2, letterSpacing: 0.1, color: theme.colors.onSurfaceVariant }}
      left={(props) => (
        <List.Icon {...props} icon={parentEl.icon || "folder-outline"} color={theme.colors.onSurfaceVariant} style={{ marginLeft: 0, marginRight: 0 }} />
      )}
      style={{ paddingVertical: 1, paddingHorizontal: 18, marginHorizontal: 12 }}>
      {validChildren.map((childRouter: any, j: number) => (
        <Drawer.Item
          key={`sub-${childRouter.id_menu_app || j}`}
          label={childRouter?.title || ''}
          icon={childRouter.icon || 'circle-small'}
          disabled={childRouter.name === currentRouteName}
          active={childRouter.name === currentRouteName}
          style={{ paddingLeft: 40 }}
          onPress={() => {
            setCloseDrawer();
            if (childRouter.name) {
              setTimeout(() => NavigationService.replace(childRouter.name), 200);
            }
          }}
        />
      ))}
    </List.Accordion>
  );
}
