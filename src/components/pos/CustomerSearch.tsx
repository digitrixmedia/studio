
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
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

    // Sync local state when the active order changes
    useEffect(() => {
        setNameInput(activeOrder.customer.name || '');
        setPhoneInput(activeOrder.customer.phone || '');
    }, [activeOrder.id, activeOrder.customer.name, activeOrder.customer.phone]);

    const handleSelect = (customer: Customer) => {
        setNameInput(customer.name);
        setPhoneInput(customer.phone);
        onCustomerSelect({ name: customer.name, phone: customer.phone });
        setOpen(false);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value);
        if (!open) setOpen(true);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneInput(e.target.value);
        if (!open) setOpen(true);
    };
    
    const handleBlur = () => {
        // Use a timeout to allow the select event to fire before closing.
        setTimeout(() => {
             if (activeOrder.customer.name !== nameInput || activeOrder.customer.phone !== phoneInput) {
                onCustomerSelect({ name: nameInput, phone: phoneInput });
            }
        }, 100);
    }
    
    const filteredCustomers = useMemo(() => {
        const searchName = nameInput.toLowerCase();
        const searchPhone = phoneInput;

        if (!searchName && !searchPhone) return customers.slice(0, 5);

        return customers.filter(customer =>
            (searchName && customer.name.toLowerCase().includes(searchName)) ||
            (searchPhone && customer.phone.includes(searchPhone))
        ).slice(0, 10);
    }, [nameInput, phoneInput, customers]);


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <PopoverAnchor asChild>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Customer Name"
                            className="pl-10"
                            value={nameInput}
                            onChange={handleNameChange}
                            onBlur={handleBlur}
                        />
                    </div>
                </PopoverAnchor>
                <PopoverAnchor asChild>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Phone Number"
                            className="pl-10"
                            value={phoneInput}
                            onChange={handlePhoneChange}
                            onBlur={handleBlur}
                        />
                    </div>
                </PopoverAnchor>
            </div>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {filteredCustomers.map((customer) => (
                                <CommandItem
                                    key={customer.id}
                                    onSelect={() => handleSelect(customer)}
                                    value={`${customer.name}-${customer.phone}`}
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
