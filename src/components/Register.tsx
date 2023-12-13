// Register.tsx
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/firebaseContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface RegisterProps {
    toggleForm: () => void;
}

const Register: React.FC<RegisterProps> = ({ toggleForm }) => {
    const { auth } = useFirebase();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const successMessageTimeout = setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);

        return () => clearTimeout(successMessageTimeout);
    }, [successMessage]);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError(null);
            await createUserWithEmailAndPassword(auth, email, password);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Registration error:', error.message);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <section className="hero is-primary is-fullheight">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-5-tablet is-4-desktop is-3-widescreen">
                            <form onSubmit={handleRegister} className="box">
                                {/* ... */}
                                {/* Your form fields and error/success messages */}
                                {/* ... */}
                                <div className="field">
                                    <div className="control">
                                        <button type="submit" className="button is-primary">
                                            Register
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <p>
                                Already have an account?
                                <span
                                    onClick={toggleForm}
                                    style={{ cursor: 'pointer', marginLeft: '5px', color: 'blue' }}
                                >
                  Login here
                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;
