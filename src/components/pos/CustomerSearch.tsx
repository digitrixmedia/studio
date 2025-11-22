// src/components/pos/CustomerSearch.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { User, Phone } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Customer, AppOrder } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CustomerSearchProps {
  activeOrder: AppOrder;
  onCustomerSelect: (customer: { name: string; phone: string }) => void;
  /** optional: how many results to show */
  maxResults?: number;
}

export function CustomerSearch({
  activeOrder,
  onCustomerSelect,
  maxResults = 8,
}: CustomerSearchProps) {
  const { customers } = useAppContext();

  const [nameInput, setNameInput] = useState(activeOrder.customer?.name || '');
  const [phoneInput, setPhoneInput] = useState(activeOrder.customer?.phone || '');
  const [focusedField, setFocusedField] = useState<'name' | 'phone' | null>(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // sync when active order changes
  useEffect(() => {
    setNameInput(activeOrder.customer?.name || '');
    setPhoneInput(activeOrder.customer?.phone || '');
  }, [activeOrder.id, activeOrder.customer?.name, activeOrder.customer?.phone]);

  // compute filtered customers (name OR phone)
  const filtered = useMemo(() => {
    const qName = nameInput.trim().toLowerCase();
    const qPhone = phoneInput.trim();
    if (!qName && !qPhone) return [];
    
    // Only filter based on the currently focused input
    if (focusedField === 'name') {
       return customers
        .filter((c) => c.name.toLowerCase().includes(qName))
        .slice(0, maxResults);
    }
    if (focusedField === 'phone') {
        return customers
        .filter((c) => c.phone.includes(qPhone))
        .slice(0, maxResults);
    }
    
    return [];

  }, [customers, nameInput, phoneInput, maxResults, focusedField]);

  // show suggestions only when an input is focused AND user typed something
  const shouldShow = open && ( (focusedField === 'name' && nameInput.trim().length > 0) || (focusedField === 'phone' && phoneInput.trim().length > 0) );

  // keyboard navigation index
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  useEffect(() => { setActiveIndex(filtered.length > 0 ? 0 : -1); }, [filtered.length]);

  // outside click closes dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedField(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // selection handler: call parent and set inputs
  const selectCustomer = useCallback((c: Customer) => {
    setNameInput(c.name);
    setPhoneInput(c.phone);
    onCustomerSelect({ name: c.name, phone: c.phone });
    setOpen(false);
    setFocusedField(null);
  }, [onCustomerSelect]);

  // when user manually blurs without selecting, propagate manual values
  // (debounced via timeout to avoid interfering with onMouseDown selection)
  const scheduleManualUpdate = useRef<number | null>(null);
  const handleManualUpdate = useCallback(() => {
    if (scheduleManualUpdate.current) {
      window.clearTimeout(scheduleManualUpdate.current);
      scheduleManualUpdate.current = null;
    }
    onCustomerSelect({ name: nameInput, phone: phoneInput });
  }, [nameInput, phoneInput, onCustomerSelect]);

  // keyboard handling for accessibility
  const handleKeyDownOnInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!shouldShow) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[activeIndex >= 0 ? activeIndex : 0];
      if (pick) selectCustomer(pick);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setFocusedField(null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Name input */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Customer Name"
            className="pl-10"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setOpen(true);
              setFocusedField('name');
            }}
            onFocus={() => { setOpen(true); setFocusedField('name'); }}
            onBlur={() => {
              // schedule manual update shortly (selection uses onMouseDown so it runs before this timeout)
              scheduleManualUpdate.current = window.setTimeout(() => handleManualUpdate(), 150);
            }}
            onKeyDown={handleKeyDownOnInput}
          />
        </div>

        {/* Phone input */}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Phone Number"
            className="pl-10"
            value={phoneInput}
            onChange={(e) => {
              setPhoneInput(e.target.value);
              setOpen(true);
              setFocusedField('phone');
            }}
            onFocus={() => { setOpen(true); setFocusedField('phone'); }}
            onBlur={() => {
              scheduleManualUpdate.current = window.setTimeout(() => handleManualUpdate(), 150);
            }}
            onKeyDown={handleKeyDownOnInput}
          />
        </div>
      </div>

      {/* Suggestion list */}
      {shouldShow && filtered.length > 0 && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Customer suggestions"
          className="absolute left-0 right-0 mt-1 z-50 bg-white border rounded-md shadow-lg max-h-56 overflow-auto"
          style={{ minWidth: '14rem' }}
        >
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              role="option"
              aria-selected={idx === activeIndex}
              className={cn(
                'px-3 py-2 cursor-pointer hover:bg-gray-100',
                idx === activeIndex ? 'bg-gray-100' : ''
              )}
              // use onMouseDown to ensure selection occurs BEFORE input blur
              onMouseDown={(e) => {
                e.preventDefault(); // prevent focus change
                if (scheduleManualUpdate.current) {
                  window.clearTimeout(scheduleManualUpdate.current);
                  scheduleManualUpdate.current = null;
                }
                selectCustomer(c);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.phone}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
