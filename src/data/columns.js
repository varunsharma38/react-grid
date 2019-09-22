import React from 'react'
import { Editors } from 'react-data-grid-addons'

import { CombinedValueFormatter } from '../components/CombinedValueFormatter'
import { CombinedValueHeader } from '../components/CombinedValueHeader'

const { DropDownEditor } = Editors;

const issueTypes = [
    { id: 'bug', value: 'Bug' },
    { id: 'epic', value: 'Epic' },
    { id: 'story', value: 'Story' }
];

const IssueTypeEditor = <DropDownEditor options={issueTypes} />;

export const columns = [
    {
        key: 'id', name: 'ID', events: {
            onDoubleClick: function (ev) {
                alert(`Cell Double Clicked`);
            }
        }
    },
    { key: 'title', name: 'Title', draggable: true, resizable: true, sortable: true },
    { key: 'complete', name: 'Complete', draggable: true },
    { key: 'combinedValue', name: 'Combined Value', draggable: true, headerRenderer: CombinedValueHeader, formatter: CombinedValueFormatter },
    { key: 'issueType', name: 'Task Type', draggable: true, editor: IssueTypeEditor }
];