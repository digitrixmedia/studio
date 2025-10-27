
"use client"

import * as React from "react"
import { Check, X } from "lucide-react"

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

interface MultiSelectContextValue {
  value: string[]
  onValueChange: (value: string[]) => void
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(null)

const useMultiSelect = () => {
  const context = React.useContext(MultiSelectContext)
  if (!context) {
    throw new Error("useMultiSelect must be used within a MultiSelect")
  }
  return context
}

const MultiSelect = ({
  value,
  onValueChange,
  children,
}: {
  value: string[]
  onValueChange: (value: string[]) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <MultiSelectContext.Provider value={{ value, onValueChange }}>
      <div ref={wrapperRef} className="relative">
        <div onClick={() => setIsOpen(!isOpen)}>
            {/* The trigger elements like MultiSelectTrigger and MultiSelectValue will be passed as children here */}
            {React.Children.toArray(children).filter((child: any) => child.type !== MultiSelectItem)}
        </div>
        {isOpen && (
            <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                             {/* The item elements are rendered here */}
                            {React.Children.toArray(children).filter((child: any) => child.type === MultiSelectItem)}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        )}
      </div>
    </MultiSelectContext.Provider>
  )
}

const MultiSelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
})
MultiSelectTrigger.displayName = "MultiSelectTrigger"

const MultiSelectValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value: contextValue, onValueChange } = useMultiSelect()
  
  // A bit of a hack to get labels, but necessary without direct access to options in context
  const getLabelFromContext = (val: string) => {
    // This part is tricky as we don't have the full options list with labels here.
    // Let's assume for now the value is the label. A more robust solution might need a different architecture.
    return val;
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "flex h-auto min-h-10 w-full items-center justify-between whitespace-normal",
        className
      )}
    >
      {contextValue.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {contextValue.map((value) => (
            <Badge key={value} variant="secondary">
              {value} 
              <button
                aria-label={`Remove ${value} option`}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onValueChange(contextValue.filter((v) => v !== value))
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </Button>
  )
})
MultiSelectValue.displayName = "MultiSelectValue"

const MultiSelectItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ children, className, value, ...props }, ref) => {
  const { value: selectedValues, onValueChange } = useMultiSelect();
  const isSelected = selectedValues.includes(value || '');

  const handleSelect = () => {
    const currentValue = value || '';
    if (isSelected) {
      onValueChange(selectedValues.filter((v) => v !== currentValue));
    } else {
      onValueChange([...selectedValues, currentValue]);
    }
  };

  return (
    <CommandItem
      ref={ref}
      value={value}
      onSelect={(currentValue) => {
         // Stop the event from propagating and closing the dropdown
        const e = new Event('select', { bubbles: true, cancelable: true });
        Object.defineProperty(e, 'preventDefault', { value: () => {} }); // Mock preventDefault
        handleSelect();
      }}
      className={cn(
        "cursor-pointer flex items-center gap-2 px-2 py-1.5",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </div>
      <span>{children}</span>
    </CommandItem>
  );
});

MultiSelectItem.displayName = "MultiSelectItem"

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectItem,
}
