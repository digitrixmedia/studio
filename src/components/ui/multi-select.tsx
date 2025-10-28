
"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Filter options by search text (optional feature)
  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onValueChange(value.filter((v) => v !== val));
    } else {
      onValueChange([...value, val]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between text-left font-normal h-auto min-h-10 whitespace-normal",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((val) => {
                const opt = options.find((o) => o.value === val);
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="flex items-center"
                  >
                    {opt?.label ?? val}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleValue(val);
                      }}
                    />
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-56 overflow-y-auto space-y-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 rounded-sm px-3 py-1.5 hover:bg-accent",
                    isSelected && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{opt.label}</span>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No results found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
