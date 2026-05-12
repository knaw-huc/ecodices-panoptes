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

    return (
        <span>{value.width} x {value.height}</span>
    );
}
