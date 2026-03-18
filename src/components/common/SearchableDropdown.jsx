import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  required = false,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) => {
    const optionLabel =
      typeof option === "string" ? option : option.name || option.label || "";
    return optionLabel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedOption = options.find(
    (opt) => (opt.name || opt.label) === value || opt.code === value,
  );

  const displayValue = selectedOption
    ? selectedOption.code || selectedOption.name || selectedOption.label
    : value || placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    const optionValue =
      typeof option === "string"
        ? option
        : option.code || option.id || option.name || option.value;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-bold text-[#18254D] tracking-widest ml-1 uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border ${isOpen ? "border-secondary ring-4 ring-secondary/10" : "border-slate-200"} rounded-xl text-sm font-medium transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-secondary"}`}
          disabled={disabled}
        >
          <span className={displayValue ? "text-primary" : "text-slate-400"}>
            {displayValue || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in-up origin-top">
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  autoFocus
                  type="text"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-secondary"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const optionValue =
                    typeof option === "string"
                      ? option
                      : option.id || option.code || option.name || option.value;
                  const optionLabel =
                    typeof option === "string"
                      ? option
                      : option.code ? `${option.name} (${option.code})` : (option.name || option.label);
                  const isSelected = optionValue === value;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-2.5 text-[11px] font-bold tracking-widest transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-secondary/5 text-secondary"
                          : "text-[#18254D] hover:bg-slate-50"
                      }`}
                    >
                      <span>{optionLabel}</span>
                      {isSelected && (
                        <Check
                          size={14}
                          className="text-secondary"
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    No results found
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
