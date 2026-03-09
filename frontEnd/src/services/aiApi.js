const AI_API_BASE_URL = 'http://localhost:8080';

/**
 * AI API Service
 * Handles all AI-related API calls
 */
const aiApi = {
    /**
     * Get suitable assignee suggestions based on task context
     * @param {string} message - Context message describing the task
     * @returns {Promise<Array>} Array of assignee suggestions with reason and history
     */
    getSuitableAssignees: async (message) => {
        try {
            const response = await fetch(`${AI_API_BASE_URL}/suitableAsigneesList?message=${encodeURIComponent(message)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching AI assignee suggestions:', error);
            throw error;
        }
    },
};

export default aiApi;
