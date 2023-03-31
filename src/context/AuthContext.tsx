import { createContext, useContext, useEffect, useState } from "react";
import { Project } from "../models/interface";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from "../firebase";
import { useDatabaseContext } from "./DatabaseContext";

interface AuthContextT {
    authenticating: boolean
    currentProject: Project | null
    projectNameExists: (name: string) => Promise<boolean>
    createProject: (name: string, password: string) => Promise<void>
    login: (name: string, password: string) => Promise<string | null>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextT | undefined>(undefined)

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used with a Auth Provider')
    }
    return context
}

interface ProviderProps {
    children: React.ReactNode
}

export const AuthProvider: React.FC<ProviderProps> = ({ children }) => {
    const { handleAddProject, handleGetProject, handleSearchProjects } = useDatabaseContext()

    const [authenticating, setAuthenticating] = useState<boolean>(false)
    const [currentProject, setCurrentProject] = useState<Project | null>(null)

    const getProjectEmail = (name: string) => `p_${name.replace(' ', '-')}@pairminator.com`

    const projectNameExists = async (name: string): Promise<boolean> => {
        const projects = await handleSearchProjects(name)
        return projects.length > 0
    }

    const createProject = async (name: string, password: string) => {
        const createdCredential = await createUserWithEmailAndPassword(auth, getProjectEmail(name), password)

        const projectId = createdCredential.user.uid
        const project = await handleAddProject(projectId, name)
        setCurrentProject(project)
    }

    const loadProject = async (id: string) => {
        const project = await handleGetProject(id)
        if (project) {
            // console.log('existing project:', project)
            // Check if they have an old-formatted project
            // to convert to the new user-id based project
            // const oldProject = await (await handleSearchProjects(project.name)).find(p => p.id !== id)
            // if (oldProject) {
            //     console.log('found old project:', oldProject)
                
            //     const updatedProject: Project = {
            //         ...oldProject,
            //         id: project.id
            //     }
            //     console.log('updating new project to:', updatedProject)
            //     await handleUpdateProject(updatedProject)
            //     setCurrentProject(updatedProject)
            // } else {
            //     setCurrentProject(project)
            // }
            setCurrentProject(project)
        }
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(changedUser => {
            setAuthenticating(true)
            // console.log('auth changed:', changedUser)
            if (changedUser) {
                loadProject(changedUser.uid)
            }
            setAuthenticating(false)
        })
        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = async (name: string, password: string): Promise<string | null> => {
        setAuthenticating(true)
        let error = null

        try {
            await signInWithEmailAndPassword(auth, getProjectEmail(name), password)
        } catch (e) {
            console.error('Error authenticating project:', e)
            error = `Project name/password is invalid`
        }

        setAuthenticating(false)
        return error
    }

    const logout = async () => {
        await signOut(auth)
        setCurrentProject(null)
    }

    const contextValue: AuthContextT = {
        authenticating,
        currentProject,
        projectNameExists,
        createProject,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}