
'use client';

import { useState, useEffect, useMemo } from 'react';
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
    const [nameInput, setNameInput] = useState(activeOrder.customer.name);
    const [phoneInput, setPhoneInput] = useState(activeOrder.customer.phone);
    const [open, setOpen] = useState(false);
    const [activeField, setActiveField] = useState<'name' | 'phone' | null>(null);

    useEffect(() => {
        // Sync with active order when it changes
        setNameInput(activeOrder.customer.name || '');
        setPhoneInput(activeOrder.customer.phone || '');
    }, [activeOrder.id, activeOrder.customer.name, activeOrder.customer.phone]);

    const filteredCustomers = useMemo(() => {
        if (!activeField) return [];

        const searchTerm = activeField === 'name' ? nameInput.toLowerCase() : phoneInput;
        if (!searchTerm) return customers.slice(0, 5); // Show some initial customers

        return customers.filter(customer =>
            (activeField === 'name' && customer.name.toLowerCase().includes(searchTerm)) ||
            (activeField === 'phone' && customer.phone.includes(searchTerm))
        ).slice(0, 10);
    }, [nameInput, phoneInput, customers, activeField]);

    const handleSelect = (customer: Customer) => {
        onCustomerSelect({ name: customer.name, phone: customer.phone });
        setNameInput(customer.name);
        setPhoneInput(customer.phone);
        setOpen(false);
        setActiveField(null);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value);
        if (!open) setOpen(true);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneInput(e.target.value);
        if (!open) setOpen(true);
    };
    
    const handleNameBlur = () => {
        // Update order only on blur if no selection was made
        if (activeOrder.customer.name !== nameInput) {
            onCustomerSelect({ ...activeOrder.customer, name: nameInput });
        }
    }
    
    const handlePhoneBlur = () => {
         if (activeOrder.customer.phone !== phoneInput) {
            onCustomerSelect({ ...activeOrder.customer, phone: phoneInput });
        }
    }

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
                            onFocus={() => setActiveField('name')}
                            onBlur={handleNameBlur}
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
                            onFocus={() => setActiveField('phone')}
                            onBlur={handlePhoneBlur}
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
