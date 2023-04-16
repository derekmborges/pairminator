import React from "react"
import AppBar from "@mui/material/AppBar"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Button from "@mui/material/Button"
import Container from "@mui/system/Container"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Stack from "@mui/system/Stack"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import GitHubIcon from "@mui/icons-material/GitHub"
import { Theme } from "@mui/material"
import { HashRouter } from "react-router-dom"
import { AppRouter } from "./AppRouter"
import { useAuthContext } from "../context/AuthContext"
import { usePairminatorContext } from "../context/PairminatorContext"

export const PairminatorApp = (): JSX.Element => {
  const { logout, projectCreated } = useAuthContext()
  const { project } = usePairminatorContext()

  return (
    <HashRouter>
      <Box display='flex'>
        <AppBar
          position="absolute"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Stack direction="row" alignItems='center' spacing={1} sx={{ flexGrow: 1 }}>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
              >
                Pairminator
                {!!process.env.REACT_APP_DATA_SOURCE && ' (LOCAL)'}
              </Typography>
              <IconButton href="https://github.com/derekmborges/pairminator" target="_blank">
                <GitHubIcon />
              </IconButton>
            </Stack>
            {project && (
              <Stack direction='row' spacing={2} alignItems='center'>
                <Typography>
                  {project.name}
                </Typography>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </Stack>
            )}
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme: Theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ my: 3 }}>
            <Grid2 container spacing={3}>
              <AppRouter />
            </Grid2>
          </Container>
          <Snackbar open={projectCreated}>
            <Alert severity='success'>
              Project created! Happy pairing
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </HashRouter>
  )
}
