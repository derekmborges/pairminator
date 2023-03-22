import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from "@firebase/firestore";
import { createContext, useContext } from "react";
import { database } from "../firebase";
import { projectConverter } from "../lib/converter";
import { PairingState } from "../models/enum";
import { Project } from "../models/interface";


interface DatabaseContextT {
    handleAddProject: (id: string, name: string) => Promise<Project>;
    handleSearchProjects: (nameSearch: string) => Promise<Project[]>;
    handleGetProject: (projectId: string) => Promise<Project | undefined>;
    handleUpdateProject: (project: Project) => void;
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

export const DatabaseProvider: React.FC<ProviderProps> = ({ children }) => {

    const handleAddProject = async (id: string, name: string): Promise<Project> => {
        const projectRef = doc(database, COLLECTION_PROJECTS, id).withConverter(projectConverter)
        const newProject: Project = {
            id,
            name,
            pairees: [],
            availablePairees: [],
            lanes: [],
            currentPairs: null,
            recordedPairsHistory: [],
            pairingStatus: PairingState.INITIAL,
        }
        await setDoc(projectRef, newProject)
        return newProject
    }

    const handleGetProject = async (projectId: string): Promise<Project | undefined> => {
        const projectDoc = await getDoc(doc(database, COLLECTION_PROJECTS, projectId).withConverter(projectConverter))
        return projectDoc.data()
    }

    const handleSearchProjects = async (nameSearch: string): Promise<Project[]> => {
        const projectQuery = query(collection(database, COLLECTION_PROJECTS), where('name', '==', nameSearch)).withConverter(projectConverter)
        const snapshot = await getDocs(projectQuery)
        let projects: Project[] = []
        snapshot.forEach((result) => {
            const project = result.data()
            if (project) {
                projects.push(project)
            }
        })
        return projects
    }

    const handleUpdateProject = async (project: Project) => {
        const projectRef = doc(database, COLLECTION_PROJECTS, project.id).withConverter(projectConverter)
        await setDoc(projectRef, project)
    }

    const contextValue: DatabaseContextT = {
        handleAddProject,
        handleSearchProjects,
        handleGetProject,
        handleUpdateProject,
    }

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    )
}
