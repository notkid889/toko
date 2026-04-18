import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface CategoryComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    onCreateNew?: (name: string) => Promise<{ id: number; name: string } | null>;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
}

export function CategoryCombobox({
    options,
    value,
    onChange,
    onCreateNew,
    placeholder = 'Select category...',
    id,
    disabled,
}: CategoryComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [creating, setCreating] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

    const filtered = React.useMemo(() => {
        if (!search) return options;
        return options.filter((o) =>
            o.label.toLowerCase().includes(search.toLowerCase()),
        );
    }, [options, search]);

    const exactMatch = options.some(
        (o) => o.label.toLowerCase() === search.toLowerCase(),
    );

    // Close on outside click
    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [open]);

    function handleSelect(optionValue: string) {
        onChange(optionValue);
        setOpen(false);
        setSearch('');
    }

    async function handleCreate() {
        if (!onCreateNew || !search.trim() || creating) return;
        setCreating(true);
        try {
            const result = await onCreateNew(search.trim());
            if (result) {
                onChange(String(result.id));
                setOpen(false);
                setSearch('');
            }
        } finally {
            setCreating(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') {
            setOpen(false);
            setSearch('');
        }
        if (e.key === 'Enter' && filtered.length === 1) {
            e.preventDefault();
            handleSelect(filtered[0].value);
        }
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => {
                    setOpen(!open);
                    if (!open) {
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }
                }}
                className={cn(
                    'flex h-8 w-full items-center justify-between rounded-lg border border-input-border bg-input px-2.5 py-1 text-sm transition-colors outline-none',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
                    'dark:bg-input/30',
                    !value && 'text-muted-foreground',
                )}
            >
                <span className="truncate">{selectedLabel || placeholder}</span>
                <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-input-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
                    {/* Search input */}
                    <div className="p-1.5">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search category..."
                            className="h-7 w-full rounded-md border border-input-border bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto p-1">
                        {filtered.length === 0 && !search.trim() && (
                            <p className="px-2 py-1.5 text-xs text-muted-foreground">
                                No categories found.
                            </p>
                        )}

                        {filtered.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    option.value === value && 'bg-accent/50',
                                )}
                            >
                                <Check
                                    className={cn(
                                        'size-3.5 shrink-0',
                                        option.value === value ? 'opacity-100' : 'opacity-0',
                                    )}
                                />
                                <span className="truncate">{option.label}</span>
                            </button>
                        ))}

                        {/* Create new option */}
                        {search.trim() && !exactMatch && onCreateNew && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={creating}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    'text-primary font-medium',
                                    'border-t border-border mt-1 pt-2',
                                )}
                            >
                                {creating ? (
                                    <Loader2 className="size-3.5 shrink-0 animate-spin" />
                                ) : (
                                    <Plus className="size-3.5 shrink-0" />
                                )}
                                <span className="truncate">
                                    {creating ? 'Creating...' : `Create "${search.trim()}"`}
                                </span>
                            </button>
                        )}

                        {filtered.length === 0 && search.trim() && !onCreateNew && (
                            <p className="px-2 py-1.5 text-xs text-muted-foreground">
                                No results for "{search}".
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
