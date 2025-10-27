
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    onValueChange(
      value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue]
    );
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10 whitespace-normal", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1"
                >
                  {option.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const MultiSelectTrigger = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>
}
const MultiSelectContent = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>
}
const MultiSelectList = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>
}

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectList,
  type Option as MultiSelectOption,
};
