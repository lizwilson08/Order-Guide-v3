import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { CreateOrderModal } from "../components";

const HASH = "create-order";

type CreateOrderModalContextValue = {
  openCreateOrderModal: () => void;
};

const CreateOrderModalContext = createContext<CreateOrderModalContextValue | null>(null);

export function useCreateOrderModal() {
  const ctx = useContext(CreateOrderModalContext);
  if (!ctx) throw new Error("useCreateOrderModal must be used within CreateOrderModalProvider");
  return ctx;
}

export function CreateOrderModalProvider({ children }: { children: ReactNode }) {
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);

  const openCreateOrderModal = useCallback(() => {
    setCreateOrderModalOpen(true);
  }, []);

  const closeCreateOrderModal = useCallback(() => {
    setCreateOrderModalOpen(false);
    if (typeof window !== "undefined" && window.location.hash.slice(1) === HASH) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash.slice(1) === HASH) {
        setCreateOrderModalOpen(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  return (
    <CreateOrderModalContext.Provider value={{ openCreateOrderModal }}>
      {children}
      <CreateOrderModal open={createOrderModalOpen} onClose={closeCreateOrderModal} />
    </CreateOrderModalContext.Provider>
  );
}
