import type {Block} from "@knaw-huc/panoptes-react";

export interface PageRangeBlockValue {
    from: string
    to: string;
}

export interface PageRangeBlock extends Block {
    type: 'pageRange';
    value: PageRangeBlockValue;
}

export default function PageRangeBlockRenderer({block}: { block: PageRangeBlock }) {

    const { value } = block as PageRangeBlock;

    if (!value.from) {
        return <span>—</span>;
    }

    return (
        <span>{value.from} - {value.to}</span>
    );
}
