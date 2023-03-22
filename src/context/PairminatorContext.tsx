import { createContext, useContext, useEffect, useState } from "react";
import { RecordedPairs, Lane, Pair, Pairee, Project } from "../models/interface";
import { cloneDeep, isEqual } from 'lodash'
import { PairingState } from "../models/enum";
import { useDatabaseContext } from "./DatabaseContext";

const getNextId = (ids: number[]): number => {
    return ids.length > 0
        ? Math.max(...ids) + 1
        : 1;
}

export interface PairminatorContextT {
    initializing: boolean;
    activeProject: Project | null;
    logIntoProject: (inputProjectName: string, inputPassword: string) => Promise<boolean>;
    logOutOfProject: () => void;
    isProjectNameAvailable: (name: string) => Promise<boolean>;
    addProject: (projectName: string, password: string) => Promise<Project>;
    pairees: Pairee[];
    addPairee: (name: string) => void;
    updatePairee: (id: number, updatedName: string) => void;
    deletePairee: (id: number) => void;
    availablePairees: Pairee[];
    togglePaireeAvailability: (pairee: Pairee) => void;
    pairingState: PairingState;
    currentPairs: Pair[] | null;
    lanes: Lane[];
    assignPairs: () => void;
    resetCurrentPairs: () => void;
    recordCurrentPairs: () => void;
    recordedPairsHistory: RecordedPairs[];
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

export const LOCAL_STORAGE_PROJECT_KEY = 'pairminatorActiveProjectId'

export const PairminatorProvider: React.FC<Props> = ({ children }) => {
    const [initializing, setInitializing] = useState<boolean>(true)

    /* BEGIN PROJECT */
    const { handleAddProject, handleSearchProjects, handleGetProject, handleUpdateProject } = useDatabaseContext()
    const [activeProject, setActiveProject] = useState<Project | null>(null)

    const isProjectNameAvailable = async (name: string): Promise<boolean> => {
        const projects = await handleSearchProjects(name)
        return projects.length === 0
    }

    const addProject = async (projectName: string, password: string): Promise<Project> => {
        const project = await handleAddProject(projectName, password)
        loadProject(project)
        return project
    }

    const loadProject = (project: Project) => {
        setActiveProject(project)
        setPairees(project.pairees)
        setAvailablePairees(project.availablePairees)
        setPairingState(project.pairingStatus)
        setLanes(project.lanes)
        setCurrentPairs(project.currentPairs)
        setRecordedPairsHistory(project.recordedPairsHistory)
        window.localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, project.id)
    }

    const logIntoProject = async (inputProjectName: string, inputPassword: string): Promise<boolean> => {
        const projects = await handleSearchProjects(inputProjectName)
        if (projects.length === 1) {
            const project = projects[0]
            if (project.password === inputPassword) {
                loadProject(project)
                return true
            }
        }
        return false
    }

    const logOutOfProject = () => {
        setActiveProject(null)
        window.localStorage.removeItem(LOCAL_STORAGE_PROJECT_KEY)
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
        const paireeIndex = pairees.findIndex(p => p.id === id)
        if (paireeIndex !== -1) {
            const paireesCopy: Pairee[] = cloneDeep(pairees);
            paireesCopy[paireeIndex].name = updatedName
            setPairees([...paireesCopy])
        }

        const availablePaireeIndex = availablePairees.findIndex(p => p.id === id)
        if (availablePaireeIndex !== -1) {
            const availablePaireesCopy = cloneDeep(availablePairees)
            availablePaireesCopy[availablePaireeIndex].name = updatedName
            setAvailablePairees([...availablePaireesCopy])
        }
    }

    const deletePairee = (id: number) => {
        const paireeIndex = pairees.findIndex(p => p.id === id);
        if (paireeIndex !== -1) {
            const paireesCopy = cloneDeep(pairees)
            paireesCopy.splice(paireeIndex, 1)
            setPairees([...paireesCopy])
        }

        const availablePaireeIndex = availablePairees.findIndex(p => p.id === id)
        if (availablePaireeIndex !== -1) {
            const availablePaireesCopy = cloneDeep(availablePairees)
            availablePaireesCopy.splice(availablePaireeIndex, 1)
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

        for (let assignment of recordedPairsHistory) {
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

    const assignPairs = () => {
        setPairingState(PairingState.ASSIGNING)
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
                ...(p2 && {pairee2: p2}),
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
        setPairingState(PairingState.ASSIGNED)
    }

    const resetCurrentPairs = () => {
        setPairingState(PairingState.INITIAL)
        setCurrentPairs(null)
    }

    const [recordedPairsHistory, setRecordedPairsHistory] = useState<RecordedPairs[]>([])
    const recordCurrentPairs = () => {
        if (currentPairs) {
            const recordedPairs: RecordedPairs = {
                pairs: currentPairs,
                date: new Date()
            }
            setRecordedPairsHistory([...recordedPairsHistory, recordedPairs])
            setPairingState(PairingState.RECORDED)
        }
    }
    /* END PAIRS */

    useEffect(() => {
        async function loadFromStorage() {
            const storedProjectId = window.localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY)
            if (storedProjectId) {
                const project = await handleGetProject(storedProjectId)
                if (project) {
                    loadProject(project)
                }
            }
            setInitializing(false)
        }
        loadFromStorage()
    }, [handleGetProject])

    useEffect(() => {
        async function saveProject() {
            if (activeProject) {
                const project = await handleGetProject(activeProject.id)

                if (project) {
                    // check if project has changed
                    if (isEqual(project.pairees, pairees)
                        && isEqual(project.availablePairees, availablePairees)
                        && isEqual(project.pairingStatus, pairingState)
                        && isEqual(project.lanes, lanes)
                        && isEqual(project.currentPairs, currentPairs)
                        && isEqual(project.recordedPairsHistory, recordedPairsHistory)) {
                        console.log('DB is up to date')
                        return
                    }

                    console.log('syncing project to DB')
                    const projectUpdates: Project = {
                        ...project,
                        pairees,
                        availablePairees,
                        pairingStatus: pairingState,
                        lanes,
                        currentPairs,
                        recordedPairsHistory,
                    }
                    handleUpdateProject(projectUpdates)
                }
            }
        }
        saveProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairingState, pairees, availablePairees, currentPairs, lanes, recordedPairsHistory])
    
    const contextValue: PairminatorContextT = {
        initializing,
        activeProject,
        logIntoProject,
        logOutOfProject,
        isProjectNameAvailable,
        addProject,
        pairees,
        addPairee,
        updatePairee,
        deletePairee,
        availablePairees,
        togglePaireeAvailability,
        pairingState,
        currentPairs,
        lanes,
        assignPairs,
        resetCurrentPairs,
        recordCurrentPairs,
        recordedPairsHistory,
    };

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    );
}