import { createContext, useContext, useEffect, useState } from "react"
import { RecordedPairs, Lane, Pair, Pairee, Project } from "../models/interface"
import { cloneDeep, isEqual } from 'lodash'
import { PairingState } from "../models/enum"
import { useDatabaseContext } from "./DatabaseContext"
import { useAuthContext } from "./AuthContext"

const getNextId = (ids: number[]): number => {
    return ids.length > 0
        ? Math.max(...ids) + 1
        : 1
}

export interface PairminatorContextT {
    project: Project | null
    addPairee: (name: string) => void
    updatePairee: (id: number, updatedName: string) => void
    deletePairee: (id: number) => void
    togglePaireeAvailability: (pairee: Pairee) => void
    assignPairs: () => void
    resetCurrentPairs: () => void
    recordCurrentPairs: () => void
}

export const PairminatorContext = createContext<PairminatorContextT | undefined>(undefined)

export const usePairminatorContext  = () => {
    const context = useContext(PairminatorContext)
    if (context === undefined) {
        throw new Error('usePairminatorContext must be used within a Pairminator Provider')
    }
    return context
}

interface Props {
    children: React.ReactNode
}

export const LOCAL_STORAGE_PROJECT_KEY = 'pairminatorActiveProjectId'

export const PairminatorProvider: React.FC<Props> = ({ children }) => {
    const { currentProject } = useAuthContext()

    /* BEGIN PROJECT */
    const [project, setProject] = useState<Project | null>(null)
    const { handleGetProject, handleUpdateProject } = useDatabaseContext()

    useEffect(() => {
        if (!project && currentProject) {
            setProject(currentProject)
        } else if (project && !currentProject) {
            setProject(null)
        }
    }, [currentProject, project])
    
    const addPairee = (name: string) => {
        if (project) {
            const newPairee: Pairee = {
                id: getNextId(project.pairees.map(p => p.id)),
                name,
            }

            setProject({
                ...project,
                pairees: [...project.pairees, newPairee],
                availablePairees: [...project.availablePairees, newPairee]
            })
        }
    }

    const updatePairee = (id: number, updatedName: string) => {
        if (project) {
            const paireesCopy: Pairee[] = cloneDeep(project.pairees)
            const availablePaireesCopy: Pairee[] = cloneDeep(project.availablePairees)

            const paireeIndex = paireesCopy.findIndex(p => p.id === id)
            if (paireeIndex !== -1) {
                paireesCopy[paireeIndex].name = updatedName
            }
    
            const availablePaireeIndex = availablePaireesCopy.findIndex(p => p.id === id)
            if (availablePaireeIndex !== -1) {
                availablePaireesCopy[availablePaireeIndex].name = updatedName
            }

            setProject({
                ...project,
                pairees: [...paireesCopy],
                availablePairees: [...availablePaireesCopy]
            })
        }
    }

    const deletePairee = (id: number) => {
        if (project) {
            const paireesCopy: Pairee[] = cloneDeep(project.pairees)
            const availablePaireesCopy: Pairee[] = cloneDeep(project.availablePairees)

            const paireeIndex = paireesCopy.findIndex(p => p.id === id)
            if (paireeIndex !== -1) {
                paireesCopy.splice(paireeIndex, 1)
            }
    
            const availablePaireeIndex = availablePaireesCopy.findIndex(p => p.id === id)
            if (availablePaireeIndex !== -1) {
                availablePaireesCopy.splice(availablePaireeIndex, 1)
            }

            setProject({
                ...project,
                pairees: [...paireesCopy],
                availablePairees: [...availablePaireesCopy]
            })
        }
    }

    const togglePaireeAvailability = (pairee: Pairee) => {
        if (project) {
            const availableCopy: Pairee[] = cloneDeep(project.availablePairees)
            const currentlyAvailable: boolean = availableCopy.some(p => p.id === pairee.id)
            if (currentlyAvailable) {
                const index: number = availableCopy.findIndex(p => p.id === pairee.id)
                availableCopy.splice(index, 1)
            } else {
                availableCopy.push(pairee)
            }

            setProject({
                ...project,
                availablePairees: [...availableCopy]
            })
        }
    }

    useEffect(() => {
        if (project) {
            const lanesNeeded: number = Math.ceil(project.availablePairees.length / 2)
            if (lanesNeeded !== project.lanes.length) {
                let lanes: Lane[] = []
                for (let i=0; i < lanesNeeded; i++) {
                    const lane: Lane = {
                        id: getNextId(lanes.map(l => l.id)),
                        name: `Lane ${i+1}`
                    }
                    lanes.push(lane)
                }
                setProject({
                    ...project,
                    lanes
                })
            }
        }
    }, [project])

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
        const sortedAvailable = project?.availablePairees.sort((a, b) => a.id - b.id) || []

        // build map of pair frequencies
        for (let pairee1 of sortedAvailable) {
            for (let pairee2 of sortedAvailable) {
                if (pairee1.id !== pairee2.id) {
                    const pairString = getPairString(pairee1, pairee2)
                    if (!pairMap.has(pairString)) {
                        const pairHistory = project?.recordedPairsHistory.filter(h =>
                            h.pairs.some(p =>
                                (p.pairee1.id === pairee1.id && p.pairee2?.id === pairee2.id) ||
                                (p.pairee1.id === pairee2.id && p.pairee2?.id === pairee1.id)
                            )
                        ) || []
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
            const soloHistory = project?.recordedPairsHistory.filter(h =>
                h.pairs.some(p => p.pairee1.id === pairee.id && !p.pairee2)
            ) || []
            soloCounts.set(pairee.id, soloHistory.length)
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
        if (project) {
            setProject({
                ...project,
                pairingStatus: PairingState.ASSIGNING
            })
    
            let pairs: Pair[] = []
            let available: Pairee[] = cloneDeep(project.availablePairees)
            let freeLanes: Lane[] = cloneDeep(project.lanes)
    
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
    
            setProject({
                ...project,
                currentPairs: [...pairs],
                pairingStatus: PairingState.ASSIGNED
            })
        }
    }

    const resetCurrentPairs = () => {
        if (project) {
            setProject({
                ...project,
                currentPairs: null,
                pairingStatus: PairingState.INITIAL
            })
        }
    }

    const recordCurrentPairs = () => {
        if (project && project.currentPairs) {
            const recordedPairs: RecordedPairs = {
                pairs: project.currentPairs,
                date: new Date()
            }
            setProject({
                ...project,
                recordedPairsHistory: [...project.recordedPairsHistory, recordedPairs]
            })
        }
    }

    useEffect(() => {
        async function saveProject() {
            if (project) {
                const remoteProject = await handleGetProject(project.id)

                if (remoteProject) {
                    // check if project has changed
                    if (isEqual(project.pairees, remoteProject.pairees)
                        && isEqual(project.availablePairees, remoteProject.availablePairees)
                        && isEqual(project.pairingStatus, remoteProject.pairingStatus)
                        && isEqual(project.lanes, remoteProject.lanes)
                        && isEqual(project.currentPairs, remoteProject.currentPairs)
                        && isEqual(project.recordedPairsHistory, remoteProject.recordedPairsHistory)) {
                        return
                    }

                    console.log('syncing project to DB')
                    handleUpdateProject(project)
                }
            }
        }
        saveProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project])
    
    const contextValue: PairminatorContextT = {
        project,
        addPairee,
        updatePairee,
        deletePairee,
        togglePaireeAvailability,
        assignPairs,
        resetCurrentPairs,
        recordCurrentPairs,
    }

    return (
        <PairminatorContext.Provider value={contextValue}>
            {children}
        </PairminatorContext.Provider>
    )
}