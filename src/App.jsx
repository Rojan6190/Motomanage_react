import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UserVehicles from './pages/UserVehicles'
import AddUser from './pages/AddUser'
import AddVehicle from './pages/AddVehicle'
import Navbar from './components/Navbar'
export default function App() {
  return (
    <BrowserRouter>
      < Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/:userId/vehicles" element={<UserVehicles />} />
        
        <Route path="/users/:userId/vehicles/add" element={<AddVehicle />}/>
        <Route path="/vehicles/add" element={<AddVehicle />} />
      </Routes>
    </BrowserRouter>
  )
}
