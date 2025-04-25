import { create } from "zustand";

const useSearchStore = create((set) =>({
  query: "",
  setQuery: (newQuery) =>{
    set({ query: newQuery })
  }
}));

export default useSearchStore;