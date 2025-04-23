import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

const useCart = () => {
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('access_token')

    const { refetch, data: cart = [], isLoading, error } = useQuery({
        queryKey: ['carts', user?.email],
        queryFn: async () => {
            if (!user?.email) {
                throw new Error('User email not found');
            }
            const res = await fetch(`http://localhost:5001/carts?email=${user.email}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch cart data');
            }
            return res.json();
        },
        enabled: !!user?.email && !!token
    })

    return [cart, refetch, isLoading, error]
}

export default useCart;