import React from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { usePairminatorContext } from '../context/PairminatorContext'
import { Pair, Pairee } from '../models/interface'
import { PairingState } from '../models/enum'
import LinearProgress from '@mui/material/LinearProgress'

export const Pairs = (): JSX.Element => {
  const {
    pairees,
    availablePairees,
    togglePaireeAvailability,
    pairingState,
    currentPairs,
    generatePairs,
    resetCurrentPairs,
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
                    <Divider sx={{ my: 3 }} />
                    <Typography component="h2" variant="h6">
                      Who's available to Pair? (select to toggle)
                    </Typography>
                    {!!pairees.length ? (
                      <Grid2 container px={0} pt={1} spacing={1}>
                          {pairees.map((pairee: Pairee) => (
                            <Grid2 key={pairee.id}>
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
                        Go add pairees on the Pairees page.
                      </Typography>
                    )}
                  </>
                )}
                {pairingState === PairingState.GENERATING && (
                  <LinearProgress color='inherit' sx={{ mt: 2 }} />
                )}
                {pairingState === PairingState.GENERATED && currentPairs && (
                  <Grid2 container px={0} spacing={1}>
                    {currentPairs.map((pair: Pair) => (
                      <Grid2>
                        <Stack direction='column' alignItems='center' spacing={1}>
                          <Typography>
                            {pair.lane.name}
                          </Typography>
                          <Chip
                            size='medium'
                            label={pair.pairee1.name}
                            variant='filled'
                            color='primary'
                            sx={{
                              width: 90,
                              height: 35,
                              fontSize: 14
                            }}
                          />
                          {pair.pairee2 && (
                            <Chip
                              size='medium'
                              label={pair.pairee2.name}
                              variant='filled'
                              color='primary'
                              sx={{
                                width: 90,
                                height: 35,
                                fontSize: 14
                              }}
                            />
                          )}
                        </Stack>
                      </Grid2>
                    ))}
                  </Grid2>
                )}

                <Stack direction="row" pt={3} pb={2} spacing={2}>
                  {[PairingState.INITIAL, PairingState.GENERATING].includes(pairingState) && (
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <Button
                        color="primary"
                        variant='contained'
                        size='large'
                        disabled={availablePairees.length < 2 || pairingState === PairingState.GENERATING}
                        onClick={generatePairs}
                      >
                        Generate
                      </Button>
                      {availablePairees.length < 2 && (
                        <Typography
                          variant='caption'
                          color='warning.dark'
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
                        onClick={resetCurrentPairs}
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
