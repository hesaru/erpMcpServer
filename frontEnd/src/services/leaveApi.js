import { authAxios } from './authApi';

const leaveApi = {
    /**
     * Apply for leave (employee/manager)
     */
    applyLeave: async (leaveData) => {
        const response = await authAxios.post('/leaves/apply', leaveData);
        return response.data;
    },

    /**
     * Get my leave requests (employee/manager)
     */
    getMyLeaveRequests: async () => {
        const response = await authAxios.get('/leaves/my-requests');
        return response.data;
    },

    /**
     * Get pending leave requests (manager only)
     */
    getPendingLeaves: async () => {
        const response = await authAxios.get('/leaves/pending');
        return response.data;
    },

    /**
     * Get all leave requests for a manager
     */
    getAllLeavesForManager: async () => {
        const response = await authAxios.get('/leaves/all');
        return response.data;
    },

    /**
     * Approve a leave request (manager only)
     */
    approveLeave: async (leaveId) => {
        const response = await authAxios.put(`/leaves/${leaveId}/approve`);
        return response.data;
    },

    /**
     * Decline a leave request (manager only)
     */
    declineLeave: async (leaveId) => {
        const response = await authAxios.put(`/leaves/${leaveId}/decline`);
        return response.data;
    },
};

export default leaveApi;
