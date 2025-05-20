import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { JSONSchema } from "@/shared/types";
import { extractFieldDefinitions } from "@/lib/schema-to-form";
import { renderFieldByType } from "./field-types";

interface SchemaFormProps {
  schema: JSONSchema;
  form: any;
}

export function SchemaForm({ schema, form }: SchemaFormProps) {
  const fields = extractFieldDefinitions(schema);
  
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                {renderFieldByType({
                  field,
                  value: formField.value,
                  onChange: formField.onChange,
                  onBlur: formField.onBlur,
                  ref: formField.ref,
                  disabled: false,
                })}
              </FormControl>
              {field.description && (
                <FormDescription>
                  {field.description}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
