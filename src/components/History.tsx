import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePairminatorContext } from '../context/PairminatorContext'
import { RecordedPairs, Pair } from '../models/interface'

export const History = (): JSX.Element => {
  const { project } = usePairminatorContext()

  return (
    <Paper
      component={Box}
      height={{ md: '100%', xs: 'auto' }}
      sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
    >
      <Typography component="h2" variant="h6" color="secondary" gutterBottom>
        Pair History
      </Typography>

      {project?.recordedPairsHistory && !project.recordedPairsHistory.length && (
        <Typography variant='body1' fontStyle='italic'>
          Record pairs to see a recent history.
        </Typography>
      )}

      <Stack spacing={2}>
        {project?.recordedPairsHistory && project?.recordedPairsHistory
          .sort((a, b) => b.date.valueOf() - a.date.valueOf())
          .map((recordedPairs: RecordedPairs) => (
            <Box key={recordedPairs.date.valueOf()}>
              <Typography variant='h6'>
                {recordedPairs.date.toLocaleString()}
              </Typography>
              {recordedPairs.pairs.map((pair: Pair) => (
                <Stack direction='row' key={pair.lane.id}>
                  <Typography variant='body1'>
                    {pair.pairee1.name}
                  </Typography>
                  {pair.pairee2 && (
                    <Typography variant='body1'>
                      &nbsp;&&nbsp;{pair.pairee2.name}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Box>
          ))
        }
      </Stack>
    </Paper>
  )
}
