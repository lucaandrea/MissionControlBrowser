import { z } from "zod";

/**
 * Validator for MCP server URLs
 */
export const serverUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    {
      message: "URL must start with http:// or https://",
    }
  );

/**
 * Validator for authentication tokens
 */
export const authTokenSchema = z
  .string()
  .trim()
  .min(1, "Auth token is required");

/**
 * Creates a Zod schema from a JSON Schema object
 * This is a simplified implementation that handles common field types
 */
export function createZodSchemaFromJsonSchema(jsonSchema: any): z.ZodType<any> {
  // Handle primitive types
  if (!jsonSchema.type && jsonSchema.properties) {
    jsonSchema.type = "object";
  }

  switch (jsonSchema.type) {
    case "string":
      let stringSchema = z.string();

      if (jsonSchema.minLength !== undefined) {
        stringSchema = stringSchema.min(jsonSchema.minLength, 
          `Minimum length is ${jsonSchema.minLength}`);
      }

      if (jsonSchema.maxLength !== undefined) {
        stringSchema = stringSchema.max(jsonSchema.maxLength, 
          `Maximum length is ${jsonSchema.maxLength}`);
      }

      if (jsonSchema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(jsonSchema.pattern), 
          "Invalid format");
      }

      if (jsonSchema.format === "email") {
        stringSchema = stringSchema.email("Invalid email address");
      }

      if (jsonSchema.format === "uri") {
        stringSchema = stringSchema.url("Invalid URL");
      }

      if (jsonSchema.enum) {
        return z.enum(jsonSchema.enum as [string, ...string[]]);
      }

      return stringSchema;

    case "number":
    case "integer":
      let numberSchema = jsonSchema.type === "integer" 
        ? z.number().int("Must be an integer")
        : z.number();

      if (jsonSchema.minimum !== undefined) {
        numberSchema = numberSchema.min(jsonSchema.minimum, 
          `Minimum value is ${jsonSchema.minimum}`);
      }

      if (jsonSchema.maximum !== undefined) {
        numberSchema = numberSchema.max(jsonSchema.maximum, 
          `Maximum value is ${jsonSchema.maximum}`);
      }

      return numberSchema;

    case "boolean":
      return z.boolean();

    case "array":
      if (!jsonSchema.items) {
        return z.array(z.any());
      }

      const itemSchema = createZodSchemaFromJsonSchema(jsonSchema.items);
      let arraySchema = z.array(itemSchema);

      if (jsonSchema.minItems !== undefined) {
        arraySchema = arraySchema.min(jsonSchema.minItems, 
          `Minimum items is ${jsonSchema.minItems}`);
      }

      if (jsonSchema.maxItems !== undefined) {
        arraySchema = arraySchema.max(jsonSchema.maxItems, 
          `Maximum items is ${jsonSchema.maxItems}`);
      }

      return arraySchema;

    case "object":
      if (!jsonSchema.properties) {
        return z.record(z.any());
      }

      const shape: Record<string, z.ZodType<any>> = {};
      for (const [key, prop] of Object.entries(jsonSchema.properties)) {
        const propertySchema = createZodSchemaFromJsonSchema(prop as any);
        
        shape[key] = jsonSchema.required?.includes(key)
          ? propertySchema
          : propertySchema.optional();
      }

      return z.object(shape);

    default:
      return z.any();
  }
}
