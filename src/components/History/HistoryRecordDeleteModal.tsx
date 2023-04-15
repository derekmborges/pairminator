import React, { useState } from "react"
import Dialog from "@mui/material/Dialog"
import { HistoryRecord, Pair } from "../../models/interface"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import Typography from "@mui/material/Typography"
import { usePairminatorContext } from "../../context/PairminatorContext"
import Stack from "@mui/material/Stack"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import LoadingButton from '@mui/lab/LoadingButton'

type Props = {
    open: boolean
    historyRecord: HistoryRecord
    handleClose: (id?: string) => void
}

export const HistoryRecordDeleteModal = ({
    open,
    historyRecord,
    handleClose
}: Props): JSX.Element => {
    const { lanes, allPairees } = usePairminatorContext()
    
    const [deleting, setDeleting] = useState<boolean>(false)

    const confirmDelete = () => {
        setDeleting(true)
        handleClose(historyRecord.id)
    }

    return (
        <Dialog open={open} onClose={() => handleClose()}>
            <DialogTitle>Delete History Record?</DialogTitle>
            <DialogContent>
                This action cannot be undone. Please review the assignment record below:
            </DialogContent>
            <DialogContent>
                <Typography variant='h6'>
                    {historyRecord.date.toLocaleString()}
                </Typography>
                {historyRecord.pairs
                .sort((a: Pair, b: Pair) => {
                    const laneA = lanes?.find(l => l.id === a.laneId)
                    const laneB = lanes?.find(l => l.id === b.laneId)
                    return (laneA && laneB) ? laneA.number - laneB.number : 0
                })
                .map((pair: Pair) => {
                    const lane = lanes?.find(l => l.id === pair.laneId)
                    const pairee1 = allPairees?.find(p => p.id === pair.pairee1Id)
                    const pairee2 = pair.pairee2Id ? allPairees?.find(p => p.id === pair.pairee2Id) : null
                    return lane && pairee1 && (
                        <Stack direction='row' key={lane.id} pl={1}>
                            <Typography fontWeight={500} pr={1}>
                                {lane.number}:
                            </Typography>
                            <Typography variant='body1'>
                                {pairee1.name}
                            </Typography>
                            {pairee2 && (
                                <Typography variant='body1'>
                                    &nbsp;&&nbsp;{pairee2.name}
                                </Typography>
                            )}
                        </Stack>
                    )
                }
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    color="inherit"
                    onClick={() => handleClose()}
                >
                    Cancel
                </Button>
                <LoadingButton
                    color="error"
                    variant="contained"
                    onClick={confirmDelete}
                    loading={deleting}
                >
                    Delete
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}