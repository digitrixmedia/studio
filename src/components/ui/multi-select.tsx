
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "./button"

interface MultiSelectContextValue {
  value: string[]
  onValueChange: (value: string[]) => void
  options: { value: string; label?: React.ReactNode }[]
}

const MultiSelectContext = React.createContext<MultiSelectContextValue>(
  {} as MultiSelectContextValue
)

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
  const [open, setOpen] = React.useState(false)

  // We map the children to extract the options and store them in a ref.
  // This is so we can have access to the options and their labels
  // when rendering the selected values.
  const options = React.useMemo(() => {
    const optionNodes = React.Children.toArray(children).filter(
      (child) =>
        React.isValidElement(child) && child.type === MultiSelectItem
    ) as React.ReactElement[]

    return optionNodes.map((child) => ({
      value: child.props.value,
      label: child.props.children,
    }))
  }, [children])

  return (
    <MultiSelectContext.Provider value={{ value, onValueChange, options }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  )
}

const MultiSelectTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>
>(({ children, ...props }, ref) => {
  return (
    <PopoverTrigger ref={ref} asChild {...props}>
      {children}
    </PopoverTrigger>
  )
})
MultiSelectTrigger.displayName = "MultiSelectTrigger"

const MultiSelectValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value: contextValue, options, onValueChange } = useMultiSelect()

  const getLabel = (value: string) => {
    return options.find((option) => option.value === value)?.label || value
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {contextValue.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {contextValue.map((value) => (
            <Badge key={value} variant="secondary">
              {getLabel(value)}
              <button
                aria-label={`Remove ${value} option`}
                onClick={(e) => {
                  e.preventDefault()
                  onValueChange(contextValue.filter((v) => v !== value))
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onValueChange(contextValue.filter((v) => v !== value))
                  }
                }}
              >
                <X className="ml-1 h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </div>
  )
})
MultiSelectValue.displayName = "MultiSelectValue"

const MultiSelectContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ children, className, ...props }, ref) => {
  return (
    <PopoverContent
      ref={ref}
      className={cn("w-full p-0", className)}
      {...props}
    >
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {children}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  )
})
MultiSelectContent.displayName = "MultiSelectContent"

const MultiSelectItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ children, className, value = "", onSelect, ...props }, ref) => {
  const { value: selectedValues, onValueChange } = useMultiSelect();
  const isSelected = selectedValues.includes(value);

  const handleSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (isSelected) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  return (
    <CommandItem
      ref={ref}
      value={value}
      onSelect={handleSelect}
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
  MultiSelectContent,
  MultiSelectItem,
}
