import React from 'react';

export function CombinedValueFormatter(props) {
    return (
        <div className='center-align'>
            <span className='sub-value'>{props.row.value1}</span>
            <span className='sub-value'>{props.row.value2}</span>
        </div>
    )
}