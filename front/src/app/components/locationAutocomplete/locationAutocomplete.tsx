import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
// import "./locationAutocomplete.css";
import { AddressSuggestion, AddressAutocompleteProps } from "@/app/types";

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onChangeLoc,
  onChangeTown,
}) => {
  const [query, setQuery] = useState<string>(value || "");
  const [suggestions, setSuggestions] = useState<[]>([]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 3) {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${query}`,
      );
      const data = await response.json();
      setSuggestions(data.results);
      
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setQuery(`${suggestion.name}, ${suggestion.country}, ${suggestion.admin1}`);
    onChange(`${suggestion.name}, ${suggestion.country}, ${suggestion.admin1}`);
    onChangeLoc(suggestion.latitude, suggestion.longitude);
    onChangeTown(suggestion.name);
    setSuggestions([]);
  };
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Entrez une adresse"
      />
      <ul>
        {suggestions &&
          suggestions.map((suggestion: any) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{ cursor: "pointer" }}
            >
              {`${suggestion.name}, ${suggestion.country}, ${suggestion.admin1}`}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AddressAutocomplete;
