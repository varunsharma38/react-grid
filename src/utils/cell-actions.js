const idActions = [
    {
        icon: 'fa fa-align-justify',
        actions: [
            {
                text: 'Option 1',
                callback: () => {
                    alert('Option 1 clicked');
                }
            },
            {
                text: 'Option 2',
                callback: () => {
                    alert('Option 2 clicked');
                }
            }
        ]
    }
];

export function getCellActions(column, row) {
    const cellActions = {
        id: idActions
    };
    return cellActions[column.key];
}