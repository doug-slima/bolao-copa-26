"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MobileTabSelectOption {
  value: string;
  label: string;
}

interface MobileTabSelectProps {
  options: MobileTabSelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function MobileTabSelect({
  options,
  value,
  onChange,
  className,
  placeholder = "Selecione...",
}: MobileTabSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "w-auto min-w-[160px] h-12 px-5 rounded-full border-none font-medium text-base text-black",
          "[&_svg]:text-black",
          className
        )}
        style={{ backgroundColor: "#ffffff" }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-2xl p-1" position="popper" side="bottom" align="start">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-xl cursor-pointer py-3 px-4 text-base font-medium"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
