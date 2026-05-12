import { getAuthHeaders } from './authApi';
import aiApi from './aiApi';
import { getMcpClientBase } from '../config/apiConfig';

/**
 * Well-Being API Service
 * Handles all API calls for the employee well-being dashboard
 */
const wellbeingApi = {
    /**
     * Get raw well-being data for all employees (no AI enrichment)
     * @returns {Promise<Array>} Array of EmployeeWellBeingDto objects
     */
    getDashboardData: async () => {
        try {
            const response = await fetch(`${getMcpClientBase()}/wellbeing/dashboard`, {
                headers: { ...getAuthHeaders() },
            });
            if (!response.ok) {
                console.warn(`HTTP error in wellbeing! status: ${response.status}`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching wellbeing dashboard data:', error);
            return [];
        }
    },

    /**
     * Get top 3 employees who need attention (AI-analyzed via MCP tools).
     * The AI calls getEmployeeWellBeingMetrics MCP tool, analyzes, and returns structured results.
     * We then merge the AI results with raw employee data for full details.
     *
     * @returns {Promise<Array>} Top 3 employees with AI stress analysis + raw metrics
     */
    getTopAtRiskEmployees: async (model = 'openai') => {
        try {
            // 1. Fetch AI-analyzed top 3 (structured response)
            const aiResults = await aiApi.analyzeTopAtRisk(model);
            if (!aiResults || aiResults.length === 0) return [];

            // 2. Fetch raw data for full metric details
            const rawData = await wellbeingApi.getDashboardData();

            // 3. Merge AI results with raw employee data
            return aiResults.map(aiResult => {
                const rawEmployee = rawData.find(emp =>
                    emp.employeeId === aiResult.employeeId ||
                    emp.employeeName === aiResult.employeeName
                );

                return {
                    ...(rawEmployee || {}),
                    ...aiResult,
                };
            });
        } catch (error) {
            console.error('Error fetching top at-risk employees:', error);
            // Re-throw so EmployeeWellBeing.jsx's catch sets topError (shows error UI + Retry)
            // Do NOT return [] here — that would silently show the "all healthy" empty state
            throw error;
        }
    },

    /**
     * Get a single employee's well-being data enriched with AI stress analysis.
     * The AI calls getEmployeeWellBeingById MCP tool, analyzes, and returns structured result.
     * We merge with raw data for full details.
     *
     * @param {number} employeeId - The employee ID
     * @returns {Promise<Object|null>} Employee data with AI stress analysis
     */
    getEmployeeAnalysis: async (employeeId, model = 'openai') => {
        try {
            // 1. Fetch AI-analyzed stress (structured response)
            const aiResult = await aiApi.analyzeEmployeeStress(employeeId, model);
            if (!aiResult) return null;

            // 2. Fetch raw data for full metric details
            const rawResponse = await fetch(`${getMcpClientBase()}/wellbeing/employee/${employeeId}`, {
                headers: { ...getAuthHeaders() },
            });

            let rawData = null;
            if (rawResponse.ok) {
                rawData = await rawResponse.json();
            }

            // 3. Merge
            return {
                ...(rawData || {}),
                ...aiResult,
            };
        } catch (error) {
            console.error(`Error analyzing employee ${employeeId}:`, error);
            // Re-throw so handleSelectEmployee's catch sets selectedError (shows error UI)
            // Do NOT return null here — that would silently show "Could not find data" instead
            throw error;
        }
    }
};

export default wellbeingApi;
