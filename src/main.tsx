import {createPanoptesRoot, PanoptesRouterProvider} from "@knaw-huc/panoptes-react";
import {createTranslate} from "./i18n/i18n.ts";
import '@knaw-huc/panoptes-react/style.css';
import '@knaw-huc/panoptes-react-blocks/style.css';
import './css/theme.css'
import './css/index.css'
import {
    ExternalLinkBlockRenderer,
    JsonBlockRenderer, LabelBlockRenderer,
    LinkBlockRenderer, MapBlockRenderer,
    MarkdownBlockRenderer, ScreenBlockRenderer, ToggleBlockRenderer, TagsBlockRenderer
} from "@knaw-huc/panoptes-react-blocks";
import IIIFResultCard, {type IIIFResultCardProps} from "./components/IIIFResultCard";
import DimensionsBlockRenderer from "./components/blocks/dimensions";
import ExtentBlockRenderer from "./components/blocks/extent";
import PersonBlockRenderer from "./components/blocks/person";
import PageRangeBlockRenderer from "./components/blocks/pageRange";
import IIIFImageBlockRenderer from "./components/blocks/iiifImage";

const panoptesUrl = '$VITE_PANOPTES_URL';
const panoptesIsEmbedded = '$VITE_PANOPTES_IS_EMBEDDED';
const panoptesSearchPath = '$VITE_PANOPTES_SEARCH_PATH';
const panoptesDetailPath = '$VITE_PANOPTES_DETAIL_PATH';
const panoptesDataset = '$VITE_PANOPTES_DATASET';

const getVar = (envVariable: string): string | undefined =>
    envVariable.startsWith('$VITE_')
        ? (envVariable.slice(1) in import.meta.env ? import.meta.env[envVariable.slice(1)] : undefined)
        : envVariable;


if (window.location.pathname === '/') {
    const dataset = getVar(panoptesDataset);
    const searchPath = getVar(panoptesSearchPath);
    const target = searchPath?.replace('$dataset', dataset ?? '') ?? `/${dataset}${searchPath}`;
    window.location.replace(target);
}

const root = createPanoptesRoot<IIIFResultCardProps>(document.getElementById('root')!, {
    url: getVar(panoptesUrl),
    isEmbedded: getVar(panoptesIsEmbedded) === 'true',
    searchPath: getVar(panoptesSearchPath),
    detailPath: getVar(panoptesDetailPath),
    dataset: getVar(panoptesDataset),
    translateFn: createTranslate(),
    resultCardRenderer: (result, link) => <IIIFResultCard {...result} link={link}/>,
    blocks: new Map([
        ["json", JsonBlockRenderer],
        ["link", LinkBlockRenderer],
        ["external-link", ExternalLinkBlockRenderer],
        ["markdown", MarkdownBlockRenderer],
        ["toggle", ToggleBlockRenderer],
        ["screen", ScreenBlockRenderer],
        ["label", LabelBlockRenderer],
        ["map", MapBlockRenderer],
        ["dimensions", DimensionsBlockRenderer],
        ["extent", ExtentBlockRenderer],
        ["person", PersonBlockRenderer],
        ["pageRange", PageRangeBlockRenderer],
        ["tags", TagsBlockRenderer],
        ["iiifImage", IIIFImageBlockRenderer],
    ])
});
root.render(<PanoptesRouterProvider/>);