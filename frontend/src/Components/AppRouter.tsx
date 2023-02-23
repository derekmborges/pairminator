import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Pairees } from './Pairees'
import { Pairs } from './Pairs'
import { History } from './History'

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
