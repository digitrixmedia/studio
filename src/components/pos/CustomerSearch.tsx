
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { User, Phone } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Customer, AppOrder } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

interface CustomerSearchProps {
  activeOrder: AppOrder;
  onCustomerSelect: (customer: { name: string; phone: string }) => void;
}

export function CustomerSearch({ activeOrder, onCustomerSelect }: CustomerSearchProps) {
  const { customers } = useAppContext();
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setNameInput(activeOrder.customer.name || '');
    setPhoneInput(activeOrder.customer.phone || '');
  }, [activeOrder.id, activeOrder.customer.name, activeOrder.customer.phone]);

  const filteredCustomers = useMemo(() => {
    const searchName = nameInput.toLowerCase();
    const searchPhone = phoneInput;
    if (!searchName && !searchPhone) return customers.slice(0, 5);
    return customers
      .filter(
        (customer) =>
          (searchName && customer.name.toLowerCase().includes(searchName)) ||
          (searchPhone && customer.phone.includes(searchPhone))
      )
      .slice(0, 10);
  }, [nameInput, phoneInput, customers]);

  const handleSelect = (customer: Customer) => {
    setNameInput(customer.name);
    setPhoneInput(customer.phone);
    onCustomerSelect({ name: customer.name, phone: customer.phone });
    setOpen(false);
  };

  const handleManualUpdate = () => {
    onCustomerSelect({ name: nameInput, phone: phoneInput });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Customer Name"
              className="pl-10"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setOpen(true);
              }}
              onBlur={() => setTimeout(() => handleManualUpdate(), 200)}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Phone Number"
              className="pl-10"
              value={phoneInput}
              onChange={(e) => {
                setPhoneInput(e.target.value);
                setOpen(true);
              }}
              onBlur={() => setTimeout(() => handleManualUpdate(), 200)}
            />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredCustomers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(customer);
                  }}
                >
                  <div>
                    <p>{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
