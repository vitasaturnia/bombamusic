import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Index from './pages/index';
import Converter from './pages/converter';
import Contact from './pages/contact';
import Login from './pages/login';
import Register from './pages/register';
import Layout from './components/Layout';

const App: React.FC = () => {
    return (
            <AuthProvider>
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/converter" element={<Converter />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/converter" element={<Converter />} />

                        </Routes>
                    </Layout>
                </BrowserRouter>
            </AuthProvider>
    );
};

export default App;
