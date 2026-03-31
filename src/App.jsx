// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserVehicles from './pages/UserVehicles'
import AddUser from './pages/AddUser'
import AddVehicle from './pages/AddVehicle'
import EditUser from './pages/EditUser'
import EditVehicle from './pages/EditVehicle'

function AdminLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — admin only */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/users/add" element={
            <ProtectedRoute>
              <AdminLayout><AddUser /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/users/:userId/edit" element={
            <ProtectedRoute>
              <AdminLayout><EditUser /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/users/:userId/vehicles" element={
            <ProtectedRoute>
              <AdminLayout><UserVehicles /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/users/:userId/vehicles/add" element={
            <ProtectedRoute>
              <AdminLayout><AddVehicle /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/vehicles/add" element={
            <ProtectedRoute>
              <AdminLayout><AddVehicle /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/users/:userId/vehicles/:vehicleId/edit" element={
            <ProtectedRoute>
              <AdminLayout><EditVehicle /></AdminLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}