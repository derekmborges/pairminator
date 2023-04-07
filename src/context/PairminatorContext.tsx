import { createContext, useContext, useEffect, useState } from "react"
import { RecordedPairs, Lane, Pair, Pairee, Project } from "../models/interface"
import { PairingState } from "../models/enum"
import { COLLECTION_CURRENT_PAIRS, COLLECTION_LANES, COLLECTION_PAIREES, COLLECTION_PROJECTS, useDatabaseContext } from "./DatabaseContext"
import { useAuthContext } from "./AuthContext"
import { collection, DocumentSnapshot, onSnapshot, orderBy, QueryDocumentSnapshot, QuerySnapshot } from "@firebase/firestore"
import { doc, query } from "firebase/firestore"
import { database } from "../firebase"
import { laneConverter, pairConverter, paireeConverter, projectConverter } from "../lib/converter"
import { cloneDeep } from "lodash"

export interface PairminatorContextT {
    project: Project | null
    pairees: Pairee[] | null
    lanes: Lane[] | null
    currentPairs: Pair[] | null
    addPairee: (name: string) => Promise<boolean>
    updatePairee: (updatedPairee: Pairee) => Promise<boolean>
    deletePairee: (id: string) => Promise<boolean>
    togglePaireeAvailability: (pairee: Pairee) => Promise<boolean>
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

export const PairminatorProvider: React.FC<Props> = ({ children }) => {
    const { currentProjectId } = useAuthContext()
    const {
        handleAddPairee,
        handleDeletePairee,
        handleUpdatePairee,
        handleUpdateLanes,
        handleUpdateProject,
        handleSetCurrentPairs,
    } = useDatabaseContext()

    const [project, setProject] = useState<Project | null>(null)
    const [watchData, setWatchData] = useState<boolean>(false)

    const [pairees, setPairees] = useState<Pairee[] | null>(null)
    const [lanes, setLanes] = useState<Lane[] | null>(null)
    const [currentPairs, setCurrentPairs] = useState<Pair[] | null>(null)
    const [recordedPairsHistory, setRecordedPairsHistory] = useState<RecordedPairs[] | null>(null)

    const subscribeProjectData = (projectId: string) => {
        console.log('watching project document')
        const unsub = onSnapshot(
            doc(database, COLLECTION_PROJECTS, projectId)
                .withConverter(projectConverter),
            (doc: DocumentSnapshot<Project | undefined>) => {
            const project = doc.data()
            if (project) {
                setProject(project)
            }
        });
        return () => {
            console.log('unsubscribing from project document')
            unsub();
        }
    }

    const subscribePairees = (projectId: string) => {
        if (project) {
            console.log('watching pairee subcollection')
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const paireesQuery = query(collection(projectRef, COLLECTION_PAIREES), orderBy("name")).withConverter(paireeConverter)
            const unsub = onSnapshot(paireesQuery, (querySnapshot: QuerySnapshot<Pairee | undefined>) => {
                console.log('pairees updated')
                let pairees: Pairee[] = []
                querySnapshot.forEach((result: QueryDocumentSnapshot<Pairee | undefined>) => {
                    const pairee = result.data()
                    if (pairee) {
                        pairees.push(pairee)
                    }
                })
                setPairees([...pairees])
            })
            return () => {
                console.log('unsubscribing from pairee subcollection')
                unsub()
            }
        }
    }

    const subscribeLanes = (projectId: string) => {
        if (project) {
            console.log('watching lane subcollection')
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const lanesQuery = query(collection(projectRef, COLLECTION_LANES), orderBy("number")).withConverter(laneConverter)
            const unsub = onSnapshot(lanesQuery, (querySnapshot: QuerySnapshot<Lane | undefined>) => {
                console.log('lanes updated')
                let lanes: Lane[] = []
                querySnapshot.forEach((result: QueryDocumentSnapshot<Lane | undefined>) => {
                    const lane = result.data()
                    if (lane) {
                        lanes.push(lane)
                    }
                })
                setLanes([...lanes])
            })
            return () => {
                console.log('unsubscribing from lane subcollection')
                unsub()
            }
        }
    }

    const subscribeCurrentPairs = (projectId: string) => {
        if (project) {
            console.log('watching currentPairs subcollection')
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const currentPairsQuery = query(collection(projectRef, COLLECTION_CURRENT_PAIRS)).withConverter(pairConverter)
            const unsub = onSnapshot(currentPairsQuery, (querySnapshot: QuerySnapshot<Pair | undefined>) => {
                console.log('current pairs updated')
                let currentPairs: Pair[] = []
                if (querySnapshot.empty) {
                    setCurrentPairs(null)
                } else {
                    querySnapshot.forEach((result: QueryDocumentSnapshot<Pair | undefined>) => {
                        const pair = result.data()
                        if (pair) {
                            currentPairs.push(pair)
                        }
                    })
                    setCurrentPairs(currentPairs)
                }
            })
            return () => {
                console.log('unsubscribing from currentPairs subcollections')
                unsub()
            }
        }
    }

    useEffect(() => {
        if (currentProjectId) {
            const unsub = subscribeProjectData(currentProjectId)
            return unsub
        } else {
            setWatchData(false)
            setProject(null)
            setCurrentPairs(null)
            setPairees(null)
            setLanes(null)
        }
    }, [currentProjectId])

    useEffect(() => {
        if (project && !watchData) {
            setWatchData(true)
        }
    }, [project, watchData])

    useEffect(() => {
        if (watchData && project) {
            const unsubs = [
                subscribePairees(project.id),
                subscribeLanes(project.id),
                subscribeCurrentPairs(project.id)
            ]
            return () => {
                unsubs.forEach(unsub => {
                    if (unsub) {
                        unsub()
                    }
                })
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchData])

    const addPairee = async (name: string): Promise<boolean> => {
        if (project) {
            return await handleAddPairee(project.id, name)
        }
        return false
    }

    const updatePairee = async (updatedPairee: Pairee): Promise<boolean> => {
        if (project) {
            return await handleUpdatePairee(project.id, updatedPairee)
        }
        return false
    }

    const deletePairee = async (id: string): Promise<boolean> => {
        if (project) {
            return await handleDeletePairee(project.id, id)
        }
        return false
    }

    const togglePaireeAvailability = async (pairee: Pairee): Promise<boolean> => {
        if (project) {
            return await handleUpdatePairee(project.id, {
                ...pairee,
                available: !pairee.available
            })
        }
        return false
    }

    useEffect(() => {
        if (project) {
            const availablePairees = pairees?.filter(p => p.available) || []
            const lanesNeeded: number = Math.ceil(availablePairees.length / 2)
            const existingLanes = lanes?.length || 0
            if (existingLanes !== lanesNeeded) {
                handleUpdateLanes(project.id, lanesNeeded)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairees])

    interface DatedPairCount {
        count: number
        lastDate: Date | undefined
    }

    // Map format: "<pairee1Id>-<pairee2Id>": #
    // Represents every pair that is available and the frequency of that pair
    // Sorted by solo frequency, pair frequency, and pair recency
    const getAvailablePairHistoryMap = (): Map<string, DatedPairCount> => {
        const pairMap: Map<string, DatedPairCount> = new Map()
        const soloCounts: Map<string, number> = new Map()
        const getPairString = (p1: Pairee, p2: Pairee): string => {
            // const firstId = Math.min(p1.id, p2.id)
            // const secondId = p1.id === firstId ? p2.id : p1.id
            return (pairMap.has(`${p1.id}-${p2.id}`)) ? `${p1.id}-${p2.id}` : `${p2.id}-${p1.id}`
        }
        const available = pairees?.filter(p => p.available) || []

        // build map of pair frequencies
        for (let pairee1 of available) {
            for (let pairee2 of available) {
                if (pairee1.id !== pairee2.id) {
                    const pairString = getPairString(pairee1, pairee2)
                    if (!pairMap.has(pairString)) {
                        const pairHistory = recordedPairsHistory?.filter(h =>
                            h.pairs.some(p =>
                                (p.pairee1Id === pairee1.id && p.pairee2Id === pairee2.id) ||
                                (p.pairee1Id === pairee2.id && p.pairee2Id === pairee1.id)
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
        for (let pairee of available) {
            const soloHistory = recordedPairsHistory?.filter(h =>
                h.pairs.some(p => p.pairee1Id === pairee.id && !p.pairee2Id)
            ) || []
            soloCounts.set(pairee.id, soloHistory.length)
        }
        console.log('solos:', soloCounts)

        const getPaireeIdFromKey = (key: string, i: number): string => key.split('-')[i]
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
                        const soloFreqA1 = soloCounts.get(getPaireeIdFromKey(a[0], 0)) || 0
                        const soloFreqA2 = soloCounts.get(getPaireeIdFromKey(a[0], 1)) || 0
                        const soloFreqB1 = soloCounts.get(getPaireeIdFromKey(b[0], 0)) || 0
                        const soloFreqB2 = soloCounts.get(getPaireeIdFromKey(b[0], 1)) || 0
                        return Math.min(soloFreqB1, soloFreqB2) - Math.min(soloFreqA1, soloFreqA2)
                    }
                })
        )
    }

    const assignPairs = async () => {
        if (project) {
            await handleUpdateProject({
                ...project,
                pairingStatus: PairingState.ASSIGNING
            })
    
            let pairs: Pair[] = []
            let available: Pairee[] = cloneDeep(pairees?.filter(p => p.available) || [])
            let freeLanes: Lane[] = cloneDeep(lanes || [])
    
            const isAvailable = (id: string): boolean => available.some(p => p.id === id)
            const addPair = (pairee1: Pairee, pairee2: Pairee | undefined) => {
                const lane = freeLanes[0]
    
                console.log('assignment:', pairee1.name, '+', pairee2?.name || 'solo')
                const pair: Pair = {
                    pairee1Id: pairee1.id,
                    ...(pairee2 && {pairee2Id: pairee2.id}),
                    laneId: lane.id
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
                        const paireeIds = pairString.split('-')
    
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
    
            await handleSetCurrentPairs(project.id, pairs)

            await handleUpdateProject({
                ...project,
                pairingStatus: PairingState.ASSIGNED
            })
        }
    }

    const resetCurrentPairs = async (): Promise<boolean> => {
        if (project) {
            const resetSuccess = await handleSetCurrentPairs(project.id, null)
            const updateSuccess = await handleUpdateProject({
                ...project,
                pairingStatus: PairingState.INITIAL
            })
            return resetSuccess && updateSuccess
        }
        return false
    }

    const recordCurrentPairs = () => {
        if (project && currentPairs) {
            // const recordedPairs: RecordedPairs = {
            //     pairs: project.currentPairs,
            //     date: new Date()
            // }
            // setProject({
            //     ...project,
            //     recordedPairsHistory: [...project.recordedPairsHistory, recordedPairs],
            //     pairingStatus: PairingState.RECORDED
            // })
        }
    }
    
    const contextValue: PairminatorContextT = {
        project,
        pairees,
        lanes,
        currentPairs,
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