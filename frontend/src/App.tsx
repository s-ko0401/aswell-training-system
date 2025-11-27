import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './page/login/LoginPage'
import { SystemAdminPage } from './page/system-admin/SystemAdminPage'
import { CompaniesPage } from './page/system-admin/CompaniesPage'
import { UsersPage } from './page/system-admin/UsersPage'
import { RolesPage } from './page/system-admin/RolesPage'
import { TrainerPage } from './page/trainer/TrainerPage'
import { TraineePage } from './page/trainee/TraineePage'
import { AdminDashboardPage } from './page/admin/AdminDashboardPage'
import { AdminTemplatePage } from './page/admin/AdminTemplatePage'
import { AdminTrainerPage } from './page/admin/AdminTrainerPage'
import { AdminTraineePage } from './page/admin/AdminTraineePage'
import { AdminDailyReportPage } from './page/admin/AdminDailyReportPage'
import { AdminQuestionPage } from './page/admin/AdminQuestionPage'
import { AdminAccountPage } from './page/admin/AdminAccountPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/system-admin"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <SystemAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-admin/companies"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <CompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-admin/users"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-admin/roles"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/templates"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTemplatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTrainerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTraineePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/daily-reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDailyReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={['TRAINER']}>
              <TrainerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee"
          element={
            <ProtectedRoute allowedRoles={['TRAINEE']}>
              <TraineePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
