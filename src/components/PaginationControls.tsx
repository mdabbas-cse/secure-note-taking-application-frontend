import type { Pagination } from '../api/types';

interface Props {
  pagination?: Pagination;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: Props) {
  if (!pagination) return null;
  const { currentPage, totalPages, totalRecords, hasNextPage, hasPreviousPage } = pagination;
  return (
    <div className="pagination">
      <button disabled={!hasPreviousPage} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </button>
      <span>
        Page {currentPage} of {Math.max(totalPages, 1)} ({totalRecords} total)
      </span>
      <button disabled={!hasNextPage} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </button>
    </div>
  );
}
