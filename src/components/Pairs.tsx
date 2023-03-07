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
    assignPairs,
    resetCurrentPairs,
    recordCurrentPairs
  } = usePairminatorContext()

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h2" variant="h6" color="secondary" gutterBottom>
        Current Pairs
      </Typography>

      {pairingState === PairingState.INITIAL && (
        <>
          <Typography variant='body1'>
            No pairs have been assigned yet.
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
                    size='medium'
                    label={pairee.name}
                    variant={availablePairees.some(p => p.id === pairee.id) ? 'filled' : 'outlined'}
                    color={availablePairees.some(p => p.id === pairee.id) ? 'primary' : 'default'}
                    onClick={() => togglePaireeAvailability(pairee)}
                  />
                </Grid2>
              ))}
            </Grid2>
          ) : (
            <Typography pt={1} variant='body2' fontStyle='italic'>
              Add pairees below
            </Typography>
          )}
        </>
      )}
      {pairingState === PairingState.ASSIGNING && (
        <LinearProgress color='inherit' sx={{ mt: 2 }} />
      )}
      {[PairingState.ASSIGNED, PairingState.RECORDED].includes(pairingState) && currentPairs && (
        <Grid2 container px={0} spacing={2}>
          {currentPairs.map((pair: Pair) => (
            <Grid2 key={pair.lane.id}>
              <Stack direction='column' alignItems='center' spacing={1}>
                <Typography>
                  {pair.lane.name}
                </Typography>
                <Chip
                  size='medium'
                  label={pair.pairee1.name}
                  variant='filled'
                  color={pairingState === PairingState.RECORDED ? 'success' : 'primary'}
                />
                {pair.pairee2 && (
                  <Chip
                    size='medium'
                    label={pair.pairee2.name}
                    variant='filled'
                    color={pairingState === PairingState.RECORDED ? 'success' : 'primary'}
                  />
                )}
              </Stack>
            </Grid2>
          ))}
        </Grid2>
      )}

      <Stack direction="row" pt={3} pb={2} spacing={2}>
        {[PairingState.INITIAL, PairingState.ASSIGNING].includes(pairingState) && (
          <Stack direction='row' alignItems='center' spacing={2}>
            <Button
              color="primary"
              variant='contained'
              size='large'
              disabled={availablePairees.length < 2 || pairingState === PairingState.ASSIGNING}
              onClick={assignPairs}
            >
              Assign
            </Button>
            {availablePairees.length < 2 && (
              <Typography
                variant='caption'
                color='warning.dark'
              >
                2 or more pairees must be available to assign pairs.
              </Typography>
            )}
          </Stack>
        )}
        {pairingState === PairingState.ASSIGNED && (
          <Button
            color="secondary"
            variant='contained'
            size='large'
            onClick={recordCurrentPairs}
          >
            Record
          </Button>
        )}
        {[PairingState.ASSIGNED, PairingState.RECORDED].includes(pairingState) && (
          <Button
            color="inherit"
            variant='contained'
            size='large'
            onClick={resetCurrentPairs}
          >
            Reset
          </Button>
        )}
      </Stack>
    </Paper>
  )
}
