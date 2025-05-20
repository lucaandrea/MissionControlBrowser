import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFieldArray } from "react-hook-form";
import { JSONSchema } from "@/shared/types";
import {
  extractFieldDefinitions,
  mapSchemaTypeToFieldType,
} from "@/lib/schema-to-form";
import { renderFieldByType } from "./field-types";

interface SchemaFormProps {
  schema: JSONSchema;
  form: any;
  namePrefix?: string;
}

export function SchemaForm({ schema, form, namePrefix = "" }: SchemaFormProps) {
  const fields = extractFieldDefinitions(schema);

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const fieldName = namePrefix ? `${namePrefix}${field.name}` : field.name;

        if (field.type === "object" && field.properties) {
          const nestedSchema: JSONSchema = {
            type: "object",
            properties: field.properties,
            required: (field as any).required,
          } as any;

          return (
            <Collapsible key={fieldName} className="border rounded-md">
              <CollapsibleTrigger className="w-full text-left px-2 py-1 font-medium">
                {field.label}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2">
                <SchemaForm
                  schema={nestedSchema}
                  form={form}
                  namePrefix={`${fieldName}.`}
                />
              </CollapsibleContent>
            </Collapsible>
          );
        }

        if (field.type === "array" && field.items) {
          return (
            <ArrayField
              key={fieldName}
              field={field}
              fieldName={fieldName}
              form={form}
            />
          );
        }

        if (field.type === "oneOf") {
          return (
            <OneOfField
              key={fieldName}
              field={field}
              fieldName={fieldName}
              form={form}
            />
          );
        }

        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "const" ? (
                    renderFieldByType({
                      field,
                      value: field.const,
                      onChange: () => {},
                      ref: formField.ref,
                      disabled: true,
                    })
                  ) : (
                    renderFieldByType({
                      field,
                      value: formField.value,
                      onChange: formField.onChange,
                      onBlur: formField.onBlur,
                      ref: formField.ref,
                      disabled: false,
                    })
                  )}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                {field.examples && (
                  <FormDescription>
                    e.g. {field.examples.join(", ")}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
}

interface ArrayFieldProps {
  field: ReturnType<typeof extractFieldDefinitions>[number];
  fieldName: string;
  form: any;
}

function ArrayField({ field, fieldName, form }: ArrayFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName as any,
  });

  const itemSchema = field.items!;

  return (
    <div className="space-y-2">
      <FormLabel>{field.label}</FormLabel>
      {field.description && (
        <FormDescription>{field.description}</FormDescription>
      )}
      {fields.map((arrayField, index) => {
        const itemName = `${fieldName}.${index}`;
        if (itemSchema.type === "object" && itemSchema.properties) {
          const nestedSchema: JSONSchema = {
            type: "object",
            properties: itemSchema.properties,
            required: (itemSchema as any).required,
          } as any;
          return (
            <div key={arrayField.id} className="border rounded-md p-2 space-y-2">
              <SchemaForm
                schema={nestedSchema}
                form={form}
                namePrefix={`${itemName}.`}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          );
        }

        const itemField = {
          name: itemName,
          type: mapSchemaTypeToFieldType(itemSchema, itemName),
          label: field.label,
          description: itemSchema.description,
          required: true,
          default: itemSchema.default,
          options: itemSchema.enum?.map((v) => ({ label: String(v), value: v })),
          min: itemSchema.minimum,
          max: itemSchema.maximum,
          minLength: itemSchema.minLength,
          maxLength: itemSchema.maxLength,
          pattern: itemSchema.pattern,
        };

        return (
          <FormField
            key={arrayField.id}
            control={form.control}
            name={itemName as any}
            render={({ field: formField }) => (
              <FormItem className="flex items-start gap-2">
                <FormControl>
                  {renderFieldByType({
                    field: itemField as any,
                    value: formField.value,
                    onChange: formField.onChange,
                    onBlur: formField.onBlur,
                    ref: formField.ref,
                    disabled: false,
                  })}
                </FormControl>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => append(itemSchema.default ?? (itemSchema.type === "object" ? {} : ""))}
      >
        Add
      </Button>
    </div>
  );
}

interface OneOfFieldProps {
  field: ReturnType<typeof extractFieldDefinitions>[number];
  fieldName: string;
  form: any;
}

function OneOfField({ field, fieldName, form }: OneOfFieldProps) {
  const options = field.oneOf || field.anyOf || [];
  const [index, setIndex] = React.useState(0);
  const selected = options[index];

  return (
    <div className="space-y-2">
      <FormLabel>{field.label}</FormLabel>
      <select
        className="border p-1 rounded"
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
      >
        {options.map((opt, i) => (
          <option key={i} value={i}>
            {opt.title || `Option ${i + 1}`}
          </option>
        ))}
      </select>
      {selected && (
        <div className="pl-4 border-l space-y-2">
          <SchemaForm
            schema={selected as any}
            form={form}
            namePrefix={`${fieldName}.`}
          />
        </div>
      )}
    </div>
  );
}
