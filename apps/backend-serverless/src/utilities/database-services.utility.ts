export type Pagination = {
    pageSize: number;
    page: number;
};

export const calculatePaginationSkip = (pagination: Pagination) => {
    return pagination.pageSize * (pagination.page - 1);
};

export const DEFAULT_PAGINATION_SIZE = 10;
