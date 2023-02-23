import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import React from 'react'

export const Pairs = (): JSX.Element => {
  return (
    <>
        <Grid2 xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Current Pairs
                </Typography>
            </Paper>
        </Grid2>
    </>
  )
}
