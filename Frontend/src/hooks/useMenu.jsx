import { useState, useEffect } from 'react';
import useAxiosPublic from './useAxiosPublic';

const useMenu = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPublic = useAxiosPublic();

    const fetchMenu = async (retry = false) => {
        setLoading(true);
        try {
            const res = await axiosPublic.get('/menu');
            setMenu(res.data);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu data:', error);
            setError('Failed to load menu data');
            setLoading(false);
            
            // If this is the first attempt and we're getting a network error, try once more
            if (!retry && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
                setTimeout(() => {
                    fetchMenu(true); // Retry once
                }, 2000);
            }
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const refetch = () => {
        fetchMenu();
    };

    return { menu, loading, error, refetch };
};

export default useMenu;