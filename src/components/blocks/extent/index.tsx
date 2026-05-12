import type {Block} from "@knaw-huc/panoptes-react";

export interface ExtentBlockValue {
    type: 'pagesCount' | 'leavesCount';
    value: string;
}

export interface ExtentBlock extends Block {
    type: 'extent';
    value: ExtentBlockValue;
}

const mapping = {
    "leavesCount": "leaves",
    "pagesCount": "pages",
}

export default function ExtentBlockRenderer({block}: { block: ExtentBlock }) {

    const { value } = block as ExtentBlock;

    // if (!value) {
    //     return <span className={classes.empty}>—</span>;
    // }

    const type = mapping[value.type];

    return (
        <span>{value.value} {type}</span>
    );
}
