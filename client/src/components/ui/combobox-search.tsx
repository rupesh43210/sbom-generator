import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

export interface SearchOption {
  value: string;
  label: string;
  cpe?: string;
}

interface ComboboxSearchProps {
  value?: string;
  onValueChange: (value: SearchOption) => void;
  onSearch: (query: string) => Promise<SearchOption[]>;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function ComboboxSearch({
  value,
  onValueChange,
  onSearch,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  className,
}: ComboboxSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [options, setOptions] = React.useState<SearchOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    if (debouncedSearchQuery.length >= 3) {
      setLoading(true);
      onSearch(debouncedSearchQuery)
        .then(results => {
          setOptions(results);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setOptions([]);
    }
  }, [debouncedSearchQuery, onSearch]);

  // Find the currently selected option to display its label
  const selectedOption = options.find(option => option.value === value) || { value: value || "", label: value || placeholder };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedOption.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loading && options.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={`${option.value}-${option.cpe || ''}`}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}