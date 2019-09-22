import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { DraggableHeader, Menu, Data } from 'react-data-grid-addons'
import { range } from 'lodash';

import { ExampleContextMenu } from './components/ExampleContextMenu'
import { columns } from './data/columns'
import { rows } from './data/rows'
import { deleteRow, insertRow } from './utils/context-menu';
import { getCellActions } from './utils/cell-actions';
import { sortRows } from './utils/sort-rows';
import { getSubRowDetails, onCellExpand } from './utils/tree-view'

import './styles/App.scss';

const { DraggableContainer } = DraggableHeader;
const { ContextMenuTrigger } = Menu;

const defaultParsePaste = str => (
    str.split(/\r\n|\n|\r/)
        .map(row => row.split('\t'))
);

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
        this.setSelection = this.setSelection.bind(this)
        this.handleCopy = this.handleCopy.bind(this)
        this.handlePaste = this.handlePaste.bind(this)
        this.updateRows = this.updateRows.bind(this)
        this.removeAllListeners = this.removeAllListeners.bind(this)

        document.addEventListener('copy', this.handleCopy);
        document.addEventListener('paste', this.handlePaste);
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
                <h3 className='my-5 center-align'>React Grid</h3>
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