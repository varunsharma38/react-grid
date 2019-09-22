import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { Editors, DraggableHeader, Menu, Data } from 'react-data-grid-addons'
import { range } from 'lodash';
const { DropDownEditor } = Editors;
const { DraggableContainer } = DraggableHeader;
const { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger } = Menu;


import './styles/App.scss';

function CombinedValueFormatter(props) {
    return (
        <div className='center-align'>
            <span className='sub-value'>{props.row.value1}</span>
            <span className='sub-value'>{props.row.value2}</span>
        </div>
    )
}

function CombinedValueHeader(props) {
    return (
        <div className='center-align'>
            Combined Value
            <div>
                <span className='sub-header'>Value 1</span>
                <span className='sub-header'>Value 2</span>
            </div>
        </div>
    )
}

function ExampleContextMenu({
    idx,
    id,
    rowIdx,
    onRowDelete,
    onRowInsertAbove,
    onRowInsertBelow
}) {
    return (
        <ContextMenu id={id}>
            <MenuItem data={{ rowIdx, idx }} onClick={onRowDelete}>
                Delete Row
      </MenuItem>
            <SubMenu title="Insert Row">
                <MenuItem data={{ rowIdx, idx }} onClick={onRowInsertAbove}>
                    Above
        </MenuItem>
                <MenuItem data={{ rowIdx, idx }} onClick={onRowInsertBelow}>
                    Below
        </MenuItem>
            </SubMenu>
        </ContextMenu>
    );
}

const deleteRow = rowIdx => {
    alert('Delete Row at index ' + rowIdx)
};

const insertRow = rowIdx => {
    alert('Insert Row at index ' + rowIdx)
};


const issueTypes = [
    { id: "bug", value: "Bug" },
    { id: "epic", value: "Epic" },
    { id: "story", value: "Story" }
];
const IssueTypeEditor = <DropDownEditor options={issueTypes} />;
const columns = [
    {
        key: "id", name: "ID", events: {
            onDoubleClick: function (ev) {
                alert(`Cell Double Clicked`);
            }
        }
    },
    { key: "title", name: "Title", draggable: true, resizable: true, sortable: true },
    { key: "complete", name: "Complete", draggable: true },
    { key: "combinedValue", name: "Value", draggable: true, headerRenderer: CombinedValueHeader, formatter: CombinedValueFormatter },
    { key: "issueType", name: "Task Type", draggable: true, editor: IssueTypeEditor }
];

const rows = [
    {
        id: 0, title: "Task 1", issueType: "Bug", complete: 20, value1: 10, value2: 40,
        subTasks: [

            { id: '00', title: "Task 01", issueType: "Bug", complete: 10, value1: 5, value2: 20 },
            { id: '01', title: "Task 01", issueType: "Bug", complete: 15, value1: 10, value2: 30 }
        ]

    },
    { id: 1, title: "Task 2", issueType: "Story", complete: 40, value1: 20, value2: 80 },
    { id: 2, title: "Task 3", issueType: "Epic", complete: 60, value1: 30, value2: 120 }
];

const idActions = [
    {
        icon: "fa fa-align-justify",
        actions: [
            {
                text: "Option 1",
                callback: () => {
                    alert("Option 1 clicked");
                }
            },
            {
                text: "Option 2",
                callback: () => {
                    alert("Option 2 clicked");
                }
            }
        ]
    }
];

function getCellActions(column, row) {
    const cellActions = {
        id: idActions
    };
    return cellActions[column.key];
}

const sortRows = (initialRows, sortColumn, sortDirection) => {
    const comparer = (a, b) => {
        if (sortDirection === "ASC") {
            return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else if (sortDirection === "DESC") {
            return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
    };
    return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
};

const defaultParsePaste = str => (
    str.split(/\r\n|\n|\r/)
        .map(row => row.split('\t'))
);

const getSubRowDetails = expandedRows => rowItem => {
    const isExpanded = expandedRows[rowItem.id]
        ? expandedRows[rowItem.id]
        : false;
    return {
        group: rowItem.subTasks && rowItem.subTasks.length > 0,
        expanded: isExpanded,
        children: rowItem.subTasks,
        field: "id",
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

const onCellExpand = args => ({ rows, expandedRows }) => {
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

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rows,
            columns,
            expandedRows: {},
            topLeft: {},
            botRight: {},
        }

        this.onGridRowsUpdated = this.onGridRowsUpdated.bind(this)
        this.onHeaderDrop = this.onHeaderDrop.bind(this)
        this.rowGetter = this.rowGetter.bind(this)
        this.setSelection = this.setSelection.bind(this)
        this.handleCopy = this.handleCopy.bind(this)
        this.handlePaste = this.handlePaste.bind(this)
        this.updateRows = this.updateRows.bind(this)
        this.removeAllListeners = this.removeAllListeners.bind(this)

        document.addEventListener('copy', this.handleCopy);
        document.addEventListener('paste', this.handlePaste);
    }

    rowGetter(i, visibleRows) {
        const combinedValue = {
            value1: this.state.rows.value1,
            value2: this.state.rows.value2
        }

        const row = Object.assign({}, /*this.state.rows[i]*/visibleRows, { combinedValue })
        return row;
    }

    onHeaderDrop(source, target) {
        const stateCopy = Object.assign({}, this.state);
        const columnSourceIndex = this.state.columns.findIndex(
            i => i.key === source
        );
        const columnTargetIndex = this.state.columns.findIndex(
            i => i.key === target
        );

        stateCopy.columns.splice(
            columnTargetIndex,
            0,
            stateCopy.columns.splice(columnSourceIndex, 1)[0]
        );

        const emptyColumns = Object.assign({}, this.state, { columns: [] });
        this.setState(emptyColumns);

        const reorderedColumns = Object.assign({}, this.state, {
            columns: stateCopy.columns
        });
        this.setState(reorderedColumns);
    };

    componentWillUnmount() {
        this.removeAllListeners();
    }

    removeAllListeners() {
        document.removeEventListener('copy', this.handleCopy);
        document.removeEventListener('paste', this.handlePaste);
    }

    updateRows(startIdx, newRows) {
        this.setState((state) => {
            const rows = state.rows.slice();
            for (let i = 0; i < newRows.length; i++) {
                if (startIdx + i < rows.length) {
                    rows[startIdx + i] = { ...rows[startIdx + i], ...newRows[i] };
                }
            }
            return { rows };
        });
    }

    handleCopy(e) {
        console.debug('handleCopy Called');
        e.preventDefault();
        const { topLeft, botRight } = this.state;

        // Loop through each row
        const text = range(topLeft.rowIdx, botRight.rowIdx + 1).map(
            // Loop through each column
            rowIdx => columns.slice(topLeft.colIdx, botRight.colIdx + 1).map(
                // Grab the row values and make a text string
                col => this.rowGetter(rowIdx)[col.key],
            ).join('\t'),
        ).join('\n');
        console.debug('text', text);
        e.clipboardData.setData('text/plain', text);
    }


    handlePaste(e) {
        console.debug('handlePaste Called');
        e.preventDefault();
        const { topLeft } = this.state;

        const newRows = [];
        const pasteData = defaultParsePaste(e.clipboardData.getData('text/plain'));

        console.debug('pasteData', pasteData);

        pasteData.forEach((row) => {
            const rowData = {};
            // Merge the values from pasting and the keys from the columns
            columns.slice(topLeft.colIdx, topLeft.colIdx + row.length)
                .forEach((col, j) => {
                    // Create the key-value pair for the row
                    rowData[col.key] = row[j];
                });
            // Push the new row to the changes
            newRows.push(rowData);
        });

        console.debug('newRows', newRows);

        this.updateRows(topLeft.rowIdx, newRows);
    }

    //   onGridRowsUpdated ({ fromRow, toRow, updated }) {
    //   this.setState(state => {
    //     const rows = state.rows.slice();
    //     for (let i = fromRow; i <= toRow; i++) {
    //       rows[i] = { ...rows[i], ...updated };
    //     }
    //     return { rows };
    //   });
    // };

    onGridRowsUpdated({ fromRow, toRow, updated, action }) {
        console.debug('onGridRowsUpdated!', action);
        console.debug('updated', updated);
        if (action !== 'COPY_PASTE') {
            this.setState((state) => {
                const rows = state.rows.slice();
                for (let i = fromRow; i <= toRow; i++) {
                    rows[i] = { ...rows[i], ...updated };
                }
                return { rows };
            });
        }
    };

    setSelection(args) {
        this.setState({
            topLeft: {
                rowIdx: args.topLeft.rowIdx,
                colIdx: args.topLeft.idx,
            },
            botRight: {
                rowIdx: args.bottomRight.rowIdx,
                colIdx: args.bottomRight.idx,
            },
        });
    };

    render() {
        const visibleRows = Data.Selectors.getRows(this.state);
        return (
            <div>
                <h3>React Webpack Test App</h3>
                <DraggableContainer onHeaderDrop={this.onHeaderDrop}>
                    <ReactDataGrid
                        columns={this.state.columns}
                        rowGetter={i => visibleRows[i]}
                        rowsCount={visibleRows.length}
                        onGridRowsUpdated={this.onGridRowsUpdated}
                        enableCellSelect={true}
                        headerRowHeight={70}
                        getCellActions={getCellActions}
                        cellRangeSelection={{
                            onComplete: this.setSelection,
                        }}
                        onCellSelected={s => this.setSelection({ topLeft: s, bottomRight: s })}
                        onGridSort={(sortColumn, sortDirection) =>
                            this.setState({ rows: sortRows(this.state.rows, sortColumn, sortDirection) })
                        }
                        contextMenu={
                            <ExampleContextMenu
                                onRowDelete={(e, { rowIdx }) => deleteRow(rowIdx)}
                                onRowInsertAbove={(e, { rowIdx }) => insertRow(rowIdx)}
                                onRowInsertBelow={(e, { rowIdx }) => insertRow(rowIdx + 1)}
                            />
                        }
                        RowsContainer={ContextMenuTrigger}
                        getSubRowDetails={getSubRowDetails(this.state.expandedRows)}
                        onCellExpand={args => this.setState(onCellExpand(args))}
                    />
                </DraggableContainer>
            </div>
        );
    }
}