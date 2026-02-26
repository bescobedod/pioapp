import { create } from "zustand";
import { getPublicacionesDashboard, PublicacionType } from "../http/Apis/PublicacionesApi";

interface PublicacionesState {
  dashboardFeeds: PublicacionType[];
  isLoadingDashboard: boolean;
  loadDashboardFeeds: () => Promise<void>;
  removeFeedLocally: (id_publicacion: number) => void;
}

const usePublicacionesState = create<PublicacionesState>((set) => ({
  dashboardFeeds: [],
  isLoadingDashboard: false,

  loadDashboardFeeds: async () => {
    set({ isLoadingDashboard: true });
    try {
      const resp = await getPublicacionesDashboard();
      if (resp.status && resp.data) {
        set({ dashboardFeeds: resp.data });
      } else {
        set({ dashboardFeeds: [] });
      }
    } catch (error) {
      console.error("Error cargando dashboard feeds:", error);
      set({ dashboardFeeds: [] });
    } finally {
      set({ isLoadingDashboard: false });
    }
  },

  removeFeedLocally: (id_publicacion: number) => {
    set((state) => ({
      dashboardFeeds: state.dashboardFeeds.filter((p) => p.id_publicacion !== id_publicacion)
    }));
  }
}));

export default usePublicacionesState;
