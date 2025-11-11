import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    // Filtros para HistoryScreen
    const [historyFilter, setHistoryFilter] = useState({
        filterType: 'all',
        startDate: null,
        endDate: null,
    });

    // Filtros para CategoriesScreen
    const [categoriesFilter, setCategoriesFilter] = useState({
        filterPeriod: 'all',
        startDate: null,
        endDate: null,
    });

    // Filtros para CategoryDetailsScreen (por categoria)
    const [categoryDetailsFilters, setCategoryDetailsFilters] = useState({});

    const updateHistoryFilter = (filter) => {
        setHistoryFilter(prev => ({ ...prev, ...filter }));
    };

    const updateCategoriesFilter = (filter) => {
        setCategoriesFilter(prev => ({ ...prev, ...filter }));
    };

    const updateCategoryDetailsFilter = (categoryId, filter) => {
        setCategoryDetailsFilters(prev => ({
            ...prev,
            [categoryId]: { ...(prev[categoryId] || {}), ...filter }
        }));
    };

    const getCategoryDetailsFilter = (categoryId) => {
        return categoryDetailsFilters[categoryId] || {
            filterPeriod: 'all',
            startDate: null,
            endDate: null,
        };
    };

    return (
        <FilterContext.Provider
            value={{
                historyFilter,
                updateHistoryFilter,
                categoriesFilter,
                updateCategoriesFilter,
                updateCategoryDetailsFilter,
                getCategoryDetailsFilter,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters deve ser usado dentro de FilterProvider');
    }
    return context;
};
