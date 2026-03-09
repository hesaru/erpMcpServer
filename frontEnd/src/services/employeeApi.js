import { getAuthHeaders } from './authApi';

const API_BASE_URL = 'http://localhost:8090/api';

/**
 * Employee API Service
 * Handles all API calls for employee management
 */
const employeeApi = {
    /**
     * Get all employees
     * @returns {Promise<Array>} Array of employees
     */
    getAllEmployees: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees`, {
                headers: { ...getAuthHeaders() },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },

    /**
     * Create a new employee
     * @param {Object} employeeData - Employee data object
     * @returns {Promise<Object>} Created employee
     */
    createEmployee: async (employeeData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(employeeData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    },

    /**
     * Delete an employee by ID
     * @param {number} id - Employee ID
     * @returns {Promise<void>}
     */
    deleteEmployee: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: 'DELETE',
                headers: { ...getAuthHeaders() },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    },

    /**
     * Search employees
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of employees
     */
    searchEmployees: async (query) => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/search?query=${encodeURIComponent(query)}`, {
                headers: { ...getAuthHeaders() },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching employees:', error);
            throw error;
        }
    }
};

export default employeeApi;
