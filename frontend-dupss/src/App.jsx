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
import './App.css';

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  )
}

export default App