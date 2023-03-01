import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import PeopleIcon from '@mui/icons-material/People';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const Sidebar = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    
    return (
        <Drawer
            variant="permanent"
            sx={{
                "& .MuiDrawer-paper": {
                    position: 'relative',
                    whiteSpace: "nowrap",
                    width: 240,
                },
            }}
        >
            <Toolbar />
            <List component="nav">
                <ListItemButton
                    onClick={() => navigate({ pathname: '/dashboard' })}
                    selected={location.pathname === '/dashboard'}
                >
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton
                    onClick={() => navigate({ pathname: '/pairs' })}
                    selected={location.pathname === '/pairs' || location.pathname === '/'}
                >
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Pairs" />
                </ListItemButton>
                <ListItemButton
                    onClick={() => navigate({ pathname: '/pairees' })}
                    selected={location.pathname === '/pairees'}
                >
                    <ListItemIcon>
                        <ManageAccountsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Pairees" />
                </ListItemButton>
                <ListItemButton
                    onClick={() => navigate({ pathname: '/history' })}
                    selected={location.pathname === '/history'}
                >
                    <ListItemIcon>
                        <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="History" />
                </ListItemButton>
            </List>
        </Drawer>
    )
}
