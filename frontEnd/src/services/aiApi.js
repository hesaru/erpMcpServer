const AI_API_BASE_URL = 'http://localhost:8080';

/**
 * AI API Service
 * Handles all AI-related API calls.
 * Uses structured endpoints with BeanOutputConverter for guaranteed response format.
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

    /**
     * Analyze all employees and get the top 3 most stressed.
     * AI uses MCP tools (getEmployeeWellBeingMetrics) to fetch data and make decisions.
     * Returns structured EmployeeStressResult objects via BeanOutputConverter.
     *
     * @returns {Promise<Array>} Top 3 EmployeeStressResult objects
     */
    analyzeTopAtRisk: async () => {
        try {
            const response = await fetch(`${AI_API_BASE_URL}/analyzeTopStress`);

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in AI top-at-risk analysis:', error);
            throw error;
        }
    },

    /**
     * Analyze a single employee's stress level by their ID.
     * AI uses MCP tools (getEmployeeWellBeingById) to fetch data and make decisions.
     * Returns a structured EmployeeStressResult object via BeanOutputConverter.
     *
     * @param {number} employeeId - The employee's ID
     * @returns {Promise<Object>} EmployeeStressResult object
     */
    analyzeEmployeeStress: async (employeeId) => {
        try {
            const response = await fetch(`${AI_API_BASE_URL}/analyzeEmployeeStress?employeeId=${employeeId}`);

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in AI employee stress analysis:', error);
            throw error;
        }
    }
};

export default aiApi;
