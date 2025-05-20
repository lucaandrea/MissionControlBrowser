import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SchemaForm } from "@/components/schema-form";
import { MCPTool } from "@/shared/types";
import { createZodSchemaFromJsonSchema } from "@/lib/schema-validators";

interface ToolDetailProps {
  tool: MCPTool;
  onBackToTools: () => void;
  onRunTool: (inputs: Record<string, any>) => void;
  isRunning: boolean;
}

export function ToolDetail({
  tool,
  onBackToTools,
  onRunTool,
  isRunning,
}: ToolDetailProps) {
  // Generate form validation schema from JSON schema
  const validationSchema = createZodSchemaFromJsonSchema(tool.inputs);
  
  // Create form
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues(tool.inputs),
  });
  
  // Reset form when tool changes
  useEffect(() => {
    form.reset(getDefaultValues(tool.inputs));
  }, [tool]);
  
  const handleSubmit = (data: any) => {
    onRunTool(data);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Tool detail header */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToTools}
          className="mr-2 sm:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to catalog</span>
        </Button>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {tool.name}
        </h2>
      </div>
      
      {/* Tool description and form */}
      <div className="p-4 overflow-y-auto flex-grow">
        {tool.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {tool.description}
          </p>
        )}
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <SchemaForm
              schema={tool.inputs}
              form={form}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isRunning || form.formState.isSubmitting}>
              {isRunning ? "Running..." : "Run Tool"}
            </Button>
        </form>
      </div>
    </div>
  );
}

// Helper to extract default values from JSON schema
function getDefaultValues(schema: any): Record<string, any> {
  if (!schema.properties) return {};
  
  const defaultValues: Record<string, any> = {};
  
  for (const [key, prop] of Object.entries<any>(schema.properties)) {
    if (prop.default !== undefined) {
      defaultValues[key] = prop.default;
    } else if (prop.type === "string") {
      defaultValues[key] = "";
    } else if (prop.type === "number" || prop.type === "integer") {
      defaultValues[key] = null;
    } else if (prop.type === "boolean") {
      defaultValues[key] = false;
    } else if (prop.type === "array") {
      defaultValues[key] = [];
    } else if (prop.type === "object") {
      defaultValues[key] = getDefaultValues(prop);
    }
  }
  
  return defaultValues;
}
