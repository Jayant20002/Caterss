import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    
    const { data: isAdmin, isPending: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        enabled: !!user?.email && !loading,
        queryFn: async () => {
            try {
                if (!user?.email) return false;
                const res = await axiosSecure.get(`/users/admin/${user.email}`);
                return res.data?.admin || false;
            } catch (error) {
                console.error('Admin check error:', error);
                return false;
            }
        }
    });

    return [isAdmin || false, isAdminLoading];
};

export default useAdmin;