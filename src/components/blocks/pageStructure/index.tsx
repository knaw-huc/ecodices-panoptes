import {useEffect, useMemo, useState} from 'react';
import type {Block} from '@knaw-huc/panoptes-react';
import {usePanoptes} from '@knaw-huc/panoptes-react';
import {assignSegmentAnchorIds} from './assignSegmentAnchorIds';
import {buildPageStructure, buildStructureSummary, type StructureSegment} from './buildPageStructure';
import styles from './PageStructure.module.css';

export interface PageStructureBlockValue {
    parts: unknown;
    items: unknown;
}

export interface PageStructureBlock extends Block {
    type: 'pageStructure';
    value: PageStructureBlockValue;
}

const TRACK_PADDING = '1rem';
const BAR_GAP_PX = 1;

type SegmentKind = 'unit' | 'content';

interface SelectedSegment {
    id: string;
    kind: SegmentKind;
    folioRange: string;
    anchorId: string;
    title?: string;
}

function formatSelectionDetail(segment: SelectedSegment): string {
    if (segment.kind === 'content' && segment.title) {
        return `${segment.folioRange}: ${segment.title}`;
    }
    return segment.folioRange;
}

function barStyle(segment: StructureSegment, row: 'units' | 'contents') {
    const leftFraction = segment.leftPercent / 100;
    const widthFraction = segment.widthPercent / 100;
    const rowOffset = row === 'units'
        ? `calc(50% - 1.5rem - ${segment.offsetPx}px)`
        : `calc(50% + 1.5rem + ${segment.offsetPx}px)`;

    return {
        left: `calc(${TRACK_PADDING} + (100% - 2 * ${TRACK_PADDING}) * ${leftFraction})`,
        width: `max(calc((100% - 2 * ${TRACK_PADDING}) * ${widthFraction} - ${BAR_GAP_PX}px), 0.25rem)`,
        top: rowOffset,
    };
}

function segmentAriaLabel(
    segment: StructureSegment,
    kind: SegmentKind,
    translate: (key: string) => string,
): string {
    const kindLabel = kind === 'unit'
        ? translate('pageStructure.unitSegment')
        : translate('pageStructure.contentSegment');

    return `${kindLabel}: ${segment.folioRange}. ${segment.label}`;
}

function StructureBar({
    segment,
    kind,
    row,
    selected,
    onSelect,
    translate,
}: {
    segment: StructureSegment;
    kind: SegmentKind;
    row: 'units' | 'contents';
    selected: boolean;
    onSelect: (segment: SelectedSegment) => void;
    translate: (key: string) => string;
}) {
    const barClass = kind === 'unit' ? styles.unitBar : styles.contentBar;

    return (
        <button
            type="button"
            className={`${barClass}${selected ? ` ${styles.barSelected}` : ''}`}
            style={barStyle(segment, row)}
            title={segment.label}
            aria-label={segmentAriaLabel(segment, kind, translate)}
            aria-pressed={selected}
            onClick={() => onSelect({
                id: segment.id,
                kind,
                folioRange: segment.folioRange,
                anchorId: segment.anchorId,
                title: segment.title,
            })}
        />
    );
}

export default function PageStructureBlockRenderer({block}: { block: PageStructureBlock }) {
    const {translateFn} = usePanoptes();
    const translate = (key: string): string => (translateFn ? translateFn(key) : key);
    const [selected, setSelected] = useState<SelectedSegment | null>(null);

    const structure = useMemo(
        () => buildPageStructure(block.value?.parts, block.value?.items),
        [block.value?.parts, block.value?.items],
    );

    useEffect(() => {
        if (!structure) return;
        assignSegmentAnchorIds();
    }, [structure]);

    const helpId = 'page-structure-help';
    const selectionId = 'page-structure-selection';

    if (!structure) {
        const unavailable = translate('pageStructure.unavailable');
        return (
            <figure className={styles.figure} aria-label={translate('pageStructure.figureLabel')}>
                <p id={helpId} className={styles.help}>
                    {translate('pageStructure.help')}
                </p>
                <p className={styles.unavailable} role="status">
                    {unavailable}
                </p>
            </figure>
        );
    }

    const summary = buildStructureSummary(structure);

    return (
        <figure className={styles.figure} aria-label={translate('pageStructure.figureLabel')}>
            <p id={helpId} className={styles.help}>
                {translate('pageStructure.help')}
            </p>
            <div
                className={styles.root}
                data-page-structure-root=""
                aria-describedby={`${helpId} ${selectionId}`}
            >
                <span className={`${styles.rowLabel} ${styles.rowLabelUnits}`} aria-hidden="true">
                    {translate('pageStructure.units')}
                </span>
                <span className={`${styles.rowLabel} ${styles.rowLabelContents}`} aria-hidden="true">
                    {translate('pageStructure.contents')}
                </span>

                <div className={styles.guideCenter} aria-hidden="true"/>

                {structure.units.map((segment) => (
                    <StructureBar
                        key={segment.id}
                        segment={segment}
                        kind="unit"
                        row="units"
                        selected={selected?.id === segment.id}
                        onSelect={setSelected}
                        translate={translate}
                    />
                ))}

                {structure.contents.map((segment) => (
                    <StructureBar
                        key={segment.id}
                        segment={segment}
                        kind="content"
                        row="contents"
                        selected={selected?.id === segment.id}
                        onSelect={setSelected}
                        translate={translate}
                    />
                ))}
            </div>
            <div
                id={selectionId}
                className={styles.selection}
                aria-live="polite"
                aria-atomic="true"
            >
                {selected ? (
                    <>
                        <p className={styles.selectionDetail}>{formatSelectionDetail(selected)}</p>
                        <p className={styles.selectionLink}>
                            <a href={`#${selected.anchorId}`} className={styles.segmentLink}>
                                {translate('pageStructure.viewSegment')}
                            </a>
                        </p>
                    </>
                ) : (
                    <p className={styles.selectionHint}>{translate('pageStructure.selectionEmpty')}</p>
                )}
            </div>
            <p className={styles.srOnly}>{summary}</p>
        </figure>
    );
}
