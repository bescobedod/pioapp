import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Surface, FAB, useTheme, ActivityIndicator, Divider, Switch, List } from 'react-native-paper';
import PageLayout from 'components/Layouts/PageLayout';
import * as AdminApi from '../../Apis/Admin/AdminPermissionApi';
import alertsState from 'helpers/states/alertsState';
import globalState from 'helpers/states/globalState';
import { Dropdown } from 'react-native-element-dropdown';
import menuRouterState from 'helpers/states/menuRouterState';
import { AJAX, URLPIOAPP } from 'helpers/http/ajax';
import { orderRoutersMenu } from 'helpers/Global/HomeGlobalHelper';

export default function AdminPermisosMenuPage() {
  const theme = useTheme();
  const { setRouterMenu, setRawPermissions } = menuRouterState();
  const { openVisibleSnackBar } = alertsState();
  const { setOpenScreenLoading, setCloseScreenLoading } = globalState();

  const [saving, setSaving] = useState(false);
  
  const [roles, setRoles] = useState<any[]>([]);
  const [menusCategorias, setMenusCategorias] = useState<any[]>([]);
  
  const [selectedRol, setSelectedRol] = useState<number | undefined>(undefined);
  const [activePermissions, setActivePermissions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (selectedRol) {
      loadPermissionsForRol(selectedRol);
    } else {
      setActivePermissions(new Set());
    }
  }, [selectedRol]);

  const loadBaseData = async () => {
    setOpenScreenLoading();
    try {
      const [resRoles, resMenus] = await Promise.all([
        AdminApi.getAdminRoles(),
        AdminApi.getAdminMenus()
      ]);
      if (resRoles.status) {
        setRoles(resRoles.data || []);
        if (resRoles.data && resRoles.data.length > 0) {
          setSelectedRol(resRoles.data[0].id_rol);
        }
      } else {
         openVisibleSnackBar(resRoles.message || 'Error al obtener roles', 'error');
      }

      if (resMenus.status) {
        setMenusCategorias(resMenus.data || []);
      } else {
         openVisibleSnackBar(resMenus.message || 'Error al obtener menús', 'error');
      }
    } catch (error) {
       openVisibleSnackBar('Error cargando base del panel administrador', 'error');
    } finally {
      setCloseScreenLoading();
    }
  };

  const loadPermissionsForRol = async (id_rol: number) => {
    try {
      const res = await AdminApi.getAdminPermissionsByRol(id_rol);
      const permSet = new Set<number>();
      if (res.status && res.data) {
        res.data.forEach((p: any) => permSet.add(p.id_menu_app));
      } else {
        openVisibleSnackBar(res.message || 'No se pudieron cargar los permisos', 'error');
      }
      setActivePermissions(permSet);
    } catch (error) {
      openVisibleSnackBar('Error obteniendo permisos del rol seleccionado', 'error');
    }
  };

  const togglePermission = (id_menu_app: number) => {
    setActivePermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id_menu_app)) {
        newSet.delete(id_menu_app);
      } else {
        newSet.add(id_menu_app);
      }
      return newSet;
    });
  };

  const toggleAllInCategory = (catId: number, menus: any[], isAllSelected: boolean) => {
      setActivePermissions(prev => {
          const newSet = new Set(prev);
          menus.forEach(m => {
              if (isAllSelected) {
                  newSet.delete(m.id_menu_app);
              } else {
                  newSet.add(m.id_menu_app);
              }
          });
          return newSet;
      });
  }

  const handleSave = async () => {
    if (!selectedRol) return;
    setSaving(true);
    setOpenScreenLoading();
    try {
      const res = await AdminApi.updateAdminPermissionsByRol(selectedRol, Array.from(activePermissions));
      if (res.status) {
        openVisibleSnackBar('Permisos actualizados correctamente', 'success');
        
        // Recargar el Drawer Menú de la aplicación globalmente en caso de que sea el mismo usuario
        try {
           const result = await AJAX(`${URLPIOAPP}/permissions/all`, 'GET');
           const rawData = result.data || [];
           setRawPermissions(rawData);
           setRouterMenu(orderRoutersMenu(rawData));
        } catch(e) {}
        
      } else {
        openVisibleSnackBar(res.message || 'Error actualizando permisos', 'error');
      }
    } catch (error) {
      openVisibleSnackBar('Error actualizando los permisos', 'error');
    } finally {
      setSaving(false);
      setCloseScreenLoading();
    }
  };

  return (
    <PageLayout titleAppBar="Permisos de App" goBack>
      <View className="flex-1 p-4 pb-20">
        
        {/* Selector de Rol */}
        <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: theme.colors.surface, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 }}>
          <Text variant="labelLarge" className="mt-1 mb-2 text-gray-500 font-bold">Seleccionar Rol</Text>
          <Dropdown
            data={roles.map(r => ({ label: r.name, value: r.id_rol }))}
            value={selectedRol}
            onChange={item => setSelectedRol(item.value)}
            labelField="label"
            valueField="value"
            placeholder="Seleccionar Rol"
            style={{
               backgroundColor: theme.colors.surfaceVariant,
               height: 55,
               paddingHorizontal: 15,
               borderRadius: 4
            }}
            itemTextStyle={{ color: theme.colors.onBackground }}
            selectedTextStyle={{ color: theme.colors.onBackground }}
            activeColor={theme.colors.surfaceVariant}
          />
        </View>

        {/* Treeview de Menus */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {menusCategorias.map((cat, i) => {
            const hasMenus = cat.menus && cat.menus.length > 0;
            if (!hasMenus) return null;

            const isAllSelected = cat.menus.every((m: any) => activePermissions.has(m.id_menu_app));
            
            return (
              <View key={`cat-${cat.id_categorias_menu || i}`} className="mb-4 overflow-hidden rounded-xl" style={{ backgroundColor: theme.colors.surface, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 }}>
                
                {/* Header Categoria */}
                <View className="flex-row items-center justify-between bg-gray-100 p-3 dark:bg-gray-800">
                  <Text variant="titleMedium" className="font-bold">{cat.name_category}</Text>
                  <Switch 
                     value={isAllSelected}
                     onValueChange={() => toggleAllInCategory(cat.id_categorias_menu, cat.menus, isAllSelected)}
                     color={theme.colors.primary}
                  />
                </View>
                <Divider />

                {/* Lista de Menus de la categoria */}
                {cat.menus.map((menu: any, j: number) => {
                   const isSelected = activePermissions.has(menu.id_menu_app);
                   const isParent = !menu.id_menu_parent;

                   return (
                     <View key={`menu-${menu.id_menu_app || j}`}>
                        <List.Item
                          title={menu.title || menu.name_route}
                          description={menu.name_route ? `Ruta: ${menu.name_route}` : 'Agrupador visual'}
                          left={props => <List.Icon {...props} icon={menu.icon || (isParent ? "folder" : "circle-small")} />}
                          right={() => (
                            <Switch 
                              value={isSelected} 
                              onValueChange={() => togglePermission(menu.id_menu_app)}
                              color={theme.colors.primary}
                            />
                          )}
                          style={{ paddingLeft: isParent ? 0 : 20 }}
                        />
                        <Divider />
                     </View>
                   );
                })}

              </View>
            );
          })}
        </ScrollView>
      </View>

      <FAB
        icon="content-save"
        label="Guardar Permisos"
        onPress={handleSave}
        loading={saving}
        disabled={saving || !selectedRol}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 20,
          backgroundColor: theme.colors.primary,
        }}
        color="white"
      />
    </PageLayout>
  );
}
