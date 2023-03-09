import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import React, { useState } from 'react'
import { usePairminatorContext } from '../context/PairminatorContext'
import { Pairee } from '../models/interface'

type Props = {
    open: boolean
    pairee: Pairee
    handleClose: () => void
}

export const EditPaireeDialog = ({
    pairee,
    open,
    handleClose
}: Props): JSX.Element => {
    const { updatePairee } = usePairminatorContext()
    const [updatedName, setUpdatedName] = useState<string>(pairee.name);

    const update = () => {
        if (updatedName !== pairee.name) {
            updatePairee(pairee.id, updatedName);
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
                <Button
                    color="info"
                    variant="contained"
                    onClick={update}
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    )
}
