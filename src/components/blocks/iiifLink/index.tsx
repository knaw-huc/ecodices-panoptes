import type {Block} from "@knaw-huc/panoptes-react";

export interface IIIFLinkBlock extends Block {
    type: 'iiifLink';
    value: string;
}

const viewer_base_url = "https://access.ecodices.nl/universalviewer/#?manifest="

export default function IIIFLinkBlockRenderer({block}: {block: IIIFLinkBlock}) {
    const {value} = block as IIIFLinkBlock;

    return <a href={viewer_base_url + value} target={"_blank"}>Open IIIF viewer</a>
}