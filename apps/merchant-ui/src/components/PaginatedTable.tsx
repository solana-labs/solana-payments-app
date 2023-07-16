import * as RE from '@/lib/Result';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { PaginatedTableArrowButton } from './PaginatedTableArrowButton';
import { PaginatedTablePageIndicator } from './PaginatedTablePageIndicator';

const STYLES = {
    HEADER: twMerge('border-b', 'border-gray-200', 'font-medium', 'pb-3', 'text-slate-600', 'text-xs'),
    CELL: twMerge('border-b', 'border-gray-200', 'flex', 'items-center'),
};

interface Props<R extends { [key: string]: any }, CO extends (keyof R)[]> {
    /**
     * Additional styling properties for the table
     */
    className?: string;
    /**
     * Which columns from each row's data object should be displayed, and the
     * order in which they should appear. The first column is priviledged in
     * terms of layout; when the screen width shrink and can no longer fit the
     * entire table, the first column specified will be "frozen" and always
     * visible
     */
    columns: CO;
    /**
     * A list of render functions for each item defined in the `columns` prop.
     */
    children: {
        [K in CO[number]]: (data: R[K], row: R) => JSX.Element;
    };
    /**
     * The data to be displayed for a page. Each item in the array represents a
     * row. Each row's data is in the form of an object with keys mapping to
     * values
     */
    curPage: RE.Result<R[]>;
    /**
     * A label for each of the items defined in the `columns` prop.
     */
    headers: { [K in CO[number]]: string };
    /**
     * The total number of pages
     */
    numPages: number;
    /**
     * The height of each row in the table. Accepts either a tailwindcss class,
     * in the form of a string, or a px height, in the form of a number
     */
    rowHeight: string | number;
    /**
     * The number of rows per page
     */
    rowsPerPage: number;
    /**
     * Callback that indicates the page has changed
     */
    onPageChange?(page: number): void;
}

/**
 * A responsive paginated table layout for data. When the screen width shrinks,
 * the first column will remain frozen while the rest of the grid will scroll
 * horizontally.
 */
export function PaginatedTable<R extends { [key: string]: any }, CO extends (keyof R)[]>(props: Props<R, CO>) {
    const [page, setPage] = useState(0);

    useEffect(() => {
        props.onPageChange?.(page);
    }, [page]);

    const numCols = props.columns.length;
    const numPages = props.numPages;

    return (
        <div className={twMerge(props.className)}>
            <div className="grid grid-cols-[minmax(max-content,1fr),minmax(0,max-content)] overflow-hidden">
                <div className="border-r border-gray-200 shadow-lg md:border-none md:shadow-none">
                    {RE.match(
                        props.curPage,
                        () => (
                            <>
                                <div className={twMerge(STYLES.HEADER)}>&nbsp;</div>
                                {Array.from({ length: props.rowsPerPage }).map((_, i) => (
                                    <div
                                        className={twMerge(
                                            STYLES.CELL,
                                            typeof props.rowHeight === 'string' && props.rowHeight,
                                            'pr-6',
                                        )}
                                        key={i}
                                        style={{
                                            height: typeof props.rowHeight === 'number' ? props.rowHeight : undefined,
                                        }}
                                    />
                                ))}
                            </>
                        ),
                        () => (
                            <>
                                <div className={twMerge(STYLES.HEADER)}>&nbsp;</div>
                                {Array.from({ length: props.rowsPerPage }).map((_, i) => (
                                    <div
                                        className={twMerge(
                                            STYLES.CELL,
                                            typeof props.rowHeight === 'string' && props.rowHeight,
                                            'pr-6',
                                        )}
                                        key={i}
                                        style={{
                                            height: typeof props.rowHeight === 'number' ? props.rowHeight : undefined,
                                        }}
                                    />
                                ))}
                            </>
                        ),
                        rowsInPage => (
                            <>
                                <div className={twMerge(STYLES.HEADER, 'pr-6')}>{props.headers[props.columns[0]]}</div>
                                {rowsInPage.map((row, i) => {
                                    const data = row[props.columns[0]];

                                    return (
                                        <div
                                            className={twMerge(
                                                STYLES.CELL,
                                                typeof props.rowHeight === 'string' && props.rowHeight,
                                                'pr-6',
                                            )}
                                            key={i}
                                            style={{
                                                height:
                                                    typeof props.rowHeight === 'number' ? props.rowHeight : undefined,
                                            }}
                                        >
                                            {props.children[props.columns[0]](data, row)}
                                        </div>
                                    );
                                })}
                            </>
                        ),
                    )}
                </div>
                <div className="overflow-x-auto">
                    <div
                        className="grid min-w-max md:min-w-full"
                        style={{
                            gridTemplateColumns: `repeat(${numCols - 1}, max-content)`,
                        }}
                    >
                        {RE.match(
                            props.curPage,
                            () => (
                                <>
                                    {props.columns.slice(1).map((column, i) => (
                                        <div className={twMerge(STYLES.HEADER, i > 0 ? 'pl-12' : 'pl-6')} key={i}>
                                            &nbsp;
                                        </div>
                                    ))}
                                    {Array.from({ length: props.rowsPerPage }).map((_, ri) =>
                                        props.columns.slice(1).map((column, ci) => (
                                            <div
                                                className={twMerge(
                                                    STYLES.CELL,
                                                    typeof props.rowHeight === 'string' && props.rowHeight,
                                                    ci > 0 ? 'pl-12' : 'pl-6',
                                                )}
                                                key={`${ri}-${ci}`}
                                                style={{
                                                    height:
                                                        typeof props.rowHeight === 'number'
                                                            ? props.rowHeight
                                                            : undefined,
                                                }}
                                            />
                                        )),
                                    )}
                                </>
                            ),
                            () => (
                                <>
                                    {props.columns.slice(1).map((column, i) => (
                                        <div className={twMerge(STYLES.HEADER, i > 0 ? 'pl-12' : 'pl-6')} key={i}>
                                            &nbsp;
                                        </div>
                                    ))}
                                    {Array.from({ length: props.rowsPerPage }).map((_, ri) =>
                                        props.columns.slice(1).map((column, ci) => (
                                            <div
                                                className={twMerge(
                                                    STYLES.CELL,
                                                    typeof props.rowHeight === 'string' && props.rowHeight,
                                                    ci > 0 ? 'pl-12' : 'pl-6',
                                                )}
                                                key={`${ri}-${ci}`}
                                                style={{
                                                    height:
                                                        typeof props.rowHeight === 'number'
                                                            ? props.rowHeight
                                                            : undefined,
                                                }}
                                            />
                                        )),
                                    )}
                                </>
                            ),
                            rowsInPage => (
                                <>
                                    {props.columns.slice(1).map((column, i) => (
                                        <div className={twMerge(STYLES.HEADER, i > 0 ? 'pl-12' : 'pl-6')} key={i}>
                                            {props.headers[column]}
                                        </div>
                                    ))}
                                    {rowsInPage.map((row, ri) =>
                                        props.columns.slice(1).map((column, ci) => {
                                            const data = row[column];

                                            return (
                                                <div
                                                    className={twMerge(
                                                        STYLES.CELL,
                                                        typeof props.rowHeight === 'string' && props.rowHeight,
                                                        ci > 0 ? 'pl-12' : 'pl-6',
                                                    )}
                                                    key={`${ri}-${ci}`}
                                                    style={{
                                                        height:
                                                            typeof props.rowHeight === 'number'
                                                                ? props.rowHeight
                                                                : undefined,
                                                    }}
                                                >
                                                    {props.children[column](data, row)}
                                                </div>
                                            );
                                        }),
                                    )}
                                </>
                            ),
                        )}
                    </div>
                </div>
            </div>
            {props.numPages > 1 && (
                <div className="flex items-center justify-between mt-4 md:mt-7">
                    <PaginatedTableArrowButton
                        direction="left"
                        disabled={page === 0}
                        onClick={() => setPage(cur => (cur > 0 ? cur - 1 : 0))}
                    />
                    <PaginatedTablePageIndicator curPage={page} numPages={numPages} onSelectPage={setPage} />
                    <PaginatedTableArrowButton
                        direction="right"
                        disabled={page === numPages - 1}
                        onClick={() => setPage(cur => (cur < numPages - 1 ? cur + 1 : numPages - 1))}
                    />
                </div>
            )}
        </div>
    );
}

PaginatedTable.defaultProps = {
    pageSize: 7,
};
