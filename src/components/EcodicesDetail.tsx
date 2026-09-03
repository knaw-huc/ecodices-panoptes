import {
    BackToSearch,
    BlockLoader,
    DetailLayout,
    useDetails,
    type Block,
} from '@knaw-huc/panoptes-react';
import {structureScreenRow} from '../config/structureScreenRow';

interface ScreenRow {
    groupId?: string;
    displayType?: string;
    columns?: unknown[];
    rows?: ScreenRow[];
    elements?: unknown[];
}

interface ScreenBlockConfig {
    form?: {
        rows?: ScreenRow[];
    };
}

function patchScreenBlock(block: Block): Block {
    if (block.type !== 'screen') {
        return block;
    }

    const config = block.config as ScreenBlockConfig | undefined;
    const rows = config?.form?.rows;
    if (!rows?.length || rows.some((row) => row.groupId === 'structure')) {
        return block;
    }

    const objectIndex = rows.findIndex((row) => row.groupId === 'object');
    const insertAt = objectIndex >= 0 ? objectIndex + 1 : 0;
    const nextRows = [...rows];
    nextRows.splice(insertAt, 0, structureScreenRow);

    return {
        ...block,
        config: {
            ...config,
            form: {
                ...config?.form,
                rows: nextRows,
            },
        },
    };
}

export default function EcodicesDetail() {
    return (
        <DetailLayout.Root>
            <DetailLayout.Side>
                <BackToSearch/>
            </DetailLayout.Side>
            <DetailMain/>
        </DetailLayout.Root>
    );
}

function DetailMain() {
    const {data: details} = useDetails();

    return (
        <DetailLayout.Main>
            {details.item_data.map((block, index) => (
                <BlockLoader key={index} block={patchScreenBlock(block)}/>
            ))}
        </DetailLayout.Main>
    );
}
