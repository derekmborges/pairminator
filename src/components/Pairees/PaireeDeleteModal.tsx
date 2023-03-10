import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Pairee } from '../../models/interface'

type Props = {
    open: boolean
    pairee: Pairee
    handleClose: (id?: number) => void
}

export const PaireeDeleteModal = ({
    open,
    pairee,
    handleClose
}: Props): JSX.Element => {
    return (
        <Dialog open={open} onClose={() => handleClose()}>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Remove <b>{pairee.name}</b> from pairees?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color="inherit"
                    onClick={() => handleClose()}
                >
                    Cancel
                </Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={() => handleClose(pairee.id)}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    )
}
