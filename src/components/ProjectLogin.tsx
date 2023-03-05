import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import Button from '@mui/material/Button'
import { usePairminatorContext } from '../context/PairminatorContext'
import { useNavigate } from 'react-router'
import Divider from '@mui/material/Divider'
import LoadingButton from '@mui/lab/LoadingButton'

export const ProjectLogin = (): JSX.Element => {
  const { logIntoProject } = usePairminatorContext()
  const [projectName, setProjectName] = useState<string>('')
  const [projectPassword, setProjectPassword] = useState<string>('')
  const [loggingIn, setLoggingIn] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = async() => {
    setLoggingIn(true)
    setError(null)
    const success = await logIntoProject(projectName, projectPassword)
    if (success) {
      navigate({ pathname: '/dashboard' })
    } else {
      setError('Invalid project name and password')
    }
    setLoggingIn(false)
  }

  return (
    <Grid2 xs={12}>
      <Stack
        width="100%"
        height="100%"
        direction='column'
        alignItems='center'
        p={1}
        spacing={2}
      >
        <Typography variant='h6'>
          Log into existing project
        </Typography>
        <TextField
          fullWidth
          id="project-name"
          placeholder='Project Name'
          variant='outlined'
          sx={{ width: 300 }}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              login()
            }
          }}
        />
        <TextField
          fullWidth
          id="project-password"
          type="password"
          placeholder='Password'
          variant='outlined'
          sx={{ width: 300 }}
          value={projectPassword}
          onChange={(e) => setProjectPassword(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              login()
            }
          }}
        />
        {!loggingIn && error && (
          <Typography variant='body1' color='red'>
            {error}
          </Typography>
        )}
        <LoadingButton
          loading={loggingIn}
          variant='contained'
          color='secondary'
          sx={{ width: 300 }}
          onClick={login}
          disabled={!projectName.length || !projectPassword.length}
        >
          Login
        </LoadingButton>
        <Divider sx={{ my: 4 }} />
        <Button
          fullWidth
          variant='outlined'
          color='secondary'
          sx={{ width: 300 }}
          onClick={() => navigate({ pathname: '/new' })}
        >
          Create Project
        </Button>
      </Stack>
    </Grid2>
  )
}
