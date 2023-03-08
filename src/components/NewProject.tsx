import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { usePairminatorContext } from '../context/PairminatorContext'
import pearImg from '../images/pear.png'

export const NewProject = (): JSX.Element => {
    const { isProjectNameAvailable, addProject } = usePairminatorContext()
    const [projectName, setProjectName] = useState<string>('')
    const [nameError, setNameError] = useState<boolean | null>(null)
    const [projectPassword, setProjectPassword] = useState<string>('')
    const navigate = useNavigate()

    const create = async () => {
        setNameError(null)
        if (projectName.length > 2) {
            const isAvailable = await isProjectNameAvailable(projectName)
            if (isAvailable) {
                await addProject(projectName, projectPassword)
                navigate({ pathname: '/dashboard' })
            } else {
                setNameError(true)
            }
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
                    onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            create()
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
                            create()
                        }
                    }}
                />
                {nameError && (
                    <Typography variant='body1' color='red'>
                        Project name is taken, try another one.
                    </Typography>
                )}
                <Button
                    variant="contained"
                    sx={{ width: 300 }}
                    disabled={projectName.length < 2 || !projectPassword.length}
                    onClick={create}
                >
                    Create
                </Button>
            </Stack>
        </Grid2>
    )
}
