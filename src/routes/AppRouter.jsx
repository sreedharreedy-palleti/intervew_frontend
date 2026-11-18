import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Route Guards
import ProtectedRoute from '../components/guards/ProtectedRoute';
import AdminRoute from '../components/guards/AdminRoute';
import PublicOnlyRoute from '../components/guards/PublicOnlyRoute';
import AdminLoginRoute from '../components/guards/AdminLoginRoute';

// 1. Authentication Pages
import UserLogin from '../auth/pages/UserLogin';
import UserRegister from '../auth/pages/UserRegister';
import ForgotPassword from '../auth/pages/ForgotPassword';
import AdminLogin from '../auth/pages/AdminLogin';

// 2. Candidate Portal Pages
import CourseCatalog from '../user/pages/CourseCatalog';
import CourseDetail from '../user/pages/CourseDetail';
import MyEnrollments from '../user/pages/MyEnrollments';

// 3. AI Assignment Dedicated Proctored Examination Pages (from root ai_assignment/frontend)
import AssignmentView from '@assignment/pages/AssignmentView';

// 4. AI Interview Dedicated Voice & Technical Simulation Pages (from root ai_interview/frontend)
import InterviewView from '@interview/pages/InterviewView';

// 5. Admin Portal Pages
import AdminDashboard from '../admin/pages/AdminDashboard';
import AdminEnrollments from '../admin/pages/AdminEnrollments';
import AdminCourses from '../admin/pages/AdminCourses';
import AdminCourseRoster from '../admin/pages/AdminCourseRoster';
import AdminUsers from '../admin/pages/AdminUsers';
import AdminUserDetail from '../admin/pages/AdminUserDetail';
import AdminAppDownloads from '../admin/pages/AdminAppDownloads';
import AdminReports from '../admin/pages/AdminReports';

// 404 Fallback
import NotFound from '../components/common/NotFound';

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth Public-Only Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <UserLogin />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <UserRegister />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <AdminLoginRoute>
            <AdminLogin />
          </AdminLoginRoute>
        }
      />

      {/* Main Candidate Experience (with Navbar & Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/admin" element={<Navigate to="/admin" replace />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />

        {/* Protected Candidate Routes */}
        <Route
          path="/my-enrollments"
          element={
            <ProtectedRoute>
              <MyEnrollments />
            </ProtectedRoute>
          }
        />
        <Route path="/download-app" element={<Navigate to="/courses" replace />} />
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* ========================================================= */}
      {/* DEDICATED AI ASSIGNMENT ROUTES (Standalone Proctoring)     */}
      {/* ========================================================= */}
      <Route path="/assignment" element={<AssignmentView />} />
      <Route path="/assignment/app" element={<AssignmentView />} />
      <Route path="/assignment/:assignmentToken" element={<AssignmentView />} />

      {/* ========================================================= */}
      {/* DEDICATED AI INTERVIEW ROUTES (Voice & Technical Simulator)*/}
      {/* ========================================================= */}
      <Route path="/interview/:interviewToken" element={<InterviewView />} />
      <Route path="/interview/app" element={<InterviewView />} />

      {/* ========================================================= */}
      {/* ADMIN PORTAL EXPERIENCE (with Sidebar & Topbar)           */}
      {/* ========================================================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="enrollments" element={<AdminEnrollments />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:courseId/roster" element={<AdminCourseRoster />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:userId" element={<AdminUserDetail />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="assignment-reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="interview-reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="app-downloads" element={<AdminAppDownloads />} />
        <Route path="ai-assistant" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="chatbot" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRouter;
