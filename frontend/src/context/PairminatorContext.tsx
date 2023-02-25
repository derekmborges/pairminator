import { createContext, useContext, useEffect, useState } from "react";
import { Lane, Pair, Pairee } from "../models/interface";
import { cloneDeep } from 'lodash'
import { PairingState } from "../models/enum";

const getNextId = (ids: number[]): number => {
    return ids.length > 0
        ? Math.max(...ids) + 1
        : 1;
}

export interface PairminatorContextT {
    pairees: Pairee[];
    addPairee: (name: string) => void;
    updatePairee: (id: number, updatedName: string) => void;
    availablePairees: Pairee[];
    togglePaireeAvailability: (pairee: Pairee) => void;
    pairingState: PairingState;
    currentPairs: Pair[] | null;
    lanes: Lane[];
    generatePairs: () => void;
    resetCurrentPairs: () => void;
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
        const newPairee: Pairee = {
            id: getNextId(pairees.map(p => p.id)),
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
    const [currentPairs, setCurrentPairs] = useState<Pair[] | null>(null);
    const [lanes, setLanes] = useState<Lane[]>([]);
    
    useEffect(() => {
        const lanesNeeded: number = Math.ceil(availablePairees.length / 2)
        
        let lanes: Lane[] = []
        for (let i=0; i < lanesNeeded; i++) {
            const lane: Lane = {
                id: getNextId(lanes.map(l => l.id)),
                name: `Lane ${i+1}`
            }
            lanes.push(lane)
        }
        setLanes([...lanes])
    }, [availablePairees])

    const generatePairs = () => {
        setPairingState(PairingState.GENERATING)

        let pairs: Pair[] = []
        let available: Pairee[] = cloneDeep(availablePairees)
        let freeLanes: Lane[] = cloneDeep(lanes)
        while (available.length) {
            const pairee1: Pairee = available[0]
            const pairee2: Pairee | undefined = available.at(1)
            const lane: Lane = freeLanes[0]
            const pair: Pair = {
                pairee1,
                pairee2,
                lane,
                date: new Date()
            }
            pairs.push(pair)
            freeLanes.splice(0, 1)
            available.splice(0, pairee2 !== undefined ? 2 : 1)
        }
        setCurrentPairs([...pairs])
        setPairingState(PairingState.GENERATED)
    }

    const resetCurrentPairs = () => {
        setPairingState(PairingState.INITIAL)
        setCurrentPairs(null)
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
        lanes,
        generatePairs,
        resetCurrentPairs,
    };

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    );
}