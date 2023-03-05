import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { NewProject } from './NewProject'
import { ProjectLogin } from './ProjectLogin'

export const AppRouter = () => {
  return (
    <Routes>
        <Route path='/' element={<ProjectLogin />} />
        <Route path='/new' element={<NewProject />} />
        <Route path='/dashboard' element={<Dashboard />} />
    </Routes>
  )
}
