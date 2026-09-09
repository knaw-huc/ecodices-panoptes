import {Suspense, use, useLayoutEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {globalVault, getImageFromTileSource, getThumbnail, Vault} from '@iiif/helpers';

import type {Block} from '@knaw-huc/panoptes-react';
import type {IIIFExternalWebResource, ImageService} from '@iiif/presentation-3';

import {viewer_base_url} from '../iiifLink';

const vault = globalVault() as Vault;
const cache = new Map<string, Promise<string | null>>();

export interface IIIFImageBlockValue {
    manifestUri: string;
    width: number;
    height?: number;
}

export interface IIIFImageBlock extends Block {
    type: 'iiifImage';
    value: IIIFImageBlockValue;
}

function getImageHrefPromise(manifestUri: string, width: number, height?: number) {
    const key = `${manifestUri}:${width}:${height ?? ''}`;
    if (!cache.has(key)) {
        cache.set(key, getImageHref(manifestUri, width, height));
    }
    return cache.get(key)!;
}

function normalizeManifestUri(manifestUri: string) {
    return manifestUri.startsWith('http') ? manifestUri : `https://${manifestUri}`;
}

async function getImageHref(manifestUri: string, width: number, height?: number) {
    try {
        manifestUri = normalizeManifestUri(manifestUri);

        const manifest = await vault.loadManifest(manifestUri);
        if (!manifest)
            return null;

        const thumbnailRef = await getThumbnail(manifest, {vault, width, height});
        if (!thumbnailRef?.best?.id)
            return null;

        // Type is 'unknown' when the Image API v2 is encountered
        // Workaround to inspect the Service and build up the IIIF image URL ourselves
        if (thumbnailRef.best.type === 'unknown') {
            const thumbnail = await vault.get(thumbnailRef.best.id) as IIIFExternalWebResource;
            if (!thumbnail)
                return null;

            const service = thumbnail.service![0] as ImageService;
            const id = service.id ?? service['@id'];

            if (id) {
                const size = height ? `${width},${height}` : `${width},`;
                return `${id}/full/${size}/0/default.jpg`;
            }
        }

        // Found a IIIF service, so use that to obtain a IIIF image URL
        if (thumbnailRef.best.type === 'fixed-service') {
            return getImageFromTileSource(thumbnailRef.best, width, height).id;
        }

        return thumbnailRef.best.id;
    }
    catch (err: unknown) {
        console.error(`${manifestUri}: ${err}`);
        return null;
    }
}

export default function IIIFImageBlockRenderer({block: {value}}: { block: IIIFImageBlock }) {
    return (
        <Suspense fallback={<></>}>
            <ManifestThumbnail {...value}/>
        </Suspense>
    );
}

function ManifestThumbnail({manifestUri, width, height}: IIIFImageBlockValue) {
    const [side, setSide] = useState<Element | null>(null);

    useLayoutEffect(() => {
        setSide(document.querySelector('[class*="_detail_"] > [class*="_side_"]'));
    }, []);

    if (!width) {
        width = 400;
    }

    const imageHref = use(getImageHrefPromise(manifestUri, width, height));
    if (!imageHref) {
        return <></>;
    }

    const manifestHref = normalizeManifestUri(manifestUri);
    const viewerHref = viewer_base_url + manifestHref;

    const media = (
        <div className="detail-media">
            <img src={imageHref} width={width} height={height} alt="Manuscript thumbnail"/>
            <div className="iiif-links">
                <a href={viewerHref} target="_blank" rel="noopener noreferrer">
                    <img src="/iiif-logo.png" alt="" width={18} height={16} aria-hidden="true"/>
                    Open IIIF viewer
                </a>
            </div>
        </div>
    );

    if (side) {
        return createPortal(media, side);
    }

    return media;
}
