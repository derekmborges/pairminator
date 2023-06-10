import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { usePairminatorContext } from '../../context/PairminatorContext'
import { Pairee } from '../../models/interface'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import HistoryIcon from '@mui/icons-material/History'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import Tooltip from '@mui/material/Tooltip'

export const Pairman = () => {
    const { currentPairmanId, activePairees } = usePairminatorContext()

    const currentPairman: Pairee | undefined = activePairees?.find(p => p.id === currentPairmanId)

    return (
        <Paper
            component={Box}
            mb={1}
            p={2}
            display="flex"
            flexDirection="row"
            alignItems="center"
        >
            <Typography component="h2" variant="h6" color="secondary">
                Pairman: {currentPairman ? currentPairman.name : 'Unassigned'}
            </Typography>
            <Tooltip title={currentPairman ? 'Overthrow pairman' : 'Randomly assign'}>
                <IconButton color="success">
                    {currentPairman ? <RefreshIcon /> : <ShuffleIcon />}
                </IconButton>
            </Tooltip>
            <Tooltip title="History">
                <IconButton color="info">
                    <HistoryIcon />
                </IconButton>
            </Tooltip>
        </Paper>
    )
}
