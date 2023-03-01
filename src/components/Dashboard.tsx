import React from 'react'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { History } from './History'
import { Pairees } from './Pairees'
import { Pairs } from './Pairs'

export const Dashboard = (): JSX.Element => {
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
