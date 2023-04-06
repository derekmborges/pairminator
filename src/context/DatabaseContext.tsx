import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "@firebase/firestore";
import { FirebaseError } from "firebase/app";
import { createContext, useContext } from "react";
import { database } from "../firebase";
import { laneConverter, pairConverter, paireeConverter, projectConverter } from "../lib/converter";
import { PairingState } from "../models/enum";
import { Lane, Pair, Pairee, Project } from "../models/interface";


interface DatabaseContextT {
    handleAddProject: (id: string, name: string) => Promise<Project>
    handleGetProject: (projectId: string) => Promise<Project | undefined>
    handleUpdateProject: (project: Project) => void
    handleAddPairee: (projectId: string, name: string) => Promise<boolean>
    handleUpdatePairee: (projectId: string, pairee: Pairee) => Promise<boolean>
    handleDeletePairee: (projectId: string, paireeId: string) => Promise<boolean>
    handleAddLane: (projectId: string, name: string, number: number) => Promise<boolean>
    handleSetCurrentPairs: (projectId: string, pairs: Pair[] | null) => Promise<boolean>
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

    const handleDeletePairee = async (projectId: string, paireeId: string): Promise<boolean> => {
        try {
            const paireeRef = doc(database, COLLECTION_PROJECTS, projectId, COLLECTION_PAIREES, paireeId)
            await deleteDoc(paireeRef)
            return true
        } catch (e) {
            console.error('Error deleting pairee:', e)
            return false
        }
    }

    const handleAddLane = async (projectId: string, name: string, number: number): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            const laneRef = await addDoc(collection(projectRef, COLLECTION_LANES), {})
            const newLane: Lane = {
                id: laneRef.id,
                name,
                number
            }
            await setDoc(laneRef.withConverter(laneConverter), newLane)
            return true
        } catch (e) {
            console.error('Error adding lane:', e)
            return false
        }
    }

    const handleSetCurrentPairs = async (projectId: string, pairs: Pair[] | null): Promise<boolean> => {
        try {
            const projectRef = doc(database, COLLECTION_PROJECTS, projectId)
            if (pairs) {
                console.log('setting current pairs')
                for (let pair of pairs) {
                    await addDoc(collection(projectRef, COLLECTION_CURRENT_PAIRS), pair)
                }
            } else {
                console.log('resetting current pairs')
                const currentPairsQuery = query(collection(projectRef, COLLECTION_CURRENT_PAIRS)).withConverter(pairConverter)
                const snapshot = await getDocs(currentPairsQuery)
                snapshot.forEach(async (result) => await deleteDoc(result.ref))
                // let existingPairIds: string[] = []
                // snapshot.forEach((result) => existingPairIds.push(result.id))
                // for (let pairId of existingPairIds) {
                //     const pairDoc = await getDoc(doc(projectRef, COLLECTION_CURRENT_PAIRS, pairId))
                //     await deleteDoc(pairDoc.ref)
                // }
            }
            return true
        } catch (e) {
            console.error('Error setting current pairs:', e)
            return false
        }
    }

    const handleGetProject = async (projectId: string): Promise<Project | undefined> => {
        const projectDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId).withConverter(projectConverter))
        return projectDoc.data()
    }

    const handleUpdateProject = async (project: Project) => {
        const projectRef = doc(database, COLLECTION_PROJECTS, project.id)
        const projectUpdates: Project = {
            id: project.id,
            name: project.name,
            pairingStatus: project.pairingStatus
        }
        await setDoc(projectRef, projectUpdates)
    }

    const contextValue: DatabaseContextT = {
        handleAddProject,
        handleGetProject,
        handleUpdateProject,
        handleAddPairee,
        handleUpdatePairee,
        handleDeletePairee,
        handleAddLane,
        handleSetCurrentPairs
    }

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    )
}
