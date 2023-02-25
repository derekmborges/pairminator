import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import React from 'react'
import { usePairminatorContext } from '../context/PairminatorContext'
import { Assignment, Pair } from '../models/interface'

export const History = (): JSX.Element => {
  const { assignmentHistory } = usePairminatorContext()
  
  return (
    <>
        <Grid2 xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Pairing History
                </Typography>

                {assignmentHistory
                  .sort((a, b) => b.date.valueOf() - a.date.valueOf())
                  .map((assignment: Assignment) => (
                    <>
                      <Typography variant='subtitle2'>
                        {assignment.date.toISOString()}
                      </Typography>
                      {assignment.pairs.map((pair: Pair) => (
                        <Stack direction='row'>
                          <Typography>{pair.pairee1.name}</Typography>
                          {pair.pairee2 && (
                            <Typography>
                              &nbsp;&&nbsp;{pair.pairee2.name}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                    </>
                  ))
                }
            </Paper>
        </Grid2>
    </>
  )
}
