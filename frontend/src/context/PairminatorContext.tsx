import { createContext, useContext, useEffect, useState } from "react";
import { Assignment, Lane, Pair, Pairee } from "../models/interface";
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
    assignCurrentPairs: () => void;
    assignmentHistory: Assignment[];
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
        let usedIndices: number[] = []
        while (available.length) {
            console.log('remaining:', available.length)
            let index1: number
            let index2: number | undefined = undefined

            if (available.length <= 2) {
                index1 = 0
                if (available.length === 2) {
                    index2 = 1
                }
            } else {
                console.log(`picking random indexes for 0-${available.length-1}`)
                index1 = Math.floor(Math.random() * available.length)
                while (usedIndices.includes(index1)) {
                    index1 = Math.floor(Math.random() * available.length)
                }
                usedIndices.push(index1)
                
                index2 = Math.floor(Math.random() * available.length)
                while (usedIndices.includes(index2)) {
                    index2 = Math.floor(Math.random() * available.length)
                }
                usedIndices.push(index2)
                console.log(index1, index2)
            }

            const pairee1: Pairee = available[index1]
            const pairee2: Pairee | undefined = index2 !== undefined ? available.at(index2) : undefined
            
            const lane: Lane = freeLanes[0]
            const pair: Pair = {
                pairee1,
                pairee2,
                lane
            }
            pairs.push(pair)
            freeLanes.splice(0, 1)

            available.splice(index1, 1)
            if (index2 !== undefined) {
                available.splice(index2 > 0 ? index2-1 : index2, 1)
            }
        }
        setCurrentPairs([...pairs])
        setPairingState(PairingState.GENERATED)
    }

    const resetCurrentPairs = () => {
        setPairingState(PairingState.INITIAL)
        setCurrentPairs(null)
    }

    const [assignmentHistory, setAssignmentHistory] = useState<Assignment[]>([])
    const assignCurrentPairs = () => {
        if (currentPairs) {
            const newAssignment: Assignment = {
                pairs: currentPairs,
                date: new Date()
            }
            setAssignmentHistory([...assignmentHistory, newAssignment])
            setPairingState(PairingState.ASSIGNED)
        }
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
        assignCurrentPairs,
        assignmentHistory,
    };

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    );
}