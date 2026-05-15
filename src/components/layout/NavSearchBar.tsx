import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  collection, query, where, orderBy,
  limit, getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Search, X, Loader2, Clock, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface SearchSuggestion {
  id: string;
  title: string;
  shopName: string;
  category: string;
  price: number;
  imageUrl: string;
}

const RECENT_SEARCHES_KEY = "mc_recent_searches";
const MAX_RECENT = 5;

const TRENDING_SEARCHES = [
  "Blue Pottery Vase",
  "Bridal Khussa",
  "Embroidered Khussa",
  "Kashigari Plate",
  "Gift Set",
  "Tea Set",
];

export function NavSearchBar() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [aiSearchTip, setAiSearchTip] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const debouncedQuery = useDebounce(inputValue.trim(), 300);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsFocused(false);
    setInputValue("");
    setSuggestions([]);
    setSelectedIndex(-1);
    setAiSearchTip(null);
  }, [location.pathname]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Firestore search on debounced input
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setAiSearchTip(null);
      return;
    }
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery]);

  const fetchSuggestions = async (searchTerm: string) => {
    setIsSearching(true);
    setAiSearchTip(null);
    try {
      // If query has > 3 words, might be natural language, get AI tip
      if (searchTerm.split(" ").length > 3) {
        fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature: "search-assistant",
            payload: { query: searchTerm }
          })
        }).then(res => res.json()).then(data => {
          if (data.result && data.result.isNaturalLanguage) {
            setAiSearchTip(data.result);
          }
        }).catch(console.error);
      }
      // Firestore doesn't support full-text search natively
      // Use startAt/endAt range query on lowercase title for prefix matching
      const normalizedTerm = searchTerm.toLowerCase();

      const q = query(
        collection(db, "products"),
        where("isAvailable", "==", true),
        where("titleLower", ">=", normalizedTerm),
        where("titleLower", "<=", normalizedTerm + "\uf8ff"),
        orderBy("titleLower"),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const results: SearchSuggestion[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        shopName: doc.data().shopName,
        category: doc.data().category,
        price: doc.data().price,
        imageUrl: doc.data().images?.[0] ?? "",
      }));

      // Also search by tags using array-contains
      // if title search returns fewer than 3 results
      if (results.length < 3) {
        const tagsQuery = query(
          collection(db, "products"),
          where("isAvailable", "==", true),
          where("tags", "array-contains", normalizedTerm),
          limit(3)
        );
        const tagsSnapshot = await getDocs(tagsQuery);
        const tagResults: SearchSuggestion[] = tagsSnapshot.docs
          .filter(doc => !results.find(r => r.id === doc.id))
          .map(doc => ({
            id: doc.id,
            title: doc.data().title,
            shopName: doc.data().shopName,
            category: doc.data().category,
            price: doc.data().price,
            imageUrl: doc.data().images?.[0] ?? "",
          }));
        results.push(...tagResults);
      }

      setSuggestions(results.slice(0, 5));
    } catch (error) {
      console.error("Search suggestions error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Save to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [
        term,
        ...recentSearches.filter(s => s !== term),
      ].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [recentSearches]);

  // Execute search — navigate to /explore with query param
  const executeSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setIsFocused(false);
    setInputValue(trimmed);
    navigate(`/explore?q=${encodeURIComponent(trimmed)}`);
  }, [navigate, saveRecentSearch]);

  // Remove a recent search
  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = suggestions.length > 0
      ? suggestions.length
      : recentSearches.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions.length > 0) {
          // Navigate to selected suggestion's product page
          const selected = suggestions[selectedIndex];
          saveRecentSearch(selected.title);
          setIsFocused(false);
          navigate(`/product/${selected.id}`);
        } else if (selectedIndex >= 0 && recentSearches.length > 0) {
          executeSearch(recentSearches[selectedIndex]);
        } else {
          executeSearch(inputValue);
        }
        break;

      case "Escape":
        setIsFocused(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  
  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleSlashKey);
    return () => document.removeEventListener("keydown", handleSlashKey);
  }, []);

  const showDropdown = isFocused;
  const showSuggestions = debouncedQuery.length >= 2;
  const showEmpty = showSuggestions && !isSearching && suggestions.length === 0;
  const showRecent = !showSuggestions && recentSearches.length > 0;
  const showTrending = !showSuggestions && recentSearches.length === 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm lg:max-w-md">

      {/* Search Input */}
      <div
        className={`flex items-center gap-2 bg-white border rounded-xl
                    px-3 py-2 transition-all duration-200
                    ${isFocused
                      ? "border-gold ring-2 ring-gold/20 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
      >
        {/* Search icon or spinner */}
        {isSearching ? (
          <Loader2 size={15} className="text-gold animate-spin flex-shrink-0" />
        ) : (
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, crafts, artisans..."
          aria-label="Search Multan Connect marketplace"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          aria-controls="search-dropdown"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined
          }
          className="flex-1 text-sm text-ink placeholder:text-muted-foreground/60
                     bg-transparent outline-none min-w-0"
        />

        {!isFocused && !inputValue && (
          <kbd className="hidden lg:flex items-center justify-center
                          w-5 h-5 text-xs text-muted-foreground border border-gray-200
                          rounded flex-shrink-0 font-mono bg-gray-50">
            /
          </kbd>
        )}

        {/* Clear button */}
        <AnimatePresence>
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={() => {
                setInputValue("");
                setSuggestions([]);
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500
                         hover:bg-gray-300 flex items-center justify-center
                         flex-shrink-0 transition-colors"
            >
              <X size={10} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Search submit button */}
        <button
          type="button"
          onClick={() => executeSearch(inputValue)}
          aria-label="Submit search"
          className="flex-shrink-0 bg-gold hover:bg-gold/80 text-white
                     text-xs font-medium px-2.5 py-1 rounded-lg
                     transition-colors duration-200 hidden sm:block"
        >
          Search
        </button>
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            id="search-dropdown"
            role="listbox"
            aria-label="Search suggestions"
            className="absolute top-full left-0 right-0 mt-2 bg-white
                       rounded-2xl shadow-xl border border-gray-100
                       overflow-hidden z-50 text-left"
          >

            {/* ── Product Suggestions ── */}
            {aiSearchTip && (
              <div className="px-4 py-3 bg-gradient-to-r from-navy/5 to-teal/5 border-b border-border">
                <div className="flex items-start gap-2">
                  <Sparkles size={13} className="text-gold flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-xs text-navy font-medium">
                      {aiSearchTip.interpretation}
                    </p>
                    <p className="text-xs text-muted-foreground">{aiSearchTip.tip}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSearchTip.suggestedSearchTerms?.map((term: string) => (
                        <button
                          key={term}
                          onClick={() => executeSearch(term)}
                          className="text-xs bg-white border border-gold/30
                                     text-navy hover:border-gold hover:text-gold
                                     px-2.5 py-1 rounded-full transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showSuggestions && !isSearching && suggestions.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Products
                  </p>
                  <button
                    onClick={() => executeSearch(inputValue)}
                    className="text-xs text-gold hover:underline 
                               flex items-center gap-1"
                  >
                    See all results <ArrowRight size={10} />
                  </button>
                </div>

                {suggestions.map((suggestion, i) => (
                  <button
                    key={suggestion.id}
                    id={`search-option-${i}`}
                    role="option"
                    aria-selected={selectedIndex === i}
                    onClick={() => {
                      saveRecentSearch(suggestion.title);
                      setIsFocused(false);
                      navigate(`/product/${suggestion.id}`);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5
                                text-left transition-colors duration-100
                                ${selectedIndex === i
                                  ? "bg-gold/5"
                                  : "hover:bg-gray-50"
                                }`}
                  >
                    {/* Product thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden 
                                    bg-gray-100 flex-shrink-0">
                      {suggestion.imageUrl ? (
                        <img
                          src={suggestion.imageUrl}
                          alt={suggestion.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-navy/10 flex 
                                        items-center justify-center">
                          <Search size={12} className="text-navy/30" />
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy font-medium truncate">
                        {/* Highlight matching part of title */}
                        {highlightMatch(suggestion.title, inputValue)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        by {suggestion.shopName}
                        <span className="mx-1">·</span>
                        PKR {suggestion.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Category chip */}
                    <span className="text-xs bg-cream text-muted-foreground px-2 py-0.5
                                     rounded-full flex-shrink-0 capitalize hidden sm:block">
                      {suggestion.category.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Loading State ── */}
            {isSearching && (
              <div className="flex items-center gap-3 px-4 py-5">
                <Loader2 size={16} className="text-gold animate-spin" />
                <p className="text-sm text-muted-foreground">Searching products...</p>
              </div>
            )}

            {/* ── No Results ── */}
            {showEmpty && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-navy font-medium">
                  No products found for "{inputValue}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different term or{" "}
                  <button
                    onClick={() => executeSearch(inputValue)}
                    className="text-gold hover:underline"
                  >
                    browse all products
                  </button>
                </p>
              </div>
            )}

            {/* ── Recent Searches ── */}
            {showRecent && (
              <div>
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Recent
                  </p>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {recentSearches.map((term, i) => (
                  <button
                    key={term}
                    id={`search-option-${i}`}
                    role="option"
                    aria-selected={selectedIndex === i}
                    onClick={() => executeSearch(term)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5
                                text-left transition-colors duration-100
                                ${selectedIndex === i
                                  ? "bg-gold/5"
                                  : "hover:bg-gray-50"
                                }`}
                  >
                    <Clock
                      size={14}
                      className="text-muted-foreground flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm text-ink truncate">
                      {term}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(term, e)}
                      aria-label={`Remove "${term}" from recent searches`}
                      className="w-5 h-5 rounded-full hover:bg-gray-200
                                 flex items-center justify-center
                                 flex-shrink-0 transition-colors"
                    >
                      <X size={10} className="text-muted-foreground" />
                    </button>
                  </button>
                ))}
              </div>
            )}

            {/* ── Trending Searches ── */}
            {showTrending && (
              <div>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs uppercase tracking-widest 
                                text-muted-foreground font-medium flex items-center gap-1.5">
                    <TrendingUp size={11} />
                    Popular on Multan Connect
                  </p>
                </div>

                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map(term => (
                    <button
                      key={term}
                      onClick={() => executeSearch(term)}
                      className="text-xs bg-cream hover:bg-gold/10
                                 text-navy hover:text-gold
                                 border border-gray-200 hover:border-gold/30
                                 px-3 py-1.5 rounded-full
                                 transition-all duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer — View All Link ── */}
            {(showSuggestions && suggestions.length > 0) && (
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  onClick={() => executeSearch(inputValue)}
                  className="w-full flex items-center justify-center gap-2
                             text-xs text-navy hover:text-gold
                             transition-colors duration-200 py-1 font-medium"
                >
                  <Search size={11} />
                  Search all products for "{inputValue}"
                </button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper — highlight matching text in suggestion titles
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-gold/20 text-navy font-semibold rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
