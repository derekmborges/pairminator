import { createContext, useContext, useState } from "react";
import { Pair, Pairee } from "../models/interface";
import { cloneDeep } from 'lodash'
import { PairingState } from "../models/enum";

export interface PairminatorContextT {
    pairees: Pairee[];
    addPairee: (name: string) => void;
    updatePairee: (id: number, updatedName: string) => void;
    availablePairees: Pairee[];
    togglePaireeAvailability: (pairee: Pairee) => void;
    pairingState: PairingState;
    currentPairs: Pair[];
    generatePairs: () => void;
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

    /* BEGIN PAIREES */
    const [pairees, setPairees] = useState<Pairee[]>([]);
    const [availablePairees, setAvailablePairees] = useState<Pairee[]>(pairees);
    
    const addPairee = (name: string) => {
        const newId: number = pairees.length > 0
        ? Math.max(...(pairees.map(p => p.id))) + 1
        : 1;
        
        const newPairee: Pairee = {
            id: newId,
            name,
        }
        setPairees([...pairees, newPairee]);
        setAvailablePairees([...availablePairees, newPairee])
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

    const togglePaireeAvailability = (pairee: Pairee) => {
        const availableCopy: Pairee[] = cloneDeep(availablePairees)
        const currentlyAvailable: boolean = availableCopy.some(p => p.id === pairee.id)
        if (currentlyAvailable) {
        const index: number = availableCopy.findIndex(p => p.id === pairee.id)
        availableCopy.splice(index, 1)
        } else {
        availableCopy.push(pairee)
        }
        setAvailablePairees([...availableCopy])
    }
    /* END PAIREES */

    /* BEGIN PAIRS */
    const [pairingState, setPairingState] = useState<PairingState>(PairingState.INITIAL)
    const [currentPairs, setCurrentPairs] = useState<Pair[]>([]);

    const generatePairs = () => {
        setPairingState(PairingState.GENERATING)
    }
    /* END PAIRS */
    
    const contextValue: PairminatorContextT = {
        pairees,
        addPairee,
        updatePairee,
        availablePairees,
        togglePaireeAvailability,
        pairingState,
        currentPairs,
        generatePairs,
    };

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    );
}