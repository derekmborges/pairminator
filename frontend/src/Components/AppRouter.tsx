import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { History } from './History'
import { Pairees } from './Pairees'
import { Pairs } from './Pairs'

export const AppRouter = () => {
  return (
    <Routes>
        <Route path='/' element={<Pairs />} />
        <Route path='/pairs' element={<Pairs />} />
        <Route path='/pairees' element={<Pairees />} />
        <Route path='/history' element={<History />} />
    </Routes>
  )
}