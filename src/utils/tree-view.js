export const getSubRowDetails = expandedRows => rowItem => {
    const isExpanded = expandedRows[rowItem.id]
        ? expandedRows[rowItem.id]
        : false;
    return {
        group: rowItem.subTasks && rowItem.subTasks.length > 0,
        expanded: isExpanded,
        children: rowItem.subTasks,
        field: 'id',
        treeDepth: rowItem.treeDepth || 0,
        siblingIndex: rowItem.siblingIndex,
        numberSiblings: rowItem.numberSiblings
    };
};

function updateSubRowDetails(subRows, parentTreeDepth) {
    const treeDepth = parentTreeDepth || 0;
    subRows.forEach((sr, i) => {
        sr.treeDepth = treeDepth + 1;
        sr.siblingIndex = i;
        sr.numberSiblings = subRows.length;
    });
}

export const onCellExpand = args => ({ rows, expandedRows }) => {
    const rowKey = args.rowData.id;
    const rowIndex = rows.indexOf(args.rowData);
    const subRows = args.expandArgs.children;
    if (expandedRows && !expandedRows[rowKey]) {
        expandedRows[rowKey] = true;
        updateSubRowDetails(subRows, args.rowData.treeDepth);
        rows.splice(rowIndex + 1, 0, ...subRows);
    } else if (expandedRows[rowKey]) {
        expandedRows[rowKey] = false;
        rows.splice(rowIndex + 1, subRows.length);
    }
    return { expandedRows, rows };
};