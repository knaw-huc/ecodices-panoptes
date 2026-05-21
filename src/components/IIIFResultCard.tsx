import {ResultCard, type ResultCardProps} from "@knaw-huc/panoptes-react";
import IIIFImageBlockRenderer, {type IIIFImageBlock} from "./blocks/iiifImage";

export interface IIIFResultCardProps extends ResultCardProps {
    id: string;
    iiifManifest: string;
}

export default function IIIFResultCard(props: IIIFResultCardProps) {
    const iiifBlock: IIIFImageBlock = {
        type: 'iiifImage',
        value: {
            // TODO: Override with default IIIF manifest purely for test purposes
            manifestUri: props.iiifManifest || 'https://access.ecodices.nl/iiif/presentation/MMW_10_A_12/manifest',
            width: 200,
        }
    };

    return (
        <ResultCard {...props} thumbnail={<IIIFImageBlockRenderer block={iiifBlock}/>}/>
    );
}
