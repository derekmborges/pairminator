import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { usePairminatorContext } from '../../context/PairminatorContext'
import { Pairee } from '../../models/interface'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import PersonIcon from '@mui/icons-material/Person'
import DeleteIcon from '@mui/icons-material/Delete'
import { PaireeEditDialog } from './PaireeEditDialog'
import { PaireeDeleteModal } from './PaireeDeleteModal'
import { Theme } from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export const Pairees = (): JSX.Element => {
    const { project, addPairee, deletePairee } = usePairminatorContext()
    const [newPaireeName, setNewPaireeName] = useState<string>('')
    const [newPaireeError, setNewPaireeError] = useState<boolean>(false)

    const [paireeAdded, setPaireeAdded] = useState<boolean>(false)
    const [paireeDeleted, setPaireeDeleted] = useState<boolean>(false)

    const add = async () => {
        setNewPaireeError(false)

        const paireeExists: boolean = !!project?.pairees?.find(p => p.name === newPaireeName)
        if (paireeExists) {
            setNewPaireeError(true)
            return
        }

        const addSuccess = await addPairee(newPaireeName);
        if (addSuccess) {
            setPaireeAdded(true)
        }
        setNewPaireeName('');
    }

    const handleCloseDeleteModal = async (id?: string) => {
        if (id) {
            const success = await deletePairee(id)
            if (success) {
                setPaireeDeleted(true)
            }
        }
    }

    const PaireeRow = ({ pairee }: { pairee: Pairee }): JSX.Element => {
        const [hovering, setHovering] = useState<boolean>(false);
        const [editing, setEditing] = useState<boolean>(false);
        const [deleting, setDeleting] = useState<boolean>(false);

        return (
            <>
                <ListItem
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    key={pairee.id}
                    secondaryAction={hovering ?
                        <>
                            <IconButton onClick={() => setEditing(true)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton aria-label="delete" onClick={() => setDeleting(true)}>
                                <DeleteIcon />
                            </IconButton>
                        </>
                        : null
                    }
                    sx={{
                        bgcolor: (theme: Theme) => hovering ? theme.palette.primary.light : 'transparent',
                        borderRadius: '0.5rem'
                    }}
                >
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={pairee.name} />
                </ListItem>
                <PaireeEditDialog
                    open={editing}
                    pairee={pairee}
                    handleClose={() => setEditing(false)}
                />
                <PaireeDeleteModal
                    open={deleting}
                    pairee={pairee}
                    handleClose={handleCloseDeleteModal}
                />
            </>
        )
    }

    return (
        <>
            <Paper sx={{ mt: 3, p: 2, display: 'flex', flexDirection: 'column' }}>
                <Grid2 container>
                    <Grid2 xs={12} md={8}>
                        <Typography component="h2" variant="h6" color="secondary" gutterBottom>
                            Pairees
                        </Typography>
                        {project?.pairees && project?.pairees.length > 0 ? (
                            <List>
                                {project.pairees.map((pairee: Pairee) => (
                                    <PaireeRow key={pairee.id} pairee={pairee} />
                                ))}
                            </List>
                        ) : (
                            <Typography variant='body1' fontStyle='italic'>
                                No pairees added yet.
                            </Typography>
                        )}
                    </Grid2>
                    <Grid2 xs={12} md={4}>
                        <Typography component="h2" variant="h6" color="secondary" gutterBottom>
                            Add Pairee
                        </Typography>
                        <Box>
                            <TextField
                                id="pairee-name"
                                placeholder='Name (min. 2 chars)'
                                value={newPaireeName}
                                onChange={(e) => setNewPaireeName(e.target.value)}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter' && newPaireeName.length >= 2) {
                                        add()
                                    }
                                }}
                            />
                        </Box>
                        {newPaireeError && (
                            <Typography variant='caption' color='error.main'>
                                Pairee name already exists.
                            </Typography>
                        )}
                        <Box my={2}>
                            <Button
                                variant='contained'
                                disabled={newPaireeName.length < 2}
                                onClick={add}
                            >
                                Add Pairee
                            </Button>
                        </Box>
                    </Grid2>
                <Snackbar
                    open={paireeDeleted}
                    autoHideDuration={3000}
                    onClose={() => setPaireeDeleted(false)}
                >
                    <Alert severity='success'>
                        Pairee deleted successfully
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={paireeAdded}
                    autoHideDuration={3000}
                    onClose={() => setPaireeAdded(false)}
                >
                    <Alert severity='success'>
                        Pairee added successfully
                    </Alert>
                </Snackbar>
                </Grid2>
            </Paper>
        </>
    )
}
