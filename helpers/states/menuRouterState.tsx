import { RouterName } from "helpers/navigator/routers";
import { PermissionMenuType } from "pages/Inicio";
import { create } from "zustand";

type RouterItem = {
  component: React.ComponentType<any>;
  default: boolean;
  hidden: boolean;
  icon: string;
  name: RouterName;
  name_category: string;
  order_category?: number;
  title: string;
  id_menu_app?: number;
  id_menu_parent?: number;
  order_menu?: number;
};

export type RouterGrouped = Record<string, RouterItem[]>;

type menuRouterStateProps = {
    routerMenu?: RouterGrouped;
    rawPermissions: PermissionMenuType[];
    setRouterMenu: (nwRouterMenu:RouterGrouped)=>void; 
    setRawPermissions: (permissions: PermissionMenuType[])=>void;
}

const menuRouterState = create<menuRouterStateProps>((set)=>({
    routerMenu: {},
    rawPermissions: [],
    setRouterMenu: (nwRouterMenu) => set({ routerMenu: nwRouterMenu }),
    setRawPermissions: (permissions) => set({ rawPermissions: permissions })
}))

export default menuRouterState