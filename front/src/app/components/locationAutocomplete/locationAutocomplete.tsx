import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
// import "./locationAutocomplete.css";
import { AddressSuggestion, AddressAutocompleteProps } from "@/app/types";
import debounce from "lodash.debounce";

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
}) => {
  const [query, setQuery] = useState<string>(value || "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const fetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (value.length > 2) {
        try {
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&autocomplete=1`,
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setSuggestions(data.features);
        } catch (error) {
          console.error("Failed to fetch address suggestions:", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    fetchSuggestions(query.trim());
  }, [query, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.properties.label);
    setSuggestions([]);
    onChange(suggestion.properties.label);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter an address"
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.properties.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{ cursor: "pointer" }}
            >
              {suggestion.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
