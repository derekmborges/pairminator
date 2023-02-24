import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { usePairminatorContext } from '../context/PairminatorContext'
import { Pairee } from '../models/pair'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import Stack from '@mui/material/Stack'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

export const Pairees = (): JSX.Element => {
    const { pairees, addPairee, updatePairee } = usePairminatorContext();
    const [newPaireeName, setNewPaireeName] = useState<string>('');

    const add = () => {
        addPairee(newPaireeName);
        setNewPaireeName('');
    }

    const PaireeRow = ({pairee}: {pairee: Pairee}): JSX.Element => {
        const [hovering, setHovering] = useState<boolean>(false);
        const [editing, setEditing] = useState<boolean>(false);
        const [updatedName, setUpdatedName] = useState<string>('');

        useEffect(() => {
            if (editing) {
                setUpdatedName(pairee.name);
            }
        }, [pairee, setUpdatedName, editing]);

        const close = (apply?: boolean) => {
            if (apply && updatedName !== pairee.name) {
                updatePairee(pairee.id, updatedName);
            }
            setEditing(false);
        }

        return (
            <TableRow sx={{ height: 50 }}>
                <TableCell style={{ width: 300 }}>
                    <Box
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                    >
                        {editing ? (
                            <ClickAwayListener
                            onClickAway={() => close(true)}
                            >
                                <Stack width="100%" direction='row' alignItems='center'>
                                    <TextField
                                        size='small'
                                        value={updatedName}
                                        onChange={(e) => setUpdatedName(e.target.value)}
                                        />
                                    <IconButton
                                        size='small'
                                        onClick={() => close()}
                                        sx={{ width: 30, height: 30 }}
                                        >
                                        <CloseIcon fontSize='inherit' />
                                    </IconButton>
                                    <IconButton
                                        size='small'
                                        onClick={() => close(true)}
                                        sx={{ width: 30, height: 30 }}
                                        >
                                        <CheckIcon fontSize='inherit' />
                                    </IconButton>
                                </Stack>
                            </ClickAwayListener>
                        ) : (
                            <>{pairee.name}</>
                            )}
                        {!editing && hovering && (
                            <IconButton
                            size='small'
                            onClick={() => setEditing(true)}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        )}
                    </Box>
                </TableCell>
                <TableCell>{pairee.id}</TableCell>
                <TableCell>
                    <IconButton>
                        <MoreHorizIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
        );
    }

  return (
    <>
        <Grid2 xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Pairees
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    {!!pairees.length ? (
                        <TableBody>
                            {pairees.map((pairee: Pairee) => (
                                <PaireeRow
                                    key={pairee.id}
                                    pairee={pairee}
                                />
                            ))}
                        </TableBody>
                    ) : (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <Box textAlign='center'>
                                        <Typography>
                                            No pairees added yet.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        
                    )}
                </Table>                
            </Paper>
        </Grid2>

        <Grid2 xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Add Pairee
                </Typography>
                <Box>
                    <TextField
                        id="pairee-name"
                        placeholder='Name (min. 2 chars)'
                        value={newPaireeName}
                        onChange={(e) => setNewPaireeName(e.target.value)}
                    />
                </Box>
                <Box my={2}>
                    <Button
                        variant='contained'
                        disabled={newPaireeName.length < 2}
                        onClick={add}
                    >
                        Add Pairee
                    </Button>
                </Box>
            </Paper>
        </Grid2>
    </>
  )
}
