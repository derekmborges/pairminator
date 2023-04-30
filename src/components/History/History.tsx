import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePairminatorContext } from '../../context/PairminatorContext'
import { HistoryRecord } from '../../models/interface'
import { HistoryRow } from './HistoryRow'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export const History = (): JSX.Element => {
  const { history, deleteHistoryRecord } = usePairminatorContext()

  const [recordDeleted, setRecordDeleted] = useState<boolean>(false)

  const deleteRecord = async (id: string) => {
    const success = await deleteHistoryRecord(id)
    setRecordDeleted(success)
  }

  return (
    <Paper
      component={Box}
      height={{ md: '100%', xs: 'auto' }}
      sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
    >
      <Typography component="h2" variant="h6" color="secondary" gutterBottom>
        Pair History
      </Typography>

      {(!history || !history.length) ? (
        <Typography
          data-cy="no-history-label"
          variant='body1'
          fontStyle='italic'
        >
          Record pairs to see a recent history.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {history.map((historyRecord: HistoryRecord) => (
            <HistoryRow
              historyRecord={historyRecord}
              onDeleteRecord={deleteRecord}
            />
          ))
          }
        </Stack>
      )}
      <Snackbar
        open={recordDeleted}
        autoHideDuration={3000}
        onClose={() => setRecordDeleted(false)}
      >
        <Alert severity='success'>
          History record deleted successfully
        </Alert>
      </Snackbar>
    </Paper>
  )
}
