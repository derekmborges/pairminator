import { createContext, useContext, useState } from "react";
import { Pairee } from "../models/pair";
import { cloneDeep } from 'lodash'

export interface PairminatorContextT {
    pairees: Pairee[];
    addPairee: (name: string) => void;
    updatePairee: (id: number, updatedName: string) => void;
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

    const addPairee = (name: string) => {
        const newId: number = pairees.length > 0
            ? Math.max(...(pairees.map(p => p.id))) + 1
            : 1;

        const newPairee: Pairee = {
            id: newId,
            name,
        }
        setPairees([...pairees, newPairee]);
    }

    const updatePairee = (id: number, updatedName: string) => {
        const pairee = pairees.find(p => p.id === id);
        if (pairee !== undefined) {
            const paireesCopy: Pairee[] = cloneDeep(pairees);
            const index = paireesCopy.findIndex(p => p.id === pairee.id);
            paireesCopy[index].name = updatedName
            setPairees([...paireesCopy])
        }
    }

    const contextValue: PairminatorContextT = {
        pairees,
        addPairee,
        updatePairee
    };

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    );
}