import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.scss";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("ellipsis-left");
      }

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-right");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="ls-pagination" aria-label="Page navigation">
      <button
        type="button"
        className="ls-pagination__btn ls-pagination__btn--prev"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span>Prev</span>
      </button>

      <div className="ls-pagination__pages">
        {pageNumbers.map((page, index) => {
          if (typeof page === "string" && page.startsWith("ellipsis")) {
            return (
              <span key={`ellipsis-${index}`} className="ls-pagination__ellipsis">
                &bull;&bull;&bull;
              </span>
            );
          }

          return (
            <button
              key={`page-${page}`}
              type="button"
              className={`ls-pagination__page-btn ${
                currentPage === page ? "is-active" : ""
              }`}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="ls-pagination__btn ls-pagination__btn--next"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
