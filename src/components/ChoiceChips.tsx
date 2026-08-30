import type { SelectOption } from "../types";

interface MultiChoiceChipsProps {
  legend: string;
  options: Array<SelectOption>;
  selected: string[];
  onToggle: (value: string) => void;
  compact?: boolean;
}

export function MultiChoiceChips({ legend, options, selected, onToggle, compact = false }: MultiChoiceChipsProps) {
  return (
    <fieldset className={`chip-field ${compact ? "chip-field--compact" : ""}`}>
      <legend>{legend}</legend>
      <div className="chip-list">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              type="button"
              className="choice-chip"
              aria-pressed={active}
              key={option.value}
              onClick={() => onToggle(option.value)}
              title={option.description}
            >
              <span>{option.label}</span>
              {option.description ? <small>{option.description}</small> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface SingleChoiceChipsProps {
  legend: string;
  options: Array<SelectOption>;
  selected?: string;
  onChange: (value: string) => void;
}

export function SingleChoiceChips({ legend, options, selected, onChange }: SingleChoiceChipsProps) {
  return (
    <fieldset className="chip-field">
      <legend>{legend}</legend>
      <div className="chip-list">
        {options.map((option) => (
          <button
            type="button"
            className="choice-chip"
            aria-pressed={selected === option.value}
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.description}
          >
            <span>{option.label}</span>
            {option.description ? <small>{option.description}</small> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
