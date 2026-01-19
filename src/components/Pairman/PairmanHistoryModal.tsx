import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { usePairminatorContext } from '../../context/PairminatorContext'
import DialogContent from '@mui/material/DialogContent'
import { PairmanRecord } from '../../models/interface'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'

type Props = {
    open: boolean
    handleClose: () => void
}

export const PairmanHistoryModal = ({ open, handleClose }: Props): JSX.Element | null => {
    const { project, pairmanHistory, allPairees } = usePairminatorContext()

    if (!project || !allPairees || !pairmanHistory) {
        handleClose()
        return null
    }

    return (
        <Dialog fullWidth open={open} onClose={() => handleClose()}>
            <DialogTitle>
                Pairman History
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 12,
                        color: (theme: any) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Elected</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pairmanHistory.map((record: PairmanRecord) => (
                                    <TableRow
                                        key={record.electionDate.valueOf()}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {allPairees.find(p => p.id === record.paireeId)?.name}
                                        </TableCell>
                                        <TableCell>{record.electionDate.toDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </DialogContent>
        </Dialog>
    )
}
