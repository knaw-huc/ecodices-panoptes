import {createPanoptesRoot, PanoptesRouterProvider} from "@knaw-huc/panoptes-react";
import {createTranslate} from "./i18n/i18n.ts";
import '@knaw-huc/panoptes-react/style.css';
import './css/theme.css'
import './css/index.css'


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

const root = createPanoptesRoot(document.getElementById('root')!, {
    url: getVar(panoptesUrl),
    isEmbedded: getVar(panoptesIsEmbedded) === 'true',
    searchPath: getVar(panoptesSearchPath),
    detailPath: getVar(panoptesDetailPath),
    dataset: getVar(panoptesDataset),
    translateFn: createTranslate(),
    blocks: new Map([
    ])
});
root.render(<PanoptesRouterProvider/>);