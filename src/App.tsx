import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import Index from './pages/index';
import Converter from './pages/ytconverter';
import Contact from './pages/contact';
import Login from './pages/login';
import Register from './pages/register';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/converter" element={<Converter />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
