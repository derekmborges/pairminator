import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc } from "@firebase/firestore";
import { getDoc, orderBy } from "firebase/firestore";
import { createContext, useContext } from "react";
import { database } from "../firebase";
import { laneConverter, pairConverter, paireeConverter, projectConverter, recordedPairsConverter } from "../lib/converter";
import { PairingState } from "../models/enum";
import { Lane, Pair, Pairee, Project, RecordedPairs } from "../models/interface";


interface DatabaseContextT {
    handleAddProject: (id: string, name: string) => Promise<Project>
    handleGetProject: (projectId: string) => Promise<Project | undefined>
    handleUpdateProject: (project: Project) => Promise<boolean>
    handleAddPairee: (projectId: string, name: string) => Promise<boolean>
    handleUpdatePairee: (projectId: string, pairee: Pairee) => Promise<boolean>
    handleDeactivatePairee: (projectId: string, paireeId: string) => Promise<boolean>
    handleUpdateLanes: (projectId: string, lanesNeeded: number) => Promise<boolean>
    handleSetCurrentPairs: (projectId: string, pairs: Pair[] | null) => Promise<boolean>
    handleRecordPairs: (projectId: string, currentPairs: Pair[]) => Promise<boolean>
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
export const COLLECTION_PAIREES = 'pairees'
export const COLLECTION_LANES = 'lanes'
export const COLLECTION_CURRENT_PAIRS = 'currentPairs'
export const COLLECTION_HISTORY = 'history'

export const DatabaseProvider: React.FC<ProviderProps> = ({ children }) => {

    const handleAddProject = async (id: string, name: string): Promise<Project> => {
        const projectRef = doc(database, COLLECTION_PROJECTS, id).withConverter(projectConverter)

        const newProject: Project = {
            id,
            name,
            pairingStatus: PairingState.INITIAL,
        }
        await setDoc(projectRef, newProject)

        return newProject
    }

    const handleAddPairee = async (projectId: string, name: string): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const paireeRef = await addDoc(collection(projectRef, COLLECTION_PAIREES), {})
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
            const paireeRef = doc(database, COLLECTION_PROJECTS, projectId, COLLECTION_PAIREES, pairee.id).withConverter(paireeConverter)
            await updateDoc(paireeRef, pairee)
            return true
        } catch (e) {
            console.error('Error updating pairee:', e)
            return false
        }
    }

    const handleDeactivatePairee = async (projectId: string, paireeId: string): Promise<boolean> => {
        try {
            const paireeDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId, COLLECTION_PAIREES, paireeId).withConverter(paireeConverter))
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

    const handleUpdateLanes = async (projectId: string, lanesNeeded: number): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)

            // Get existing lanes
            const lanesSnapshot = await getDocs(query(collection(projectRef, COLLECTION_LANES), orderBy("number")).withConverter(laneConverter))
            const existingLanes = lanesSnapshot.size

            if (lanesNeeded > existingLanes) {
                // Add missing lanes
                for (let i = existingLanes+1; i <= lanesNeeded; i++) {
                    const laneRef = await addDoc(collection(projectRef, COLLECTION_LANES), {})
                    const newLane: Lane = {
                        id: laneRef.id,
                        name: `Lane ${i}`,
                        number: i
                    }
                    await setDoc(laneRef.withConverter(laneConverter), newLane)
                }
            } else if (lanesNeeded < existingLanes) {
                // Delete extra lanes
                for (let i = existingLanes-1; i >= lanesNeeded; i--) {
                    const laneRef = lanesSnapshot.docs.at(i)?.ref
                    if (laneRef) {
                        await deleteDoc(laneRef)
                    }
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
                    await addDoc(collection(projectRef, COLLECTION_CURRENT_PAIRS), pair)
                }
            } else {
                const currentPairsQuery = query(collection(projectRef, COLLECTION_CURRENT_PAIRS)).withConverter(pairConverter)
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
            const recordedPairsRef = await addDoc(collection(projectRef, COLLECTION_HISTORY), {})
            const newRecordedPairs: RecordedPairs = {
                id: recordedPairsRef.id,
                pairs: currentPairs,
                date: new Date()
            }
            await setDoc(recordedPairsRef.withConverter(recordedPairsConverter), newRecordedPairs)
            return true
        } catch (e) {
            console.error('Error recording current pairs:', e)
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
        handleUpdateLanes,
        handleSetCurrentPairs,
        handleRecordPairs,
    }

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    )
}
