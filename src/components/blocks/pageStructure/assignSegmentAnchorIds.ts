function assignArrayItemIds(groupId: string, idPrefix: string): void {
    const fieldset = document.querySelector(`fieldset[data-group-id="${groupId}"]`);
    if (!fieldset) return;

    const arrayRoot = fieldset.querySelector('[class*="_arrayInput_"]');
    if (!arrayRoot) return;

    const items = arrayRoot.querySelectorAll(':scope > [class*="_arrayItem_"]');
    items.forEach((item, index) => {
        item.id = `${idPrefix}-${index + 1}`;
    });
}

export function assignSegmentAnchorIds(): void {
    assignArrayItemIds('physical', 'manuscript-unit');
    assignArrayItemIds('contents', 'content-item');
}
