import type {Block} from "@knaw-huc/panoptes-react";

export interface PersonBlockValue {
    personType: string
    name: string;
    uri: string;
}

export interface PersonBlock extends Block {
    type: 'person';
    value: PersonBlockValue;
}

export default function PersonBlockRenderer({block}: { block: PersonBlock }) {

    const { value } = block as PersonBlock;

    if (!value.name) {
        return <span>—</span>;
    }

    return (
        <span>{value.name} ({value.personType})</span>
    );
}
