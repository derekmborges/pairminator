import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { usePairminatorContext } from '../../context/PairminatorContext'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import { Pairee } from '../../models/interface'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

type Props = {
    open: boolean
    handleClose: (paireeId?: string) => void
}

export const PairmanAssignModal = ({
    open,
    handleClose
}: Props) => {
    const { project, getSuggestedPairman } = usePairminatorContext()
    const [suggestedPairman, setSuggestedPairman] = useState<Pairee | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)

    useEffect(() => {
        const suggestion = getSuggestedPairman()
        if (suggestion) {
            setSuggestedPairman(suggestion)
        }
        setLoading(false)
    }, [getSuggestedPairman])

    useEffect(() => {
        if (open) {
            setSaving(false)
        }
    }, [open])

    const confirmElection = () => {
        setSaving(true)
        handleClose(suggestedPairman?.id)
    }

    const title = project?.currentPairman
        ? 'Overthrow Pairman'
        : 'Assign a Pairman'

    const subtitle = project?.currentPairman
        ? "I see you've decided it's time for a change, I don't blame you. Let's get rid of this pairman and elect someone new into office."
        : "Since this will be the first Pairman of your project's history, I have sovereignly decided who it should be (totally not random at all)."

    return (
        <Dialog open={open} onClose={() => handleClose()}>
            <DialogTitle>{title}</DialogTitle>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <DialogContent>{subtitle}</DialogContent>
                    {suggestedPairman && (
                        <DialogContent>
                            <Box display="flex" flexDirection="row">
                                <Typography variant='h6' mr={1}>
                                    Pairman:
                                </Typography>
                                <Typography variant='h6' color="secondary">
                                    {suggestedPairman.name}
                                </Typography>
                            </Box>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button
                            color="inherit"
                            onClick={() => handleClose()}
                        >
                            Maybe Later
                        </Button>
                        <LoadingButton
                            color="success"
                            variant="contained"
                            onClick={confirmElection}
                            loading={saving}
                        >
                            Elect
                        </LoadingButton>
                    </DialogActions>
                </>
            )}
        </Dialog>
    )
}
