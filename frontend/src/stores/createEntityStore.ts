import { create } from "zustand";

// Define the shape of your state
interface selectedEntityType {
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}

// Create the store
export const useCreateEntityTypeStore = create<selectedEntityType>((set) => ({
  selectedValue: "",
  setSelectedValue: (value) => set({ selectedValue: value }),
}));
