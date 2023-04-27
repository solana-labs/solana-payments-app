import { PaginatedTablePageIndicatorButton } from "./PaginatedTablePageIndicatorButton";

interface Props {
  className?: string;
  curPage: number;
  /**
   * The total number of pages
   */
  numPages: number;
  onSelectPage?(page: number): void;
}

export function PaginatedTablePageIndicator(props: Props) {
  const oneBefore = props.curPage - 1;
  const oneAfter = props.curPage + 1;

  return (
    <div className={props.className}>
      <div className="text-sm text-slate-500 md:hidden">
        Page{" "}
        <span className="font-medium text-slate-800">{props.curPage + 1}</span>{" "}
        of <span className="font-medium text-slate-800">{props.numPages}</span>
      </div>
      <div className="hidden items-center md:flex">
        <PaginatedTablePageIndicatorButton
          selected={props.curPage === 0}
          onClick={() => props.onSelectPage?.(0)}
        >
          1
        </PaginatedTablePageIndicatorButton>
        {props.numPages > 1 &&
          (props.curPage < 2 || props.curPage > props.numPages - 4) && (
            <PaginatedTablePageIndicatorButton
              selected={props.curPage === 1}
              onClick={() => props.onSelectPage?.(1)}
            >
              2
            </PaginatedTablePageIndicatorButton>
          )}
        {props.numPages > 2 &&
          (props.curPage < 2 || props.curPage > props.numPages - 3) && (
            <PaginatedTablePageIndicatorButton
              selected={props.curPage === 2}
              onClick={() => props.onSelectPage?.(2)}
            >
              3
            </PaginatedTablePageIndicatorButton>
          )}
        {props.numPages > 6 && props.curPage !== 2 && (
          <div className="h-10 w-10 text-slate-800 text-sm grid place-items-center">
            …
          </div>
        )}
        {props.numPages > 3 &&
          props.curPage >= 2 &&
          props.curPage <= props.numPages - 3 && (
            <>
              {props.numPages > 5 && (
                <PaginatedTablePageIndicatorButton
                  onClick={() => props.onSelectPage?.(oneBefore)}
                >
                  {oneBefore + 1}
                </PaginatedTablePageIndicatorButton>
              )}
              <PaginatedTablePageIndicatorButton
                selected
                onClick={() => props.onSelectPage?.(props.curPage)}
              >
                {props.curPage + 1}
              </PaginatedTablePageIndicatorButton>
              {props.numPages > 5 && (
                <PaginatedTablePageIndicatorButton
                  selected={props.curPage === oneAfter}
                  onClick={() => props.onSelectPage?.(oneAfter)}
                >
                  {oneAfter + 1}
                </PaginatedTablePageIndicatorButton>
              )}
            </>
          )}
        {props.numPages > 6 &&
          props.curPage >= 2 &&
          props.curPage <= props.numPages - 4 && (
            <div className="h-10 w-10 text-slate-800 text-sm grid place-items-center">
              …
            </div>
          )}
        {props.numPages > 5 &&
          (props.curPage < 2 || props.curPage > props.numPages - 3) && (
            <PaginatedTablePageIndicatorButton
              selected={props.curPage === props.numPages - 3}
              onClick={() => props.onSelectPage?.(props.numPages - 3)}
            >
              {props.numPages - 2}
            </PaginatedTablePageIndicatorButton>
          )}
        {props.numPages > 4 &&
          (props.curPage < 3 || props.curPage > props.numPages - 3) && (
            <PaginatedTablePageIndicatorButton
              selected={props.curPage === props.numPages - 2}
              onClick={() => props.onSelectPage?.(props.numPages - 2)}
            >
              {props.numPages - 1}
            </PaginatedTablePageIndicatorButton>
          )}
        {props.numPages > 3 && (
          <PaginatedTablePageIndicatorButton
            selected={props.curPage === props.numPages - 1}
            onClick={() => props.onSelectPage?.(props.numPages - 1)}
          >
            {props.numPages}
          </PaginatedTablePageIndicatorButton>
        )}
      </div>
    </div>
  );
}
