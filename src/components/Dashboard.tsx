import React, { useEffect } from 'react'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { History } from './History'
import { Pairees } from './Pairees/Pairees'
import { Pairs } from './Pairs'
import { usePairminatorContext } from '../context/PairminatorContext'
import { useNavigate } from 'react-router'

export const Dashboard = (): JSX.Element => {
    const { initializing, activeProject } = usePairminatorContext()
    const navigate = useNavigate()

    useEffect(() => {
        if (!initializing && !activeProject) {
            navigate({ pathname: '/' })
        }
    }, [initializing, activeProject, navigate])

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
