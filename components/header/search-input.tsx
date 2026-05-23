import qs from "query-string";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { GetRecipes } from "@/actions/get-recipes";
import { Search } from "lucide-react";

export const SearchInput = ({ onClose }: { onClose: () => void }) => {
  const [value, setValue] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  const debouncedValue = useDebounce(value);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const recipes = await GetRecipes({});

        const titles = recipes.map((recipe) => recipe.title);
        const uniqueTitles = Array.from(new Set(titles));

        setSuggestions(uniqueTitles);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchSuggestions();
  }, []);

  useEffect(() => {
    const fetchSearchSuggestions = async () => {
      if (debouncedValue) {
        const suggestionsResults = suggestions.filter((item) =>
          item.toLowerCase().includes(debouncedValue.toLowerCase())
        );
        setSearchResults(suggestionsResults);
        setShowSuggestions(true);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    };

    fetchSearchSuggestions();
  }, [debouncedValue, suggestions]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedResultIndex !== -1) {
        const selectedSuggestion = searchResults[selectedResultIndex];
        handleSuggestionClick(selectedSuggestion);
      } else if (searchResults.length === 1) {
        // Check if there's only one suggestion
        handleSuggestionClick(searchResults[0]); // Select the only suggestion
      } else {
        const url = qs.stringifyUrl(
          {
            url: "/search",
            query: {
              k: value,
            },
          },
          { skipEmptyString: true, skipNull: true }
        );

        router.push(url);
        onClose();
      }
    } else if (e.key === "ArrowDown") {
      setSelectedResultIndex((prevIndex) =>
        prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setSelectedResultIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    const url = qs.stringifyUrl(
      {
        url: "/search",
        query: {
          k: suggestion,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
    onClose();
  };

  return (
    <div className="flex w-full md:w-[600px] items-start justify-start">
      <div className="relative mt-3 w-full items-start justify-start">
        <Search className="absolute left-3 top-3 size-6 text-muted-foreground" />

        <Input
          ref={inputRef}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          value={value}
          className="h-12 w-full rounded-full bg-card pl-16 md:w-[600px]"
          placeholder="Search for recipes..."
        />

        {showSuggestions && (
          <div className="absolute top-full max-h-72 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={`cursor-pointer items-start justify-start p-2 hover:bg-accent ${
                  selectedResultIndex === index ? "bg-accent" : ""
                }`}
                onClick={() => handleSuggestionClick(result)}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
