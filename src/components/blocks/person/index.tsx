import type {Block} from "@knaw-huc/panoptes-react";

export interface PersonBlockValue {
    personType: string
    name: string;
    uri: string;
}

export interface PersonBlock extends Block {
    type: 'person';
    value: any[];
}

function displayPerson(person: any) {
    const type = person.personType ? person.personType['@value'] : ""
    const name = person.name ? person.name['@value'] : person.persName ? person.persName[0]['@value'] : "configuration error"

    return <span>{name} ({type})</span>
}

export default function PersonBlockRenderer({block}: { block: PersonBlock }) {

    let { value } = block as PersonBlock;

    console.log("Person value", value)

    if (value == undefined || value.length == 0) {
        return <span>—</span>;
    }

    if (!Array.isArray(value)) {
        value = [value];
    }

    return (<>
        {value.map(displayPerson)}
    </>);
}
