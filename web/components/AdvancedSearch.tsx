"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Typography,
  ClickAwayListener,
  Fade,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import HistoryIcon from "@mui/icons-material/History";
import { apiJson } from "../lib/api";

interface SearchSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  type: "patient" | "recent" | "action";
  icon?: string;
}

interface AdvancedSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  apiEndpoint?: string;
  showRecent?: boolean;
  recentSearches?: string[];
  onRecentSearch?: (query: string) => void;
  filters?: React.ReactNode;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  debounceMs?: number;
  minChars?: number;
}

export default function AdvancedSearch({
  placeholder = "Search...",
  onSearch,
  onSelect,
  apiEndpoint,
  showRecent = true,
  recentSearches = [],
  onRecentSearch,
  filters,
  showFilterButton = false,
  onFilterClick,
  debounceMs = 300,
  minChars = 2,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!apiEndpoint || searchQuery.length < minChars) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiJson<SearchSuggestion[]>(
          `${apiEndpoint}?q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        setSuggestions(response);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, minChars]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= minChars) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions, debounceMs, minChars]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);
    setSelectedIndex(-1);
    onSearch(value);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getAllItems();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelect(items[selectedIndex]);
        } else if (query) {
          handleSubmit();
        }
        break;
      case "Escape":
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Get all items (suggestions + recent)
  const getAllItems = (): (SearchSuggestion | string)[] => {
    const items: (SearchSuggestion | string)[] = [];
    if (showRecent && query === "" && recentSearches.length > 0) {
      items.push(...recentSearches);
    }
    items.push(...suggestions);
    return items;
  };

  // Handle selection
  const handleSelect = (item: SearchSuggestion | string) => {
    if (typeof item === "string") {
      setQuery(item);
      onSearch(item);
      onRecentSearch?.(item);
    } else {
      setQuery(item.title);
      onSearch(item.title);
      onSelect?.(item);
    }
    setOpen(false);
  };

  // Handle submit
  const handleSubmit = () => {
    onSearch(query);
    setOpen(false);
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    onSearch("");
    inputRef.current?.focus();
  };

  // Render suggestion item
  const renderItem = (item: SearchSuggestion | string, index: number) => {
    const isSelected = index === selectedIndex;
    const isRecent = typeof item === "string";

    return (
      <ListItem
        key={isRecent ? `recent-${item}` : item.id}
        button
        selected={isSelected}
        onClick={() => handleSelect(item)}
        onMouseEnter={() => setSelectedIndex(index)}
        sx={{
          borderRadius: 1,
          mx: 1,
          mb: 0.5,
        }}
      >
        {isRecent ? (
          <>
            <HistoryIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
            <ListItemText
              primary={item}
              primaryTypographyProps={{ variant: "body2" }}
            />
            <Chip label="Recent" size="small" variant="outlined" />
          </>
        ) : (
          <>
            <ListItemText
              primary={item.title}
              secondary={item.subtitle}
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
            <Chip
              label={item.type}
              size="small"
              color={item.type === "patient" ? "primary" : "default"}
              variant="outlined"
            />
          </>
        )}
      </ListItem>
    );
  };

  const allItems = getAllItems();
  const showSuggestions = open && (allItems.length > 0 || loading);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={anchorRef} sx={{ position: "relative", width: "100%" }}>
        <TextField
          fullWidth
          inputRef={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                {query && (
                  <IconButton size="small" onClick={handleClear} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                {showFilterButton && (
                  <IconButton size="small" onClick={onFilterClick} edge="end" sx={{ ml: 0.5 }}>
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />

        {/* Suggestions Popper */}
        <Popper
          open={showSuggestions}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ width: anchorRef.current?.offsetWidth, zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper elevation={3} sx={{ mt: 0.5, maxHeight: 400, overflow: "auto" }}>
                {/* Filters section */}
                {filters && (
                  <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    {filters}
                  </Box>
                )}

                {/* Suggestions list */}
                <List dense>
                  {allItems.length === 0 && !loading ? (
                    <ListItem>
                      <ListItemText
                        primary="No suggestions found"
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary",
                          align: "center",
                        }}
                      />
                    </ListItem>
                  ) : (
                    allItems.map((item, index) => renderItem(item, index))
                  )}
                </List>

                {/* Keyboard hints */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    p: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    ↑↓ Navigate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ↵ Select
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ESC Close
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

// Hook for managing recent searches
export function useRecentSearches(key: string, maxItems: number = 5) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`recent-searches-${key}`);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, [key]);

  const addRecentSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item !== query);
        const updated = [query, ...filtered].slice(0, maxItems);
        localStorage.setItem(`recent-searches-${key}`, JSON.stringify(updated));
        return updated;
      });
    },
    [key, maxItems]
  );

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem(`recent-searches-${key}`);
    setRecentSearches([]);
  }, [key]);

  return { recentSearches, addRecentSearch, clearRecentSearches };
}
