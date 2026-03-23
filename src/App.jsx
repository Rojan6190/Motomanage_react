import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UserVehicles from './pages/UserVehicles'
import AddUser from './pages/AddUser'
import AddVehicle from './pages/AddVehicle'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users/:userId/vehicles" element={<UserVehicles />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/:userId/vehicles/add" element={<AddVehicle />}/>
      </Routes>
    </BrowserRouter>
  )
}
