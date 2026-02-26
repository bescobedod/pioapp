import { create } from 'zustand'
import { getValueStorage, setValueStorage } from 'helpers/store/storeApp';

type GlobalState = {
  dark: boolean;
  setDark: () => void;
  drawer: boolean;
  setOpenDrawer: () => void;
  setCloseDrawer: () => void;
  screenLoading: boolean;
  setOpenScreenLoading: () => void;
  setCloseScreenLoading: () => void;
  indexNavigation?: any;
  setIndexNavigation: (newIndex:number) => void;
  loadingMenuInit: boolean;
  setLoadingMenuInit: (newLoadingMenuInit:boolean) => void;
  screenLoadingAll: boolean;
  setScreenLoadingAll: (newScreenLoadingAll:boolean) => void;
};

const globalState = create<GlobalState>((set)=>({
    dark: getValueStorage('theme')?.dark || false,
    // setDark: () => set((state) => ({ dark: !state.dark }))
    setDark: () => set((state) => {
        const newDark = !state.dark
        setValueStorage('theme',{ dark: newDark })
        return { dark: newDark }
    }),
    drawer: false,
    setOpenDrawer: () => set({ drawer: true }),
    setCloseDrawer: () => set({ drawer: false }),
    screenLoading: false,
    setOpenScreenLoading: () => set({ screenLoading: true }),
    setCloseScreenLoading: () => set({ screenLoading: false }),
    indexNavigation: 0,
    setIndexNavigation: (newIndex:number = 0) => set({ indexNavigation: newIndex }),
    loadingMenuInit: false,
    setLoadingMenuInit: (newLoadingMenuInit) => set({ loadingMenuInit: newLoadingMenuInit }),
    screenLoadingAll: false,
    setScreenLoadingAll: (newScreenLoadingAll:boolean) => set({ screenLoadingAll: newScreenLoadingAll })
}))

export default globalState