import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router'
import Divider from '@mui/material/Divider'
import LoadingButton from '@mui/lab/LoadingButton'
import pearImg from '../images/pear.png'
import { useAuthContext } from '../context/AuthContext'

export const ProjectLogin = (): JSX.Element => {
  const { authenticating, currentProject, login } = useAuthContext()
  const [projectName, setProjectName] = useState<string>('')
  const [projectPassword, setProjectPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (currentProject) {
      navigate({ pathname: '/dashboard' })
    }
  }, [currentProject, navigate])

  const submitLogin = async() => {
    setError(null)
    const error = await login(projectName, projectPassword)
    if (error) {
      setError(error)
    }
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !!projectName.length && !!projectPassword.length) {
      submitLogin()
    }
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
        <img
          src={pearImg}
          alt="pear"
          width={200}
        />
        <Typography variant='h6' pt={3}>
          Log in and pear up!
        </Typography>
        <TextField
          fullWidth
          id="project-name"
          placeholder='Project Name'
          variant='outlined'
          sx={{ width: 300 }}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyUp={onEnter}
          disabled={authenticating}
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
          onKeyUp={onEnter}
          disabled={authenticating}
        />
        {!authenticating && error && (
          <Typography variant='body1' color='red'>
            {error}
          </Typography>
        )}
        <LoadingButton
          loading={authenticating}
          variant='contained'
          color='secondary'
          sx={{ width: 300 }}
          onClick={submitLogin}
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
