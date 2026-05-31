"use client";

import { ArrowRight, ChefHat, Loader, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  GetRecipeSearchSuggestions,
  type RecipeSearchSuggestion,
} from "@/actions/get-searched-recipes";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  onClose?: () => void;
  initialValue?: string;
  autoFocus?: boolean;
  className?: string;
  compact?: boolean;
  dense?: boolean;
};

const searchPrompts = [
  "Search recipes and food stories...",
  "Paneer, breakfast, rajma chawal...",
  "Summer kitchen ideas and guides...",
  "Chicken curry, lunch, dinner ideas...",
  "Easy lunch, dinner, and snack ideas...",
  "Summer smoothies, juices, coolers...",
  "Quick snacks, evening cravings...",
];

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

export const SearchInput = ({
  onClose,
  initialValue = "",
  autoFocus = true,
  className,
  compact = false,
  dense = false,
}: SearchInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [searchResults, setSearchResults] = useState<RecipeSearchSuggestion[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(searchPrompts[0]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedValue = useDebounce(value, 280);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastSuggestionQueryRef = useRef("");
  const suggestionRequestIdRef = useRef(0);
  const hasSearchedRef = useRef(false);
  const resultsCountRef = useRef(0);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValue(initialValue);
      setSearchResults([]);
      setSelectedResultIndex(-1);
      setHasSearched(false);
      setIsSuggestionLoading(false);
      lastSuggestionQueryRef.current = "";
      resultsCountRef.current = 0;
      hasSearchedRef.current = false;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialValue]);

  useEffect(() => {
    hasSearchedRef.current = hasSearched;
  }, [hasSearched]);

  useEffect(() => {
    resultsCountRef.current = searchResults.length;
  }, [searchResults.length]);

  useEffect(() => {
    let promptIndex = 0;
    let characterIndex = searchPrompts[0].length;
    let deleting = true;
    let timer = 0;

    const typeNextCharacter = () => {
      const prompt = searchPrompts[promptIndex];

      if (deleting) {
        characterIndex -= 1;
        setAnimatedPlaceholder(prompt.slice(0, characterIndex));

        if (characterIndex === 0) {
          deleting = false;
          promptIndex = (promptIndex + 1) % searchPrompts.length;
          timer = window.setTimeout(typeNextCharacter, 380);
          return;
        }

        timer = window.setTimeout(typeNextCharacter, 34);
        return;
      }

      characterIndex += 1;
      setAnimatedPlaceholder(searchPrompts[promptIndex].slice(0, characterIndex));

      if (characterIndex === searchPrompts[promptIndex].length) {
        deleting = true;
        timer = window.setTimeout(typeNextCharacter, 1700);
        return;
      }

      timer = window.setTimeout(typeNextCharacter, 68);
    };

    timer = window.setTimeout(typeNextCharacter, 1700);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const dismissSuggestions = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        suggestionRequestIdRef.current += 1;
        setShowSuggestions(false);
        setIsSuggestionLoading(false);
      }
    };

    document.addEventListener("pointerdown", dismissSuggestions);

    return () => document.removeEventListener("pointerdown", dismissSuggestions);
  }, []);

  const loadSuggestions = useCallback(
    (rawQuery: string, options: { force?: boolean } = {}) => {
      const cleanQuery = rawQuery.trim();

      if (cleanQuery.length < 2) {
        suggestionRequestIdRef.current += 1;
        lastSuggestionQueryRef.current = "";
        resultsCountRef.current = 0;
        hasSearchedRef.current = false;
        setSearchResults([]);
        setSelectedResultIndex(-1);
        setShowSuggestions(false);
        setHasSearched(false);
        setIsSuggestionLoading(false);
        return;
      }

      const normalizedQuery = normalizeSearchValue(cleanQuery);
      const hasFreshResults =
        lastSuggestionQueryRef.current === normalizedQuery && resultsCountRef.current > 0;

      if (!options.force && hasFreshResults) {
        setShowSuggestions(true);
        return;
      }

      const requestId = suggestionRequestIdRef.current + 1;
      suggestionRequestIdRef.current = requestId;
      lastSuggestionQueryRef.current = normalizedQuery;
      resultsCountRef.current = 0;
      hasSearchedRef.current = false;
      setShowSuggestions(true);
      setSelectedResultIndex(-1);
      setHasSearched(false);
      setIsSuggestionLoading(true);

      startTransition(async () => {
        try {
          const suggestions = await GetRecipeSearchSuggestions({ k: cleanQuery });

          if (suggestionRequestIdRef.current !== requestId) return;

          resultsCountRef.current = suggestions.length;
          hasSearchedRef.current = true;
          setSearchResults(suggestions);
          setSelectedResultIndex(-1);
          setShowSuggestions(true);
          setHasSearched(true);
        } finally {
          if (suggestionRequestIdRef.current === requestId) {
            setIsSuggestionLoading(false);
          }
        }
      });
    },
    [startTransition],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSuggestions(debouncedValue);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [debouncedValue, loadSuggestions]);

  const runSearch = (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    suggestionRequestIdRef.current += 1;
    lastSuggestionQueryRef.current = "";
    router.push(`/search?k=${encodeURIComponent(cleanQuery)}`);
    setShowSuggestions(false);
    setSearchResults([]);
    resultsCountRef.current = 0;
    hasSearchedRef.current = false;
    setHasSearched(false);
    setIsSuggestionLoading(false);
    inputRef.current?.blur();
    onClose?.();
  };

  const exactRecipeResult = (query: string) => {
    const normalizedQuery = normalizeSearchValue(query);

    return searchResults.find(
      (result) =>
        result.kind === "Dish" &&
        result.href &&
        (result.isExact || normalizeSearchValue(result.label) === normalizedQuery),
    );
  };

  const submitSearch = (query: string) => {
    const exactRecipe = exactRecipeResult(query);

    if (exactRecipe) {
      openSuggestion(exactRecipe);
      return;
    }

    runSearch(query);
  };

  const openSuggestion = (suggestion: RecipeSearchSuggestion) => {
    if (suggestion.href) {
      suggestionRequestIdRef.current += 1;
      lastSuggestionQueryRef.current = "";
      router.push(suggestion.href);
      setShowSuggestions(false);
      setSearchResults([]);
      resultsCountRef.current = 0;
      hasSearchedRef.current = false;
      setHasSearched(false);
      setIsSuggestionLoading(false);
      inputRef.current?.blur();
      onClose?.();
      return;
    }

    runSearch(suggestion.query);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (selectedResultIndex >= 0) {
        openSuggestion(searchResults[selectedResultIndex]);
      } else {
        submitSearch(value);
      }
    } else if (event.key === "Escape") {
      suggestionRequestIdRef.current += 1;
      setShowSuggestions(false);
      setIsSuggestionLoading(false);
      setSelectedResultIndex(-1);
      inputRef.current?.blur();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedResultIndex((previous) =>
        Math.min(previous + 1, searchResults.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedResultIndex((previous) => Math.max(previous - 1, -1));
    }
  };

  return (
    <form
      ref={formRef}
      className={cn("relative w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch(value);
      }}
    >
      <div className="search-field-shell relative">
        <Search
          className={cn(
            "search-leading-icon pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8c735c]",
            compact || dense ? "size-[18px]" : "size-5",
          )}
        />
        <Input
          ref={inputRef}
          onChange={(event) => {
            suggestionRequestIdRef.current += 1;
            setValue(event.target.value);
            setSearchResults([]);
            resultsCountRef.current = 0;
            hasSearchedRef.current = false;
            setSelectedResultIndex(-1);
            setHasSearched(false);
            setIsSuggestionLoading(false);
            setShowSuggestions(event.target.value.trim().length >= 2);
          }}
          onFocus={() => {
            if (value.trim().length >= 2) {
              loadSuggestions(value, { force: searchResults.length === 0 });
            }
          }}
          onKeyDown={handleKeyPress}
          value={value}
          autoComplete="off"
          aria-label="Search recipes, ingredients or food stories"
          className={cn(
            "w-full rounded-full border-[#ead6b9] bg-white pl-14 text-[#34271f] shadow-[0_12px_32px_-24px_rgba(61,37,20,0.48)] placeholder:text-[#968577] focus-visible:border-[#d9a24b] focus-visible:ring-[#d9a24b]/18",
            dense
              ? "h-[42px] pr-[50px] text-[16px] sm:text-sm"
              : compact
              ? "h-[46px] pr-[54px] text-[16px] sm:text-sm"
              : "h-[58px] pr-[110px] text-[16px] sm:h-[66px] sm:pr-28 sm:text-base",
          )}
          placeholder={animatedPlaceholder}
        />
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            "search-submit-button absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition hover:bg-[#a92d20]",
            dense
              ? "size-[34px]"
              : compact
              ? "size-[36px]"
              : "h-[46px] gap-1.5 px-4 sm:h-[52px] sm:px-6",
          )}
        >
          {compact || dense ? (
            <ArrowRight className="size-4" />
          ) : (
            <>
              Search <ArrowRight className="hidden size-4 sm:block" />
            </>
          )}
        </button>
      </div>

      {showSuggestions &&
        (isPending || isSuggestionLoading || hasSearched || searchResults.length > 0) &&
        value.trim().length >= 2 && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="search-suggestions absolute top-[calc(100%+0.55rem)] z-[70] flex w-full flex-col overflow-hidden rounded-[1.25rem] border border-[#ead9c2] bg-[#fffdf8] p-2 shadow-[0_24px_62px_-26px_rgba(56,35,19,0.44)]"
        >
          {(isPending || isSuggestionLoading) && searchResults.length === 0 && (
            <div className="search-loading-state flex items-center justify-center gap-3 px-3.5 py-5 text-sm text-[#75675b]">
              <Loader className="size-4 animate-spin" />
              Swaad dhoondh rahe hain...
            </div>
          )}
          {!isPending && !isSuggestionLoading && hasSearched && searchResults.length === 0 && (
            <div className="search-empty-state px-5 py-6 text-center">
              <p className="search-empty-title text-sm font-semibold text-[#372921]">
                Let&apos;s try another flavour
              </p>
              <p className="search-empty-copy mt-1.5 text-xs leading-5 text-[#75675b]">
                Search paneer, breakfast, rajma or your favourite craving.
              </p>
            </div>
          )}
          {searchResults.map((result, index) => (
            <button
              type="button"
              role="option"
              aria-selected={selectedResultIndex === index}
              key={`${result.kind}-${result.label}`}
              className={cn(
                "search-suggestion-item flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent px-3.5 py-3 text-left transition hover:border-[#dfb36a] hover:bg-[#faf1e4]",
                selectedResultIndex === index &&
                  "search-suggestion-active border-[#dfb36a] bg-[#faf1e4]",
              )}
              onClick={() => {
                openSuggestion(result);
              }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1e5d4] text-[#9c6a2e]">
                  {result.imageUrl ? (
                    <Image
                      src={result.imageUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <ChefHat className="size-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#372921]">
                    {result.label}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a7834d]">
                    <span>{result.kind === "Dish" ? "Recipe" : result.kind}</span>
                    {result.meta && (
                      <>
                        <span className="text-[#d4b58b]">•</span>
                        <span className="max-w-[16rem] truncate normal-case tracking-normal text-[#7c6a5d]">
                          {result.meta}
                        </span>
                      </>
                    )}
                    {result.isExact && (
                      <span className="rounded-full bg-[#eaf2df] px-2 py-0.5 text-[9px] tracking-[0.12em] text-[#315036]">
                        Exact
                      </span>
                    )}
                  </span>
                </span>
              </span>
              <ArrowRight className="search-suggestion-arrow size-4 text-[#b38b53]" />
            </button>
          ))}
          {searchResults.length > 0 && (
            <button
              type="button"
              className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#f6ecdd] px-3.5 py-3 text-left text-sm font-semibold text-[#5e4938] transition hover:bg-[#efdcbf] hover:text-primary"
              onClick={() => runSearch(value)}
            >
              <span className="truncate">See all results for &quot;{value.trim()}&quot;</span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          )}
        </div>
      )}
    </form>
  );
};
