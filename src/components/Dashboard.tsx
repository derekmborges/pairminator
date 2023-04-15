import React, { useEffect } from 'react'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { History } from './History/History'
import { Pairees } from './Pairees/Pairees'
import { Pairs } from './Pairs'
import { useNavigate } from 'react-router'
import { useAuthContext } from '../context/AuthContext'

export const Dashboard = (): JSX.Element => {
    const { authenticating, currentProjectId } = useAuthContext()
    const navigate = useNavigate()

    useEffect(() => {
        if (!authenticating && !currentProjectId) {
            navigate({ pathname: '/' })
        }
    }, [authenticating, currentProjectId, navigate])

    return (
        <>
            <Grid2 xs={12} md={8}>
                <Pairs />
                <Pairees />
            </Grid2>
            <Grid2 xs={12} md={4}>
                <History />
            </Grid2>
        </>
    )
}
