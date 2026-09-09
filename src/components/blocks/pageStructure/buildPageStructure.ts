export interface StructureSegment {
    id: string;
    label: string;
    folioRange: string;
    anchorId: string;
    title?: string;
    start: number;
    end: number;
    leftPercent: number;
    widthPercent: number;
    offsetPx: number;
}

export interface PageStructureData {
    totalPages: number;
    units: StructureSegment[];
    contents: StructureSegment[];
}

interface FolioRange {
    start: number;
    end: number;
}

interface PageRange {
    start: number;
    end: number;
}

interface TrackedSegment {
    id: string;
    label: string;
    folioRange: string;
    anchorId: string;
    title?: string;
    start: number;
    end: number;
    track: number;
}

const OVERLAP_TRACK_SPACING_PX = 22;

function asArray(value: unknown): unknown[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function fieldValue(obj: unknown, ...keys: string[]): string | undefined {
    let current: unknown = obj;
    for (const key of keys) {
        if (!current || typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[key];
    }
    if (typeof current === 'string') {
        const trimmed = current.trim();
        return trimmed || undefined;
    }
    if (current && typeof current === 'object') {
        const record = current as Record<string, unknown>;
        const raw = record['@value'] ?? record['`@value`'];
        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            return trimmed || undefined;
        }
    }
    return undefined;
}

function parseFolioRangesFromManuscriptUnit(value: string): FolioRange[] {
    const tailMatch = value.match(/(?:ff?\.\s*)?(\d+\s*-\s*\d+(?:\s*,\s*\d+\s*-\s*\d+)*)\s*$/i);
    if (!tailMatch) return [];

    return tailMatch[1]
        .split(',')
        .map((part) => part.trim())
        .map((part) => {
            const [startText, endText] = part.split('-').map((item) => item.trim());
            const start = Number.parseInt(startText, 10);
            const end = Number.parseInt(endText, 10);
            if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
            return {start: Math.min(start, end), end: Math.max(start, end)};
        })
        .filter((range): range is FolioRange => range !== null);
}

function locusTokenToPage(token: string): number | null {
    const match = token.match(/^(\d+)([rv])$/i);
    if (!match) return null;
    const folio = Number.parseInt(match[1], 10);
    if (!Number.isFinite(folio) || folio < 1) return null;
    return match[2].toLowerCase() === 'r' ? folio * 2 - 1 : folio * 2;
}

function parseLocusFromTo(from: string, to: string): PageRange | null {
    const start = locusTokenToPage(from.replace(/\s+/g, ''));
    const end = locusTokenToPage(to.replace(/\s+/g, ''));
    if (!start || !end) return null;
    return {start: Math.min(start, end), end: Math.max(start, end)};
}

function assignTracks(segments: TrackedSegment[]): {segments: TrackedSegment[]; trackCount: number} {
    const sorted = [...segments].sort((a, b) => a.start - b.start || a.end - b.end);
    const trackEnds: number[] = [];

    for (const segment of sorted) {
        let track = 0;
        while (track < trackEnds.length && segment.start <= trackEnds[track]) {
            track += 1;
        }
        if (track === trackEnds.length) {
            trackEnds.push(segment.end);
        } else {
            trackEnds[track] = segment.end;
        }
        segment.track = track;
    }

    return {segments: sorted, trackCount: Math.max(trackEnds.length, 1)};
}

function withHorizontalGeometry(segments: TrackedSegment[], totalPages: number): StructureSegment[] {
    return segments.map((segment) => ({
        id: segment.id,
        label: segment.label,
        folioRange: segment.folioRange,
        anchorId: segment.anchorId,
        title: segment.title,
        start: segment.start,
        end: segment.end,
        leftPercent: ((segment.start - 1) / totalPages) * 100,
        widthPercent: (Math.max(segment.end - segment.start + 1, 1) / totalPages) * 100,
        offsetPx: segment.track * OVERLAP_TRACK_SPACING_PX,
    }));
}

export function buildPageStructure(parts: unknown, items: unknown): PageStructureData | null {
    const unitSegments: TrackedSegment[] = [];

    for (const [unitIndex, part] of asArray(parts).entries()) {
        const label = fieldValue(part, 'PartTitle', 'shelfmarkPlusPageRange');
        if (!label) continue;

        for (const range of parseFolioRangesFromManuscriptUnit(label)) {
            unitSegments.push({
                id: `unit-${unitIndex + 1}-${range.start}-${range.end}`,
                label,
                folioRange: `ff. ${range.start}–${range.end}`,
                anchorId: `manuscript-unit-${unitIndex + 1}`,
                start: range.start * 2 - 1,
                end: range.end * 2,
                track: 0,
            });
        }
    }

    const contentSegments: TrackedSegment[] = [];

    for (const [itemIndex, item] of asArray(items).entries()) {
        const from = fieldValue(item, 'locusFrom');
        const to = fieldValue(item, 'locusTo');
        if (!from || !to) continue;

        const range = parseLocusFromTo(from, to);
        if (!range) continue;

        const title = fieldValue(item, 'Title', 'title') ?? '';
        const locusLabel = `${from} – ${to}`;
        contentSegments.push({
            id: `content-${itemIndex + 1}`,
            label: title ? `${locusLabel}: ${title}` : locusLabel,
            folioRange: locusLabel,
            anchorId: `content-item-${itemIndex + 1}`,
            title: title || undefined,
            start: range.start,
            end: range.end,
            track: 0,
        });
    }

    if (unitSegments.length === 0 && contentSegments.length === 0) {
        return null;
    }

    const maxPage = Math.max(
        ...unitSegments.map((segment) => segment.end),
        ...contentSegments.map((segment) => segment.end),
        1,
    );

    const trackedUnits = assignTracks(unitSegments);
    const trackedContent = assignTracks(contentSegments);

    return {
        totalPages: maxPage,
        units: withHorizontalGeometry(trackedUnits.segments, maxPage),
        contents: withHorizontalGeometry(trackedContent.segments, maxPage),
    };
}

export function buildStructureSummary(data: PageStructureData): string {
    const unitCount = data.units.length;
    const contentCount = data.contents.length;
    const parts = [
        unitCount > 0 ? `${unitCount} manuscript unit segment${unitCount === 1 ? '' : 's'}` : null,
        contentCount > 0 ? `${contentCount} content segment${contentCount === 1 ? '' : 's'}` : null,
    ].filter(Boolean);

    const overview = parts.length > 0 ? parts.join(' and ') : 'No structure data';
    return `${overview} across ${data.totalPages} pages.`;
}
