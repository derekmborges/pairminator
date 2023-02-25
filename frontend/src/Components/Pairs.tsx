import React from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { usePairminatorContext } from '../context/PairminatorContext'
import { Pairee } from '../models/interface'
import { PairingState } from '../models/enum'
import LinearProgress from '@mui/material/LinearProgress'

export const Pairs = (): JSX.Element => {
  const {
    pairees,
    availablePairees,
    togglePaireeAvailability,
    pairingState,
    currentPairs,
    generatePairs
  } = usePairminatorContext()

  return (
    <>
        <Grid2 xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Current Pairs
                </Typography>

                {pairingState === PairingState.INITIAL && (
                  <>
                    <Typography variant='body1'>
                      No pairs have been generated yet.
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography component="h2" variant="h6">
                      Who's available to Pair? (select to toggle)
                    </Typography>
                    {!!pairees.length ? (
                      <Grid2 container px={0} pt={1} spacing={1}>
                          {pairees.map((pairee: Pairee) => (
                            <Grid2>
                              <Chip
                                component={Button}
                                size='medium'
                                label={pairee.name}
                                variant={availablePairees.some(p => p.id === pairee.id) ? 'filled' : 'outlined'}
                                color={availablePairees.some(p => p.id === pairee.id) ? 'success' : 'default'}
                                onClick={() => togglePaireeAvailability(pairee)}
                                sx={{
                                  width: 90,
                                  height: 35,
                                  fontSize: 14
                                }}
                                />
                            </Grid2>
                          ))}
                      </Grid2>
                    ) : (
                      <Typography variant='body2'>
                        Add 2 or more pairees to generate pairs
                      </Typography>
                    )}
                  </>
                )}
                {pairingState === PairingState.GENERATING && (
                  <LinearProgress color='inherit' sx={{ mt: 2 }} />
                )}
                {pairingState === PairingState.GENERATED && (
                  <></>
                )}

                <Stack direction="row" pt={3} pb={2} spacing={2}>
                  {pairingState === PairingState.INITIAL && (
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <Button
                        color="primary"
                        variant='contained'
                        size='large'
                        disabled={availablePairees.length < 2}
                        onClick={generatePairs}
                      >
                        Generate
                      </Button>
                      {availablePairees.length < 2 && (
                        <Typography
                          variant='caption'
                          color='error'
                        >
                          2 or more pairees must be available to generate pairs.
                        </Typography>
                      )}
                    </Stack>
                  )}
                  {pairingState === PairingState.GENERATED && (
                    <>
                      <Button
                        color="success"
                        variant='contained'
                      >
                        Assign
                      </Button>
                      <Button
                        color="warning"
                        variant='contained'
                      >
                        Reset
                      </Button>
                    </>
                  )}
                </Stack>
                
            </Paper>
        </Grid2>
    </>
  )
}
