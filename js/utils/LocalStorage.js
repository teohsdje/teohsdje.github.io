// This file provides utility functions for managing local storage, saving and retrieving player data.

const LocalStorage = {
    saveData: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    getData: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    removeData: function(key) {
        localStorage.removeItem(key);
    },

    clearAll: function() {
        localStorage.clear();
    }
}; 

export default LocalStorage;