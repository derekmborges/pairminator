import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import pearImg from '../images/pear.png'
import { useAuthContext } from '../context/AuthContext'
import { LoadingButton } from '@mui/lab'

export const NewProject = (): JSX.Element => {
    const { currentProject, createProject, projectNameExists } = useAuthContext()
    const [projectName, setProjectName] = useState<string>('')
    const [creating, setCreating] = useState<boolean>(false)
    const [nameError, setNameError] = useState<string | null>(null)
    const [projectPassword, setProjectPassword] = useState<string>('')
    const navigate = useNavigate()

    useEffect(() => {
        if (currentProject) {
          navigate({ pathname: '/dashboard' })
        }
    }, [currentProject, navigate])

    const create = async () => {
        setCreating(true)
        setNameError(null)

        const invalidChar = projectName.match(/[@(),]/)
        console.log(invalidChar)
        if (invalidChar) {
            setNameError(`Project name contains an invalid character: "${invalidChar}"`)
            setCreating(false)
            return
        }

        const nameExists = await projectNameExists(projectName)
        if (nameExists) {
            setNameError('Project name is taken, try another one.')
            setCreating(false)
            return
        }

        await createProject(projectName, projectPassword)
    }

    const onEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && projectName.length >= 2 && projectPassword.length >= 6) {
            create()
        }
    }

    return (
        <Grid2 xs={12}>
            <IconButton
                size='large'
                onClick={() => navigate({ pathname: '/' })}
                sx={{
                    position: 'absolute',
                    top: '5rem',
                    left: '1rem'
                }}
            >
                <ArrowBackIcon fontSize='inherit' />
            </IconButton>
            <Stack
                direction='column'
                alignItems='center'
                p={1}
                spacing={2}
            >
                <img
                    src={pearImg}
                    alt="pear gif"
                    width={200}
                />
                <Typography variant='h6' pt={3}>
                    Create a project
                </Typography>
                <TextField
                    fullWidth
                    id="project-name"
                    placeholder='Project Name (at least 2 chars)'
                    variant='outlined'
                    sx={{ width: 300 }}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyUp={onEnter}
                />
                <TextField
                    fullWidth
                    id="project-password"
                    type="password"
                    placeholder='Password (at least 6 chars)'
                    variant='outlined'
                    sx={{ width: 300 }}
                    value={projectPassword}
                    onChange={(e) => setProjectPassword(e.target.value)}
                    onKeyUp={onEnter}
                />
                {nameError && (
                    <Typography variant='body1' color='red'>
                        {nameError}
                    </Typography>
                )}
                <LoadingButton
                    variant="contained"
                    sx={{ width: 300 }}
                    disabled={projectName.length < 2 || projectPassword.length < 6}
                    onClick={create}
                    loading={creating}
                >
                    Create
                </LoadingButton>
            </Stack>
        </Grid2>
    )
}
