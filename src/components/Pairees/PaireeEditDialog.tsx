import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { usePairminatorContext } from '../../context/PairminatorContext'
import { Pairee } from '../../models/interface'
import LoadingButton from '@mui/lab/LoadingButton'

type Props = {
    open: boolean
    pairee: Pairee
    handleClose: () => void
}

export const PaireeEditDialog = ({
    pairee,
    open,
    handleClose
}: Props): JSX.Element => {
    const { updatePairee } = usePairminatorContext()
    const [updatedName, setUpdatedName] = useState<string>(pairee.name)
    const [updating, setUpdating] = useState<boolean>(false)

    const update = async () => {
        if (updatedName !== pairee.name) {
            setUpdating(true)
            await updatePairee({
                ...pairee,
                name: updatedName
            });
        }
        handleClose()
    }

    return (
        <Dialog open={open} onClose={() => handleClose()}>
            <DialogTitle>Update Pairee Name</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    From: {pairee.name}
                </DialogContentText>
                <TextField
                    autoFocus
                    id="name"
                    size='small'
                    margin="dense"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="inherit"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <LoadingButton
                    loading={updating}
                    disabled={updating}
                    color='info'
                    variant='contained'
                    onClick={update}
                >
                    Update
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
