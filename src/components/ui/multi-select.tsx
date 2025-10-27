
"use client"

import * as React from "react"
import { Check, X, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MultiSelectContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: Option[];
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(null);

const useMultiSelect = () => {
  const context = React.useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within a MultiSelect");
  }
  return context;
};

const MultiSelect = ({
  options,
  value,
  onValueChange,
  children,
}: {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <MultiSelectContext.Provider value={{ options, value, onValueChange }}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
};

const MultiSelectTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>
>(({ children, className, ...props }, ref) => {
  const { value, options } = useMultiSelect();
  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <PopoverTrigger ref={ref} asChild>
      <Button
        variant="outline"
        className={cn(
          "flex h-auto min-h-10 w-full items-center justify-between whitespace-normal",
          className
        )}
        {...props}
      >
        <div className="flex flex-wrap items-center gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <Badge key={option.value} variant="secondary">
                {option.label}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{children}</span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
});
MultiSelectTrigger.displayName = "MultiSelectTrigger";

const MultiSelectContent = ({ children, className, ...props }: React.ComponentPropsWithoutRef<typeof PopoverContent>) => {
    return (
        <PopoverContent
          className={cn("w-full p-0", className)}
          align="start"
          {...props}
        >
          {children}
        </PopoverContent>
    )
}

const MultiSelectList = React.forwardRef<
  React.ElementRef<typeof CommandList>,
  React.ComponentPropsWithoutRef<typeof CommandList>
>(({ children, ...props }, ref) => {
    const { options, value, onValueChange } = useMultiSelect();
    
    const handleSelect = (selectedValue: string) => {
        const newValues = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue];
        onValueChange(newValues);
    }
    
    return (
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList ref={ref} {...props}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {children}
          </CommandList>
        </Command>
    );
});
MultiSelectList.displayName = "MultiSelectList"


export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectList,
  type Option as MultiSelectOption,
};
