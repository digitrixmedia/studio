
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
  const [open, setOpen] = React.useState(false)

  const options = React.Children.toArray(children)
    .filter((child): child is React.ReactElement<{ value: string, children: React.ReactNode }> => 
        React.isValidElement(child) && child.type === MultiSelectItem
    )
    .map(child => ({
        value: child.props.value,
        label: child.props.children
    }));


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
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "flex h-auto min-h-10 w-full items-center justify-between whitespace-normal",
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
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onValueChange(contextValue.filter((v) => v !== value))
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onValueChange(contextValue.filter((v) => v !== value))
                  }
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

const MultiSelectContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ children, className, ...props }, ref) => {
  return (
    <PopoverContent
      ref={ref}
      className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)}
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
>(({ children, className, value, onSelect, ...props }, ref) => {
  const { value: selectedValues, onValueChange } = useMultiSelect();
  const isSelected = selectedValues.includes(value || '');

  return (
    <CommandItem
      ref={ref}
      value={value}
      onSelect={(currentValue) => {
        if (onSelect) {
            onSelect(currentValue)
        }
        if (isSelected) {
          onValueChange(selectedValues.filter((v) => v !== value));
        } else {
          onValueChange([...selectedValues, value || '']);
        }
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
  MultiSelectContent,
  MultiSelectItem,
}
