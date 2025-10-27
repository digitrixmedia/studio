
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
import { Separator } from "./separator"

interface MultiSelectContextValue {
  value: string[]
  onValueChange: (value: string[]) => void
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
  return (
    <MultiSelectContext.Provider value={{ value, onValueChange }}>
      <Popover>{children}</Popover>
    </MultiSelectContext.Provider>
  )
}

const MultiSelectTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>
>(({ children, className, ...props }, ref) => {
  return (
    <PopoverTrigger ref={ref} asChild {...props}>
        <div className={className}>{children}</div>
    </PopoverTrigger>
  )
})
MultiSelectTrigger.displayName = "MultiSelectTrigger"

const MultiSelectValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value: contextValue } = useMultiSelect()
  const { onValueChange } = useMultiSelect();

  const getLabel = (value: string) => {
    // This is a placeholder. In a real app, you'd have a map or lookup.
    // For now, we just show the value.
    return value;
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
                    e.preventDefault();
                    onValueChange(contextValue.filter((v) => v !== value));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onValueChange(contextValue.filter((v) => v !== value));
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
>(({ children, className, onSelect, ...props }, ref) => {
  const { value, onValueChange } = useMultiSelect()
  const isSelected = value.includes(props.value || "")
  return (
    <CommandItem
      ref={ref}
      onSelect={(currentValue) => {
        onSelect?.(currentValue);
        if (isSelected) {
          onValueChange(value.filter((v) => v !== props.value))
        } else {
          onValueChange([...value, props.value || ""])
        }
      }}
      className={cn("cursor-pointer", className)}
      {...props}
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
      {children}
    </CommandItem>
  )
})

MultiSelectItem.displayName = "MultiSelectItem"

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
}
