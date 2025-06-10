import React from 'react';
import AdminPage from './pages/AdminPage';
import Header from './layout/Header';
import './App.css'

function App() {
  return (
    <>
      <Header userName="Admin" />
      <AdminPage />
    </>
  );
}

export default App
