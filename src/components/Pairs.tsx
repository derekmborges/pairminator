import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2'
import { usePairminatorContext } from '../context/PairminatorContext'
import { Pair, Pairee } from '../models/interface'
import { PairingState } from '../models/enum'
import LinearProgress from '@mui/material/LinearProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export const Pairs = (): JSX.Element => {
  const {
    project,
    activePairees,
    lanes,
    currentPairs,
    togglePaireeAvailability,
    assignPairs,
    resetCurrentPairs,
    recordCurrentPairs
  } = usePairminatorContext()

  const [recordingPairs, setRecordingPairs] = useState<boolean>(false)
  const [pairsRecorded, setPairsRecorded] = useState<boolean>(false)

  const record = async () => {
    setRecordingPairs(true)
    const success = await recordCurrentPairs()
    if (success) {
      setPairsRecorded(true)
    }
    setRecordingPairs(false)
  }

  const availablePairees = activePairees?.filter(p => p.available) || []
  const pairingState = project?.pairingStatus

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h2" variant="h6" color="secondary" gutterBottom>
        Current Pairs
      </Typography>

      {pairingState === PairingState.INITIAL && (
        <>
          <Typography
            data-cy="no-current-pairs-label"
            variant='body1'
          >
            No pairs have been assigned yet.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography component="h2" variant="h6">
            Who's available to Pair? (select to toggle)
          </Typography>
          {activePairees && !!activePairees.length ? (
            <Grid2 container px={0} pt={1} spacing={1}>
              {activePairees.map((pairee: Pairee) => (
                <Grid2 key={pairee.id}>
                  <Chip
                    size='medium'
                    label={pairee.name}
                    variant={availablePairees.some(p => p.id === pairee.id) ? 'filled' : 'outlined'}
                    color={availablePairees.some(p => p.id === pairee.id) ? 'info' : 'default'}
                    onClick={async () => await togglePaireeAvailability(pairee)}
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
      {pairingState && [PairingState.ASSIGNED, PairingState.RECORDED].includes(pairingState) && currentPairs && (
        <Grid2 container px={0} spacing={2}>
          {currentPairs
            .sort((a: Pair, b: Pair) => {
              const laneA = lanes?.find(l => l.id === a.laneId)
              const laneB = lanes?.find(l => l.id === b.laneId)
              return (laneA && laneB) ? laneA.number - laneB.number : 0
            })
            .map((pair: Pair, index: number) => {
              const lane = lanes?.find(l => l.id === pair.laneId)
              const pairee1 = activePairees?.find(p => p.id === pair.pairee1Id)
              const pairee2 = pair.pairee2Id ? activePairees?.find(p => p.id === pair.pairee2Id) : null

              return lane && pairee1 && (
                <Grid2 key={lane.id}>
                  <Stack direction='column' alignItems='center' spacing={1}
                    borderRight={index < (currentPairs.length-1) ? '2px dashed grey' : 'none'}
                    pr={2}
                  >
                    <Typography
                      data-cy="lane-name"
                      variant='subtitle1'
                    >
                      {lane.name}
                    </Typography>
                    <Chip
                      data-cy="pairee1-name"
                      size='medium'
                      label={pairee1.name}
                      variant='filled'
                      color={pairingState === PairingState.RECORDED ? 'primary' : 'secondary'}
                    />
                    {pairee2 && (
                      <Chip
                      data-cy="pairee2-name"
                        size='medium'
                        label={pairee2.name}
                        variant='filled'
                        color={pairingState === PairingState.RECORDED ? 'primary' : 'secondary'}
                      />
                    )}
                  </Stack>
                </Grid2>
              )
            }
          )}
        </Grid2>
      )}

      <Stack direction="row" pt={3} pb={2} spacing={2}>
        {pairingState && [PairingState.INITIAL, PairingState.ASSIGNING].includes(pairingState) && (
          <Stack direction='row' alignItems='center' spacing={2}>
            <Button
              data-cy="assign-pairs-button"
              color="info"
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
            data-cy="record-pairs-button"
            color="secondary"
            variant='contained'
            size='large'
            disabled={recordingPairs}
            onClick={record}
          >
            Record
          </Button>
        )}
        {pairingState && [PairingState.ASSIGNED, PairingState.RECORDED].includes(pairingState) && (
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

      <Snackbar
        open={pairsRecorded}
        autoHideDuration={3000}
        onClose={() => setPairsRecorded(false)}
      >
        <Alert
          data-cy="recorded-pairs-alert"
          severity='success'
        >
          Pairs recorded
        </Alert>
      </Snackbar>
    </Paper>
  )
}
