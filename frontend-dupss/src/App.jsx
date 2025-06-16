import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/homepage/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AboutUs from './components/about/AboutUs';
import Appointment from './components/appointment/Appointment';
import BlogDetail from './components/blogs/BlogDetail';
import BlogsList from './components/blogs/BlogsList';
import CoursesList from './components/courses/CoursesList';
import CourseDetail from './components/courses/CourseDetail';
import CourseLearning from './components/courses/CourseLearning';
import SurveysList from './components/surveys/SurveysList';
import SurveyDetail from './components/surveys/SurveyDetail';
import AlertNotification from './components/common/AlertNotification';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AlertNotification />
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        <Route path="/about-us" element={
          <Layout>
            <AboutUs />
          </Layout>
        } />
        <Route path="/appointment" element={
          <Layout>
            <Appointment />
          </Layout>
        } />
        <Route path="/blogs" element={
          <Layout>
            <BlogsList />
          </Layout>
        } />
        <Route path="/blogs/:id" element={
          <Layout>
            <BlogDetail />
          </Layout>
        } />
        <Route path="/courses" element={
          <Layout>
            <CoursesList />
          </Layout>
        } />
        <Route path="/courses/:id" element={
          <Layout>
            <CourseDetail />
          </Layout>
        } />
        <Route path="/courses/:id/learn" element={
          <Layout>
            <CourseLearning />
          </Layout>
        } />
        <Route path="/surveys" element={
          <Layout>
            <SurveysList />
          </Layout>
        } />
        <Route path="/surveys/:id" element={
          <Layout>
            <SurveyDetail />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App