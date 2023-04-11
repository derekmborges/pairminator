import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Pairee } from '../../models/interface'
import { usePairminatorContext } from '../../context/PairminatorContext'

type Props = {
    open: boolean
    pairee: Pairee
    handleClose: (id?: string) => void
}

export const PaireeDeleteModal = ({
    open,
    pairee,
    handleClose
}: Props): JSX.Element => {
    const { canHardDeletePairee } = usePairminatorContext()
    const [canHardDelete, setCanHardDelete] = useState<boolean>(false)

    const checkIfCanDelete = async () => {
        const result = await canHardDeletePairee(pairee.id)
        setCanHardDelete(result)
    }

    useEffect(() => {
        if (open) {
            checkIfCanDelete()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, setCanHardDelete])

    return (
        <Dialog open={open} onClose={() => handleClose()}>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Remove <b>{pairee.name}</b> from pairees?
                </DialogContentText>
                {!canHardDelete && (
                    <DialogContentText>
                        Their pairing history will be maintained.
                    </DialogContentText>
                )}
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
