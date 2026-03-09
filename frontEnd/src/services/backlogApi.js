const API_BASE_URL = 'http://localhost:8090/api';

/**
 * Backlog Task API Service
 * Handles all API calls for backlog task management
 */
const backlogApi = {
    /**
     * Create a new backlog task
     * @param {Object} taskData - Task data object
     * @returns {Promise<Object>} Created task
     */
    createTask: async (taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/backlog-tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    /**
     * Get all backlog tasks with optional filters
     * @param {Object} filters - Filter options (status, priority, assignee, source)
     * @returns {Promise<Array>} Array of tasks
     */
    getAllTasks: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.assigneeId) queryParams.append('assigneeId', filters.assigneeId);
            if (filters.source) queryParams.append('source', filters.source);

            const queryString = queryParams.toString();
            const url = queryString ? `${API_BASE_URL}/backlog-tasks?${queryString}` : `${API_BASE_URL}/backlog-tasks`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    /**
     * Get tasks by status
     * @param {string} status - Task status (TODO, IN_PROGRESS, DONE, etc.)
     * @returns {Promise<Array>} Array of tasks
     */
    getTasksByStatus: async (status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/backlog-tasks?status=${status}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks by status:', error);
            throw error;
        }
    },

    /**
     * Get tasks by assignee
     * @param {string} assignee - Assignee name
     * @returns {Promise<Array>} Array of tasks
     */
    getTasksByAssignee: async (assigneeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/backlog-tasks?assigneeId=${assigneeId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks by assignee:', error);
            throw error;
        }
    },

    /**
     * Get a single task by ID
     * @param {number} id - Task ID
     * @returns {Promise<Object>} Task object
     */
    getTaskById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/backlog-tasks/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching task by ID:', error);
            throw error;
        }
    },

    /**
     * Update a task by ID
     * @param {number} id - Task ID
     * @param {Object} taskData - Updated task data
     * @returns {Promise<Object>} Updated task
     */
    updateTask: async (id, taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/backlog-tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    /**
     * Delete a task by ID
     * @param {number} id - Task ID
     * @returns {Promise<void>}
     */
    deleteTask: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/backlog-tasks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },
};

export default backlogApi;
