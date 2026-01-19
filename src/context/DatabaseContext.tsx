import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc } from "@firebase/firestore";
import { getDoc, orderBy } from "firebase/firestore";
import { createContext, useContext } from "react";
import { database } from "../firebase";
import { laneConverter, pairConverter, paireeConverter, projectConverter, historyRecordConverter, pairmanRecordConverter } from "../lib/converter";
import { PairingState } from "../models/enum";
import { Lane, Pair, Pairee, Project, HistoryRecord, PairmanRecord } from "../models/interface";


interface DatabaseContextT {
    handleAddProject: (id: string, name: string) => Promise<Project>
    handleGetProject: (projectId: string) => Promise<Project | undefined>
    handleUpdateProject: (project: Project) => Promise<boolean>
    handleAddPairee: (projectId: string, name: string) => Promise<boolean>
    handleUpdatePairee: (projectId: string, pairee: Pairee) => Promise<boolean>
    handleDeactivatePairee: (projectId: string, paireeId: string) => Promise<boolean>
    handleDeletePairee: (projectId: string, paireeId: string) => Promise<boolean>
    handleUpdateLanes: (projectId: string, lanesNeeded: number) => Promise<boolean>
    handleSetCurrentPairs: (projectId: string, pairs: Pair[] | null) => Promise<boolean>
    handleRecordPairs: (projectId: string, currentPairs: Pair[]) => Promise<boolean>
    handleDeleteHistoryRecord: (projectId: string, historyId: string) => Promise<boolean>
    handleAddPairmanHistory: (projectId: string, pairmanRecord: PairmanRecord) => Promise<boolean>
}

export const DatabaseContext = createContext<DatabaseContextT | undefined>(undefined);

export const useDatabaseContext = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabaseContext must be used within a Database Provider');
    }
    return context;
};

export interface ProviderProps {
    children: React.ReactNode
}

export const COLLECTION_PROJECTS = 'projects'
export const SUBCOLLECTION_PAIREES = 'pairees'
export const SUBCOLLECTION_LANES = 'lanes'
export const SUBCOLLECTION_CURRENT_PAIRS = 'currentPairs'
export const SUBCOLLECTION_HISTORY = 'history'
export const SUBCOLLECTION_PAIRMEN = 'pairmen'

export const DatabaseProvider: React.FC<ProviderProps> = ({ children }) => {

    const handleAddProject = async (id: string, name: string): Promise<Project> => {
        const projectRef = doc(database, COLLECTION_PROJECTS, id).withConverter(projectConverter)

        const newProject: Project = {
            id,
            name,
            pairingStatus: PairingState.INITIAL,
            currentPairman: null
        }
        await setDoc(projectRef, newProject)

        return newProject
    }

    const handleAddPairee = async (projectId: string, name: string): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const paireeRef = await addDoc(collection(projectRef, SUBCOLLECTION_PAIREES), {})
            const newPairee: Pairee = {
                id: paireeRef.id,
                name,
                available: true,
                active: true
            }
            await setDoc(paireeRef.withConverter(paireeConverter), newPairee)
            return true
        } catch (e) {
            console.error('Error adding pairee:', e)
            return false
        }
    }

    const handleUpdatePairee = async (projectId: string, pairee: Pairee): Promise<boolean> => {
        try {
            const paireeRef = doc(database, COLLECTION_PROJECTS, projectId, SUBCOLLECTION_PAIREES, pairee.id).withConverter(paireeConverter)
            await updateDoc(paireeRef, pairee)
            return true
        } catch (e) {
            console.error('Error updating pairee:', e)
            return false
        }
    }

    const handleDeactivatePairee = async (projectId: string, paireeId: string): Promise<boolean> => {
        try {
            const paireeDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId, SUBCOLLECTION_PAIREES, paireeId).withConverter(paireeConverter))
            const pairee = paireeDoc.data()
            if (pairee) {
                await updateDoc(paireeDoc.ref, {
                    ...pairee,
                    active: false,
                })
                return true
            }
            return false
        } catch (e) {
            console.error('Error deactivate pairee:', e)
            return false
        }
    }

    const handleDeletePairee = async (projectId: string, paireeId: string): Promise<boolean> => {
        try {
            const paireeDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId, SUBCOLLECTION_PAIREES, paireeId).withConverter(paireeConverter))
            const pairee = paireeDoc.data()
            if (pairee) {
                await deleteDoc(paireeDoc.ref)
                return true
            }
            return false
        } catch (e) {
            console.error('Error deleting pairee:', e)
            return false
        }
    }

    const handleUpdateLanes = async (projectId: string, lanesNeeded: number): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)

            const lanesSnapshot = await getDocs(query(collection(projectRef, SUBCOLLECTION_LANES), orderBy("number")).withConverter(laneConverter))
            const existingLanes = lanesSnapshot.size

            if (lanesNeeded > existingLanes) {
                // Add missing lanes
                for (let i = existingLanes+1; i <= lanesNeeded; i++) {
                    const laneRef = await addDoc(collection(projectRef, SUBCOLLECTION_LANES), {})
                    const newLane: Lane = {
                        id: laneRef.id,
                        name: `Lane ${i}`,
                        number: i
                    }
                    await setDoc(laneRef.withConverter(laneConverter), newLane)
                }
            }
            return true
        } catch (e) {
            console.error('Error updating lanes:', e)
            return false
        }
    }

    const handleSetCurrentPairs = async (projectId: string, pairs: Pair[] | null): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            if (pairs) {
                for (let pair of pairs) {
                    await addDoc(collection(projectRef, SUBCOLLECTION_CURRENT_PAIRS), pair)
                }
            } else {
                const currentPairsQuery = query(collection(projectRef, SUBCOLLECTION_CURRENT_PAIRS)).withConverter(pairConverter)
                const snapshot = await getDocs(currentPairsQuery)
                snapshot.forEach(async (result) => await deleteDoc(result.ref))
            }
            return true
        } catch (e) {
            console.error('Error setting current pairs:', e)
            return false
        }
    }

    const handleGetProject = async (projectId: string): Promise<Project | undefined> => {
        try {
            const projectDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId).withConverter(projectConverter))
            return projectDoc.data()
        } catch (e) {
            console.error('Error looking up project:', e)
        }
    }

    const handleUpdateProject = async (project: Project): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, project.id)
            await setDoc(projectRef, {...project})
            return true
        } catch (e) {
            console.error('Error updating project:', e)
            return false
        }
    }

    const handleRecordPairs = async (projectId: string, currentPairs: Pair[]): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const historyRecordRef = await addDoc(collection(projectRef, SUBCOLLECTION_HISTORY), {})
            const newHistoryRecord: HistoryRecord = {
                id: historyRecordRef.id,
                pairs: currentPairs,
                date: new Date(),
            }
            await setDoc(historyRecordRef.withConverter(historyRecordConverter), newHistoryRecord)
            return true
        } catch (e) {
            console.error('Error recording current pairs:', e)
            return false
        }
    }

    const handleDeleteHistoryRecord = async (projectId: string, historyId: string): Promise<boolean> => {
        try {
            const historyRecordDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId, SUBCOLLECTION_HISTORY, historyId).withConverter(historyRecordConverter))
            const historyRecord = historyRecordDoc.data()
            if (historyRecord) {
                await deleteDoc(historyRecordDoc.ref)
                return true
            }
            return false
        } catch (e) {
            console.error('Error deleting history doc:', e)
            return false
        }
    }

    const handleAddPairmanHistory = async (projectId: string, pairmanRecord: PairmanRecord): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const pairmanRecordRef = await addDoc(collection(projectRef, SUBCOLLECTION_PAIRMEN), {})
            await setDoc(pairmanRecordRef.withConverter(pairmanRecordConverter), pairmanRecord)
            return true
        } catch (e) {
            console.error('Error adding pairman record to history:', e)
            return false
        }
    }

    const contextValue: DatabaseContextT = {
        handleAddProject,
        handleGetProject,
        handleUpdateProject,
        handleAddPairee,
        handleUpdatePairee,
        handleDeactivatePairee,
        handleDeletePairee,
        handleUpdateLanes,
        handleSetCurrentPairs,
        handleRecordPairs,
        handleDeleteHistoryRecord,
        handleAddPairmanHistory,
    }

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    )
}
