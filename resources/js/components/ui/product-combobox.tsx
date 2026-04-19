import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2, Package, Search } from 'lucide-react';
import { ProductOption } from '@/types';

interface ProductComboboxProps {
    value: string;
    onChange: (value: string) => void;
    /** Called with full product data when a product is selected */
    onProductSelect?: (product: ProductOption) => void;
    /** Set of product IDs already selected in other rows */
    excludeIds?: Set<string>;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    /** Show stock info in each option (useful for Sales) */
    showStock?: boolean;
    /** Only show products with stock > 0 */
    inStockOnly?: boolean;
}

export function ProductCombobox({
    value,
    onChange,
    onProductSelect,
    excludeIds,
    placeholder = 'Pilih produk...',
    id,
    disabled,
    showStock = false,
    inStockOnly = false,
}: ProductComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<ProductOption[]>([]);
    const [selectedProduct, setSelectedProduct] = React.useState<ProductOption | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const [highlightIndex, setHighlightIndex] = React.useState(-1);
    const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0, width: 0 });
    const abortRef = React.useRef<AbortController | null>(null);

    // Fetch selected product info on mount if value is set
    React.useEffect(() => {
        if (value && !selectedProduct) {
            fetch(`/products/search?q=${value}`)
                .then((r) => r.json())
                .then((data: ProductOption[]) => {
                    const match = data.find((p) => String(p.id) === value);
                    if (match) setSelectedProduct(match);
                })
                .catch(() => {});
        }
    }, []);

    // Reset selected product when value is cleared
    React.useEffect(() => {
        if (!value) {
            setSelectedProduct(null);
        }
    }, [value]);

    // Debounced server search
    React.useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            // Abort previous request
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.set('q', search);
            if (inStockOnly) params.set('in_stock', '1');

            fetch(`/products/search?${params.toString()}`, { signal: controller.signal })
                .then((r) => r.json())
                .then((data: ProductOption[]) => {
                    setResults(data);
                    setLoading(false);
                    setHighlightIndex(-1);
                })
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        setLoading(false);
                    }
                });
        }, 250);

        return () => clearTimeout(timer);
    }, [search, open, inStockOnly]);

    // Fetch initial results when opening
    React.useEffect(() => {
        if (open && results.length === 0 && !loading) {
            setSearch('');
        }
    }, [open]);

    // Filtered results (exclude already selected)
    const filtered = React.useMemo(() => {
        if (!excludeIds || excludeIds.size === 0) return results;
        return results.filter(
            (p) => !excludeIds.has(String(p.id)) || String(p.id) === value,
        );
    }, [results, excludeIds, value]);

    // Calculate dropdown position
    const updatePosition = React.useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 300),
            });
        }
    }, []);

    React.useEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, updatePosition]);

    // Close on outside click
    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setOpen(false);
                setSearch('');
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [open]);

    function handleSelect(product: ProductOption) {
        onChange(String(product.id));
        setSelectedProduct(product);
        onProductSelect?.(product);
        setOpen(false);
        setSearch('');
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') {
            setOpen(false);
            setSearch('');
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < filtered.length - 1 ? prev + 1 : prev,
            );
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIndex >= 0 && highlightIndex < filtered.length) {
                handleSelect(filtered[highlightIndex]);
            } else if (filtered.length === 1) {
                handleSelect(filtered[0]);
            }
        }
    }

    // Scroll focused item into view
    React.useEffect(() => {
        if (highlightIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightIndex] as HTMLElement;
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightIndex]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);

    const dropdown = open
        ? createPortal(
              <div
                  ref={dropdownRef}
                  style={{
                      position: 'fixed',
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      width: dropdownPos.width,
                      zIndex: 9999,
                  }}
                  className="rounded-lg border border-input-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95"
              >
                  {/* Search input */}
                  <div className="p-1.5">
                      <div className="relative">
                          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          <input
                              ref={inputRef}
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Cari nama atau SKU..."
                              className="h-7 w-full rounded-md border border-input-border bg-transparent pl-7 pr-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                          />
                          {loading && (
                              <Loader2 className="absolute right-2 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                          )}
                      </div>
                  </div>

                  {/* Options list */}
                  <div ref={listRef} className="max-h-56 overflow-y-auto p-1">
                      {!loading && filtered.length === 0 && (
                          <div className="flex flex-col items-center gap-1 py-4 text-muted-foreground">
                              <Package className="size-5 opacity-40" />
                              <p className="text-xs">
                                  {search
                                      ? `Tidak ada produk untuk "${search}"`
                                      : 'Ketik untuk mencari produk...'}
                              </p>
                          </div>
                      )}

                      {filtered.map((product, index) => {
                          const isSelected = String(product.id) === value;
                          const isHighlighted = index === highlightIndex;

                          return (
                              <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleSelect(product)}
                                  onMouseEnter={() => setHighlightIndex(index)}
                                  className={cn(
                                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                      'hover:bg-accent hover:text-accent-foreground',
                                      isSelected && 'bg-accent/50',
                                      isHighlighted &&
                                          !isSelected &&
                                          'bg-accent/30',
                                  )}
                              >
                                  <Check
                                      className={cn(
                                          'size-3.5 shrink-0',
                                          isSelected
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                      )}
                                  />
                                  <div className="flex flex-col items-start min-w-0 flex-1">
                                      <span className="truncate w-full text-left font-medium">
                                          {product.name}
                                      </span>
                                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                                              {product.sku}
                                          </code>
                                          {showStock && (
                                              <span
                                                  className={cn(
                                                      product.stock <= 0
                                                          ? 'text-destructive'
                                                          : product.stock <= 10
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : '',
                                                  )}
                                              >
                                                  Stok: {product.stock}
                                              </span>
                                          )}
                                          <span>{formatPrice(product.price)}</span>
                                      </span>
                                  </div>
                              </button>
                          );
                      })}

                      {loading && results.length > 0 && (
                          <div className="flex items-center justify-center py-2">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                      )}
                  </div>
              </div>,
              document.body,
          )
        : null;

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                ref={triggerRef}
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
                <span className="truncate">
                    {selectedProduct
                        ? `${selectedProduct.name} (${selectedProduct.sku})`
                        : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
            </button>

            {dropdown}
        </div>
    );
}
