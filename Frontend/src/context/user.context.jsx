/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/users/profile')
                .then(res => {
                    setUser(res.data.user);
                })
                .catch(err => {
                    console.error('Failed to restore user session:', err);
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};

