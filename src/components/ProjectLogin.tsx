import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import Button from '@mui/material/Button'
import { usePairminatorContext } from '../context/PairminatorContext'
import { useNavigate } from 'react-router'

export const ProjectLogin = (): JSX.Element => {
  const { loadProject, projectId } = usePairminatorContext()
  const [projectName, setProjectName] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    if (projectId !== undefined) {
      navigate({ pathname: '/dashboard' })
    }
  }, [projectId, navigate])
  

  const login = () => {
    loadProject(projectName)
  }

  return (
    <Grid2 xs={12}>
      <Stack
        width="100%"
        height="100%"
        direction='column'
        justifyContent='center'
        alignItems='center'
        p={2}
        spacing={2}
      >
        <Typography variant='h6'>
          Enter Project Name
        </Typography>
        <TextField
          fullWidth
          id="project-name"
          placeholder='Name'
          variant='outlined'
          sx={{ width: 300 }}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              login()
            }
          }}
        />
        <Button
          fullWidth
          variant='contained'
          color='secondary'
          sx={{ width: 300 }}
          onClick={login}
        >
          Login
        </Button>
      </Stack>
    </Grid2>
  )
}
