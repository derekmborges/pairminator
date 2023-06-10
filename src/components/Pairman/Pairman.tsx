import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { usePairminatorContext } from '../../context/PairminatorContext'
import { Pairee } from '../../models/interface'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import HistoryIcon from '@mui/icons-material/History'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Tooltip from '@mui/material/Tooltip'
import { PairmanAssignModal } from './PairmanAssignModal'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export const Pairman = (): JSX.Element => {
    const { project, activePairees, assignPairman } = usePairminatorContext()

    const [openAssignModal, setOpenAssignModal] = useState<boolean>(false)
    const [pairmanElected, setPairmanElected] = useState<boolean>(false)

    const handleAssignModalClose = async (paireeId?: string) => {
        if (paireeId) {
            const result = await assignPairman(paireeId)
            setPairmanElected(result)
        }
        setOpenAssignModal(false)
    }

    const pairmanName: string | undefined = activePairees?.find(p => p.id === project?.currentPairman?.paireeId)?.name

    return (
        <Paper
            component={Box}
            mb={1}
            p={2}
            display="flex"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Box display="flex" flexDirection="row" alignItems="center">
                <Typography component="h2" variant="h6" color="secondary" mr={1}>
                    Pairman:
                </Typography>
                <Typography component="h2" variant="h6" color="gray">
                    {pairmanName || 'Unassigned'}
                </Typography>
                <Tooltip title={pairmanName ? 'Overthrow pairman' : 'Magically assign'}>
                    <IconButton
                        color="success"
                        onClick={() => setOpenAssignModal(true)}
                    >
                        {pairmanName ? <RefreshIcon /> : <AutoFixHighIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
            <Tooltip title="History">
                <IconButton color="info">
                    <HistoryIcon />
                </IconButton>
            </Tooltip>

            <PairmanAssignModal
                open={openAssignModal}
                handleClose={handleAssignModalClose}
            />
            <Snackbar
                open={pairmanElected}
                autoHideDuration={3000}
                onClose={() => setPairmanElected(false)}
            >
                <Alert severity='success'>
                    Pairman elected successfully
                </Alert>
            </Snackbar>
        </Paper>
    )
}
