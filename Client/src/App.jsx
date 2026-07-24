import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

import Work from './pages/Work/Work';
import MainLayout from './layout/MainLayout';

const App = () => {
  return (
    <div>

      <Routes>

        <Route element={<MainLayout/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/work" element={<Work/>}/>
        </Route>
      </Routes>





    </div>
  )
}

export default App;