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

    interface DatedPairCount {
        count: number
        lastDate: Date | undefined
    }

    // Map format: "<pairee1Id>-<pairee2Id>": #
    // Represents every pair that is available and the frequency of that pair
    // Sorted by solo frequency, pair frequency, and pair recency
    const getAvailablePairHistoryMap = (): Map<string, DatedPairCount> => {
        const pairMap: Map<string, DatedPairCount> = new Map()
        const soloCounts: Map<number, number> = new Map()
        const getPairString = (p1: Pairee, p2: Pairee): string => {
            const firstId = Math.min(p1.id, p2.id)
            const secondId = p1.id === firstId ? p2.id : p1.id
            return `${firstId}-${secondId}`
        }
        const sortedAvailable = availablePairees.sort((a, b) => a.id - b.id)

        // build map of pair frequencies
        for (let pairee1 of sortedAvailable) {
            for (let pairee2 of sortedAvailable) {
                if (pairee1.id !== pairee2.id) {
                    const pairString = getPairString(pairee1, pairee2)
                    if (!pairMap.has(pairString)) {
                        const pairHistory = recordedPairsHistory.filter(h =>
                            h.pairs.some(p =>
                                p.pairee1.id === pairee1.id && p.pairee2?.id === pairee2.id
                            )
                        )
                        pairMap.set(
                            pairString,
                            {
                                count: pairHistory.length,
                                lastDate: pairHistory.at(0)?.date
                            }
                        )
                    }
                }
            }
        }

        // build map of solo frequencies
        for (let pairee of sortedAvailable) {
            const soloCount: number = recordedPairsHistory.filter(h =>
                h.pairs.some(p => p.pairee1.id === pairee.id && !p.pairee2)
            ).length
            soloCounts.set(pairee.id, soloCount)
        }
        console.log('solos:', soloCounts)

        const getPaireeIdFromKey = (key: string, i: number): number => parseInt(key.split('-')[i])
        return new Map(
            [...pairMap]
                .sort((a, b) => {
                    if (a[1].lastDate && b[1].lastDate) {
                        // First sort by pair count
                        if (a[1].count !== b[1].count) {
                            return a[1].count - b[1].count

                        // Then sort by last paired date (asc)
                        } else {
                            return a[1].lastDate.valueOf() - b[1].lastDate.valueOf()
                        }
                    } else {
                        if (a[1].lastDate || b[1].lastDate) {
                            return a[1].count - b[1].count
                        }

                        // Lastly, sort by solo frequency
                        const soloFreqA1 = (soloCounts.get(getPaireeIdFromKey(a[0], 0)) || 0)
                        const soloFreqA2 = (soloCounts.get(getPaireeIdFromKey(a[0], 1)) || 0)
                        const soloFreqB1 = (soloCounts.get(getPaireeIdFromKey(b[0], 0)) || 0)
                        const soloFreqB2 = (soloCounts.get(getPaireeIdFromKey(b[0], 1)) || 0)
                        return Math.min(soloFreqB1, soloFreqB2) - Math.min(soloFreqA1, soloFreqA2)
                    }
                })
        )
    }

    const assignPairs = () => {
        setPairingState(PairingState.ASSIGNING)
        let pairs: Pair[] = []
        let available: Pairee[] = cloneDeep(availablePairees)
        let freeLanes: Lane[] = cloneDeep(lanes)

        const isAvailable = (id: number): boolean => available.some(p => p.id === id)
        const addPair = (pairee1: Pairee, pairee2: Pairee | undefined) => {
            const lane = freeLanes[0]

            console.log('assignment:', pairee1.name, '+', pairee2?.name || 'solo')
            const pair: Pair = {
                pairee1,
                ...(pairee2 && {pairee2}),
                lane
            }
            pairs.push(pair)

            // remove used data
            freeLanes.splice(0, 1)
            available.splice(available.indexOf(pairee1), 1)
            if (pairee2 !== undefined) {
                available.splice(available.indexOf(pairee2), 1)
            }
        }

        const sortedPairHistoryMap = getAvailablePairHistoryMap()
        console.log('the sorted history map:')
        console.log(sortedPairHistoryMap)

        while (freeLanes.length) {
            let pairee1
            let pairee2

            if (available.length > 1) {
                // loop over and prioritize the least-paired entries first
                for (let pairString of sortedPairHistoryMap.keys()) {
                    // Get pairee IDs
                    const paireeIds = pairString.split('-').map(value => parseInt(value))

                    // If either aren't available to pair, move on
                    if (paireeIds.some(id => !isAvailable(id))) {
                        continue
                    }

                    pairee1 = available.find(p => p.id === paireeIds[0])
                    pairee2 = available.find(p => p.id === paireeIds[1])
                    break
                }
            } else {
                pairee1 = available[0]
            }

            if (pairee1) {
                addPair(pairee1, pairee2)
            }
        }

        setCurrentPairs([...pairs])
        setPairingState(PairingState.ASSIGNED)
    }

    const resetCurrentPairs = () => {
        setCurrentPairs(null)
        setPairingState(PairingState.INITIAL)
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