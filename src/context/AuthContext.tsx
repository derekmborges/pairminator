import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from 'firebase/auth'
import { auth } from "../firebase";
import { useDatabaseContext } from "./DatabaseContext";
import { FirebaseError } from "firebase/app";

interface AuthContextT {
    authenticating: boolean
    currentProjectId: string | null
    createProject: (name: string, password: string) => Promise<string | null>
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
    const { handleAddProject, handleGetProject } = useDatabaseContext()

    const [authenticating, setAuthenticating] = useState<boolean>(true)
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

    const getProjectEmail = (name: string) => `p_${name.replace(' ', '-')}@pairminator.com`

    const createProject = async (name: string, password: string): Promise<string | null> => {
        console.log('creating account')
        let error = null
        try {
            const userCred = await createUserWithEmailAndPassword(auth, getProjectEmail(name), password)
            console.log('account created')
            await updateProfile(userCred.user, { displayName: name })
            console.log('user displayName updated')
            await login(name, password)
        } catch (e) {
            const firebaseError: FirebaseError = e as FirebaseError
            console.error('Error authenticating project:', firebaseError)
            console.log(firebaseError.code)
            if (firebaseError.code === 'auth/email-already-in-use') {
                error = 'Project name is not available'
            } else {
                error = `Error creating project: ${firebaseError.code}`
            }
        }
        return error
    }

    const loadProject = async (user: User) => {
        const project = await handleGetProject(user.uid)
        if (project) {
            setCurrentProjectId(project.id)
        } else {
            console.log('creating project')
            const newProject = await handleAddProject(user.uid, user.displayName || user.uid)
            setCurrentProjectId(newProject.id)
        }
    }

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
        setCurrentProjectId(null)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(changedUser => {
            setAuthenticating(true)
            // console.log('auth changed:', changedUser)
            if (changedUser && !currentProjectId) {
                loadProject(changedUser)
            }
            setAuthenticating(false)
        })
        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const contextValue: AuthContextT = {
        authenticating,
        currentProjectId,
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