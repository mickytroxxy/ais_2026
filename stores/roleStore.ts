import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RoleState {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  clearRole: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      selectedRole: "security",

      setSelectedRole: (role) => set({ selectedRole: role }),

      clearRole: () => set({ selectedRole: "security" }),
    }),
    {
      name: "role-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
