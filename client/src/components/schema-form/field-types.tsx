import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FieldProps {
  field: {
    name: string;
    type: string;
    label: string;
    description?: string;
    required: boolean;
    default?: any;
    options?: any[];
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    properties?: Record<string, any>;
  };
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  ref?: React.Ref<any>;
  disabled?: boolean;
}

export function renderFieldByType(props: FieldProps) {
  const { field, value, onChange, onBlur, ref, disabled } = props;
  
  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return (
        <Input
          id={field.name}
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      );
      
    case "textarea":
      return (
        <Textarea
          id={field.name}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      );
      
    case "number":
      return (
        <Input
          id={field.name}
          type="number"
          value={value === null ? "" : value}
          onChange={(e) => {
            const val = e.target.value === "" ? null : Number(e.target.value);
            onChange(val);
          }}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
          min={field.min}
          max={field.max}
          step="any"
        />
      );
      
    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={!!value}
            onCheckedChange={onChange}
            ref={ref}
            disabled={disabled}
          />
          <label
            htmlFor={field.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {field.label}
          </label>
        </div>
      );
      
    case "select":
      return (
        <Select
          value={value || ""}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={field.name}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case "tags":
      // Simplified tags input
      return (
        <Input
          id={field.name}
          value={Array.isArray(value) ? value.join(", ") : ""}
          onChange={(e) => {
            const val = e.target.value === "" 
              ? [] 
              : e.target.value.split(",").map((tag) => tag.trim());
            onChange(val);
          }}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
          placeholder="Enter tags separated by commas"
        />
      );
      
    case "file":
      return (
        <Input
          id={field.name}
          type="file"
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            onChange(file);
          }}
          ref={ref}
          disabled={disabled}
        />
      );
      
    case "slider":
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      return (
        <div className="space-y-2">
          <Slider
            id={field.name}
            value={[value ?? min]}
            min={min}
            max={max}
            step={1}
            onValueChange={(values) => onChange(values[0])}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      );
      
    case "datetime":
      return (
        <Input
          id={field.name}
          type="datetime-local"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
        />
      );
      
    default:
      return (
        <Input
          id={field.name}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
        />
      );
  }
}
