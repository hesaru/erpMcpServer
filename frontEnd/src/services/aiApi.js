import { getMcpServerBase } from '../config/apiConfig';

/**
 * AI API Service
 * Handles all AI-related API calls.
 * Uses structured endpoints with BeanOutputConverter for guaranteed response format.
 * All methods accept an optional `model` parameter ('openai' or 'gemini').
 */
const aiApi = {
    /**
     * Get suitable assignee suggestions based on task context
     * @param {string} message - Context message describing the task
     * @param {string} model - AI model to use ('openai' or 'gemini')
     * @returns {Promise<Array>} Array of assignee suggestions with reason and history
     */
    getSuitableAssignees: async (message, model = 'openai') => {
        try {
            const response = await fetch(
                `${getMcpServerBase()}/suitableAsigneesList?message=${encodeURIComponent(message)}&model=${encodeURIComponent(model)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching AI assignee suggestions [Model: ${model}]:`, error);
            throw error;
        }
    },

    /**
     * Analyze all employees and get the top 3 most stressed.
     * AI uses MCP tools (getEmployeeWellBeingMetrics) to fetch data and make decisions.
     * Returns structured EmployeeStressResult objects via BeanOutputConverter.
     *
     * @param {string} model - AI model to use ('openai' or 'gemini')
     * @returns {Promise<Array>} Top 3 EmployeeStressResult objects
     */
    analyzeTopAtRisk: async (model = 'openai') => {
        try {
            const response = await fetch(
                `${getMcpServerBase()}/analyzeTopStress?model=${encodeURIComponent(model)}`
            );

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error in AI top-at-risk analysis [Model: ${model}]:`, error);
            throw error;
        }
    },

    /**
     * Analyze a single employee's stress level by their ID.
     * AI uses MCP tools (getEmployeeWellBeingById) to fetch data and make decisions.
     * Returns a structured EmployeeStressResult object via BeanOutputConverter.
     *
     * @param {number} employeeId - The employee's ID
     * @param {string} model - AI model to use ('openai' or 'gemini')
     * @returns {Promise<Object>} EmployeeStressResult object
     */
    analyzeEmployeeStress: async (employeeId, model = 'openai') => {
        try {
            const response = await fetch(
                `${getMcpServerBase()}/analyzeEmployeeStress?employeeId=${employeeId}&model=${encodeURIComponent(model)}`
            );

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error in AI employee stress analysis [Model: ${model}]:`, error);
            throw error;
        }
    }
};

export default aiApi;
