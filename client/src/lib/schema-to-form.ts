import { JSONSchema, JSONSchemaProperty } from "@/shared/types";

/**
 * Maps a JSON Schema type to a form field type
 */
export function mapSchemaTypeToFieldType(
  property: JSONSchemaProperty,
  propertyName: string
): string {
  // Handle specific formats first
  if (property.format === "date-time" || property.format === "date") {
    return "datetime";
  }
  
  if (property.format === "email") {
    return "email";
  }
  
  if (property.format === "uri") {
    return "url";
  }
  
  if (property.format === "binary" || propertyName.toLowerCase().includes("file")) {
    return "file";
  }
  
  // Handle enum as select
  if (Array.isArray(property.enum)) {
    return "select";
  }
  
  // Handle by type
  switch (property.type) {
    case "string":
      if (property.maxLength && property.maxLength > 100) {
        return "textarea";
      }
      return "text";
      
    case "number":
    case "integer":
      return "number";
      
    case "boolean":
      return "checkbox";
      
    case "array":
      if (property.items) {
        if (property.items.type === "string") {
          return "tags";
        }
        return "array";
      }
      return "array";
      
    case "object":
      return "object";
      
    default:
      return "text";
  }
}

/**
 * Extracts field definitions from a JSON Schema
 */
export interface FieldDefinition {
  name: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  default?: any;
  const?: any;
  examples?: any[];
  options?: any[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  properties?: Record<string, any>;
  items?: JSONSchemaProperty;
  oneOf?: JSONSchemaProperty[];
  anyOf?: JSONSchemaProperty[];
}

export function extractFieldDefinitions(
  schema: JSONSchema | JSONSchemaProperty
) {
  const fields: FieldDefinition[] = [];
  
  const properties = schema.properties || {};
  const requiredFields = schema.required || [];
  
  for (const [propertyName, property] of Object.entries(properties)) {
    const fieldType = mapSchemaTypeToFieldType(property, propertyName);
    
    const field: FieldDefinition = {
      name: propertyName,
      type: fieldType,
      label: property.title || formatPropertyName(propertyName),
      description: property.description,
      required: requiredFields.includes(propertyName),
      default: property.default,
      const: (property as any).const,
      examples: (property as any).examples,
      options: property.enum?.map((value) => ({ label: String(value), value })),
      min: property.minimum,
      max: property.maximum,
      minLength: property.minLength,
      maxLength: property.maxLength,
      minItems: (property as any).minItems,
      maxItems: (property as any).maxItems,
      pattern: property.pattern,
      properties: property.properties,
      items: property.items,
      oneOf: (property as any).oneOf,
      anyOf: (property as any).anyOf,
    };
    
    fields.push(field);
  }
  
  return fields;
}

/**
 * Formats a property name into a human-readable label
 */
function formatPropertyName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Validates a value against a schema property
 */
export function validateField(
  value: any,
  property: JSONSchemaProperty,
  required: boolean
): string | null {
  if (required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }
  
  if (value === undefined || value === null || value === '') {
    return null; // Skip further validation for empty optional fields
  }
  
  switch (property.type) {
    case 'string':
      if (typeof value !== 'string') {
        return 'Value must be a string';
      }
      
      if (property.minLength !== undefined && value.length < property.minLength) {
        return `Must be at least ${property.minLength} characters`;
      }
      
      if (property.maxLength !== undefined && value.length > property.maxLength) {
        return `Must be at most ${property.maxLength} characters`;
      }
      
      if (property.pattern && !new RegExp(property.pattern).test(value)) {
        return 'Invalid format';
      }
      
      if (property.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address';
      }
      
      if (property.format === 'uri' && !/^https?:\/\//.test(value)) {
        return 'Invalid URL';
      }
      
      break;
      
    case 'number':
    case 'integer':
      const num = Number(value);
      
      if (isNaN(num)) {
        return 'Value must be a number';
      }
      
      if (property.type === 'integer' && !Number.isInteger(num)) {
        return 'Value must be an integer';
      }
      
      if (property.minimum !== undefined && num < property.minimum) {
        return `Must be at least ${property.minimum}`;
      }
      
      if (property.maximum !== undefined && num > property.maximum) {
        return `Must be at most ${property.maximum}`;
      }
      
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean') {
        return 'Value must be a boolean';
      }
      break;
      
    case 'array':
      if (!Array.isArray(value)) {
        return 'Value must be an array';
      }
      
      // TODO: Validate array items
      break;
      
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return 'Value must be an object';
      }
      
      // TODO: Validate object properties
      break;
  }
  
  return null; // No validation errors
}
