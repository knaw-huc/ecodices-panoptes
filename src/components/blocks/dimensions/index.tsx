import type {Block} from "@knaw-huc/panoptes-react";

export interface DimensionsBlockValue {
    width: string;
    height: string;
}

export interface DimensionsBlock extends Block {
    type: 'dimensions';
    value: DimensionsBlockValue;
}

export default function DimensionsBlockRenderer({block}: { block: DimensionsBlock }) {

    const { value } = block as DimensionsBlock;

    // if (!value) {
    //     return <span className={classes.empty}>—</span>;
    // }

    // If it starts with a number we consider it numeric (e.g. "50 mm") and render 'a x b'. Otherwise,
    // we can assume something different was entered in width (usually height is empty then).
    const isNum = /^d+/.test(value.width)

    if (!isNum) {
        return <span>{value.width} {value.height}</span>
    }

    return (
        <span>{value.width} x {value.height}</span>
    );
}
