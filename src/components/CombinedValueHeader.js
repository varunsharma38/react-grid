import React from 'react';

export function CombinedValueHeader(props) {
    return (
        <div className='center-align'>
            {props.column.name}
            <div>
                <span className='sub-header'>Value 1</span>
                <span className='sub-header'>Value 2</span>
            </div>
        </div>
    )
}