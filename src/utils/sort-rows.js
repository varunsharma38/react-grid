export const sortRows = (initialRows, sortColumn, sortDirection) => {
    const comparer = (a, b) => {
        if (sortDirection === 'ASC') {
            return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else if (sortDirection === 'DESC') {
            return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
    };
    return sortDirection === 'NONE' ? initialRows : [...initialRows].sort(comparer);
};