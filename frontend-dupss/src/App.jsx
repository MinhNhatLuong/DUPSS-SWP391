import { useState } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './components/homepage/HomePage';
import './App.css';

function App() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  )
}

export default App