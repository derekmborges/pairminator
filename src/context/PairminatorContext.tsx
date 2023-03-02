import { createContext, useContext, useEffect, useState } from "react";
import { Assignment, Lane, Pair, Pairee, Project } from "../models/interface";
import { cloneDeep } from 'lodash'
import { PairingState } from "../models/enum";
import { useDatabaseContext } from "./DatabaseContext";

const getNextId = (ids: number[]): number => {
    return ids.length > 0
        ? Math.max(...ids) + 1
        : 1;
}

export interface PairminatorContextT {
    projectId: string | undefined;
    projectName: string | undefined;
    loadProject: (projectName: string) => Promise<void>;
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

    /* BEGIN PROJECT */
    const { handleSearchProjects, handleUpdateProject } = useDatabaseContext()
    const [projectId, setProjectId] = useState<string | undefined>(undefined);
    const [projectName, setProjectName] = useState<string | undefined>(undefined);

    const loadProject = async (projectName: string): Promise<void> => {
        const projects = await handleSearchProjects(projectName)
        if (projects.length === 1) {
            const project = projects[0]
            setPairees(project.pairees)
            setAvailablePairees(project.availablePairees)
            setPairingState(project.pairingStatus)
            setLanes(project.lanes)
            setCurrentPairs(project.currentPairs)
            setAssignmentHistory(project.history)
            setProjectId(project.id)
            setProjectName(project.name)
        }
    }
    /* END PROJECT */

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

            const availablePaireesCopy = cloneDeep(availablePairees)
            const index2 = availablePaireesCopy.findIndex(p => p.id === pairee.id)
            availablePaireesCopy[index2].name = updatedName

            setPairees([...paireesCopy])
            setAvailablePairees([...availablePaireesCopy])
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

    const getHistoricalPairMap = (): Map<number, number[]> => {
        const pairMap: Map<number, number[]> = new Map<number, number[]>()

        for (let assignment of assignmentHistory) {
            for (let pair of assignment.pairs) {
                if (pair.pairee2) {
                    // add pairee2 to pairee1 ids
                    const p1Pairs = pairMap.get(pair.pairee1.id)
                    if (p1Pairs) {
                        pairMap.set(pair.pairee1.id, [...p1Pairs, pair.pairee2.id])
                    } else {
                        pairMap.set(pair.pairee1.id, [pair.pairee2.id])
                    }

                    // add pairee1 to pairee2 ids
                    const p2Pairs = pairMap.get(pair.pairee2.id)
                    if (p2Pairs) {
                        pairMap.set(pair.pairee2.id, [...p2Pairs, pair.pairee1.id])
                    } else {
                        pairMap.set(pair.pairee2.id, [pair.pairee1.id])
                    }
                }
            }
        }

        return pairMap
    }

    const generatePairs = () => {
        setPairingState(PairingState.GENERATING)
        let pairs: Pair[] = []
        let available: Pairee[] = cloneDeep(availablePairees)
        let freeLanes: Lane[] = cloneDeep(lanes)

        const historicalPairsMap = getHistoricalPairMap()
        console.log('history:', historicalPairsMap)

        while (available.length) {
            const p1 = available[0]
            console.log('finding best match for', p1.id, p1.name)

            // who's paired the least with p1
            let leastPairedId: number | undefined
            let leastPairedCount: number | undefined
            for (let pair of available) {
                if (pair.id !== p1.id) {
                    const ids = historicalPairsMap.get(pair.id)
                    const count = ids?.filter(id => id === p1.id).length || 0
                    if (leastPairedCount === undefined || count < leastPairedCount) {
                        leastPairedId = pair.id
                        leastPairedCount = count
                    }
                }
            }
            const p2 = available.find(p => p.id === leastPairedId)
            console.log('matched:', p2?.id, p2?.name)

            const lane = freeLanes[0]
            const pair: Pair = {
                pairee1: p1,
                pairee2: p2,
                lane
            }
            pairs.push(pair)
            freeLanes.splice(0, 1)

            available.splice(available.indexOf(p1), 1)
            if (p2 !== undefined) {
                available.splice(available.indexOf(p2), 1)
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

    useEffect(() => {
        if (projectId && projectName) {
            const projectUpdates: Project = {
                id: projectId,
                name: projectName,
                pairees,
                availablePairees,
                pairingStatus: pairingState,
                lanes,
                currentPairs,
                history: assignmentHistory,
            }
            handleUpdateProject(projectUpdates)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairingState, pairees, availablePairees, currentPairs, lanes, assignmentHistory])
    
    const contextValue: PairminatorContextT = {
        projectId,
        projectName,
        loadProject,
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