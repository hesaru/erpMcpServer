import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ModelContext = createContext(null);

export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used within a ModelProvider');
    }
    return context;
};

export const ModelProvider = ({ children }) => {
    const { user } = useAuth();
    const [selectedModel, setSelectedModel] = useState('openai');

    // Load saved model preference when user is available
    useEffect(() => {
        if (user) {
            const savedModel = localStorage.getItem('selectedModel');
            if (savedModel && (savedModel === 'openai' || savedModel === 'gemini')) {
                setSelectedModel(savedModel);
            } else {
                // Default to openai for new login
                setSelectedModel('openai');
            }
        }
    }, [user]);

    // Reset model to default on logout
    useEffect(() => {
        if (!user) {
            setSelectedModel('openai');
            localStorage.removeItem('selectedModel');
        }
    }, [user]);

    const updateModel = (model) => {
        setSelectedModel(model);
        localStorage.setItem('selectedModel', model);
    };

    return (
        <ModelContext.Provider value={{ selectedModel, setSelectedModel: updateModel }}>
            {children}
        </ModelContext.Provider>
    );
};

export default ModelContext;
