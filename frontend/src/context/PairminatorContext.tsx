import { createContext, useContext, useState } from "react";
import { Pairee } from "../models/pair";

export interface PairminatorContextT {
    pairees: Pairee[];
    addPairee: (pairee: Pairee) => void;
}

export const PairminatorContext = createContext<PairminatorContextT | undefined>(undefined);

export const usePairminatorContext  = () => {
    const context = useContext(PairminatorContext);
    if (context === undefined) {
        throw new Error('usePairminatorContext must be used within a Pairminator Provider');
    }
    return context;
};

interface Props {
    children: React.ReactNode;
}

export const PairminatorProvider: React.FC<Props> = ({ children }) => {
    const [pairees, setPairees] = useState<Pairee[]>([]);

    const addPairee = (pairee: Pairee) => {
        setPairees([...pairees, pairee]);
    }

    const contextValue: PairminatorContextT = {
        pairees,
        addPairee,
    };

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    );
}