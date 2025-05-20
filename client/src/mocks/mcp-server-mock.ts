import { MCPManifest, MCPTool } from "@/shared/types";

// Sample tools with different input types to demonstrate form generation
const tools: MCPTool[] = [
  {
    name: "Text Summarizer",
    slug: "text-summarizer",
    description: "Summarizes a lengthy text into a concise paragraph",
    tags: ["text", "nlp"],
    inputs: {
      type: "object",
      required: ["input_text"],
      properties: {
        input_text: {
          type: "string",
          title: "Input Text",
          description: "Text to be summarized (min 100 characters)",
          minLength: 100,
        },
        max_length: {
          type: "integer",
          title: "Max Length",
          description: "Maximum length of the summary in words",
          default: 150,
          minimum: 50,
          maximum: 500,
        },
        format: {
          type: "string",
          title: "Output Format",
          enum: ["paragraph", "bullets", "headline"],
          default: "paragraph",
        },
        preserve_keywords: {
          type: "boolean",
          title: "Preserve Keywords",
          description: "Preserve important keywords in the summary",
          default: true,
        },
      },
    },
  },
  {
    name: "Image Generator",
    slug: "image-generator",
    description: "Creates images from text prompts using stable diffusion",
    tags: ["image", "generation"],
    inputs: {
      type: "object",
      required: ["prompt"],
      properties: {
        prompt: {
          type: "string",
          title: "Prompt",
          description: "Text description of the image to generate",
          minLength: 3,
          maxLength: 1000,
        },
        negative_prompt: {
          type: "string",
          title: "Negative Prompt",
          description: "Elements to exclude from the image",
        },
        width: {
          type: "integer",
          title: "Width",
          description: "Width of the output image",
          default: 512,
          enum: [512, 768, 1024],
        },
        height: {
          type: "integer",
          title: "Height",
          description: "Height of the output image",
          default: 512,
          enum: [512, 768, 1024],
        },
        num_inference_steps: {
          type: "integer",
          title: "Steps",
          description: "Number of denoising steps",
          default: 50,
          minimum: 10,
          maximum: 150,
        },
        guidance_scale: {
          type: "number",
          title: "Guidance Scale",
          description: "How closely to follow the prompt",
          default: 7.5,
          minimum: 1,
          maximum: 20,
        },
      },
    },
  },
  {
    name: "Data Analyzer",
    slug: "data-analyzer",
    description: "Analyzes CSV data and generates statistical insights",
    tags: ["data", "analytics"],
    inputs: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "string",
          title: "CSV Data",
          description: "Raw CSV data or URL to CSV file",
          format: "uri",
        },
        columns: {
          type: "array",
          title: "Columns",
          description: "Specific columns to analyze (leave empty for all)",
          items: {
            type: "string",
          },
        },
        include_visualizations: {
          type: "boolean",
          title: "Include Visualizations",
          description: "Generate charts and graphs for the data",
          default: true,
        },
        output_format: {
          type: "string",
          title: "Output Format",
          enum: ["json", "html", "markdown"],
          default: "json",
        },
      },
    },
  },
];

// Sample manifest
export const mockManifest: MCPManifest = {
  name: "MCP Demo Server",
  description: "A demonstration MCP server with various tools",
  version: "1.0.0",
  auth: {
    type: "bearer",
    required: true,
  },
  tools,
};

// Sample execution outputs
export const mockOutputs = {
  "text-summarizer": {
    success: true,
    summary: "The article discusses climate change impacts on biodiversity, focusing on how rising temperatures affect ecosystems worldwide. Key findings indicate species migration patterns are changing, with some unable to adapt quickly enough. Researchers suggest protected corridors could help species movement between habitats. The study emphasizes that immediate action on carbon emissions is needed to prevent irreversible ecosystem damage.",
    key_points: [
      "Species migration patterns are changing due to rising temperatures",
      "Protected corridors could help species movement",
      "Immediate action on carbon emissions is crucial",
    ],
    metadata: {
      original_length: 2145,
      summary_length: 147,
      processing_time_ms: 3291,
    },
  },
  "image-generator": {
    success: true,
    images: [
      {
        url: "https://example.com/generated-image.png",
        width: 512,
        height: 512,
        seed: 42,
      },
    ],
    metadata: {
      prompt: "A beautiful sunset over mountains with lakes reflecting the orange sky",
      model: "stable-diffusion-xl-turbo",
      processing_time_ms: 5821,
    },
  },
  "data-analyzer": {
    success: true,
    statistics: {
      row_count: 1000,
      column_count: 5,
      columns: {
        age: {
          type: "numeric",
          min: 18,
          max: 65,
          mean: 34.2,
          median: 32,
          std_dev: 8.7,
          missing: 0,
        },
        income: {
          type: "numeric",
          min: 15000,
          max: 150000,
          mean: 58420,
          median: 52000,
          std_dev: 24500,
          missing: 12,
        },
        education: {
          type: "categorical",
          categories: [
            { value: "high_school", count: 320 },
            { value: "bachelors", count: 450 },
            { value: "masters", count: 180 },
            { value: "phd", count: 50 },
          ],
          missing: 0,
        },
      },
    },
    correlations: [
      { columns: ["age", "income"], value: 0.68, strength: "moderate" },
      { columns: ["education", "income"], value: 0.75, strength: "strong" },
    ],
    visualizations: [
      { type: "histogram", column: "age", url: "https://example.com/age-histogram.svg" },
      { type: "histogram", column: "income", url: "https://example.com/income-histogram.svg" },
      { type: "pie", column: "education", url: "https://example.com/education-pie.svg" },
      { type: "scatter", columns: ["age", "income"], url: "https://example.com/age-income-scatter.svg" },
    ],
  },
};

// Mock execution logs
export const mockLogs = {
  "text-summarizer": [
    "[INFO] 2023-07-15T12:34:56Z Request received",
    "[INFO] 2023-07-15T12:34:56Z Validating input parameters",
    "[INFO] 2023-07-15T12:34:57Z Input validation successful",
    "[INFO] 2023-07-15T12:34:57Z Processing text (2145 characters)",
    "[INFO] 2023-07-15T12:34:58Z Extracting key sentences",
    "[INFO] 2023-07-15T12:34:59Z Generating summary",
    "[INFO] 2023-07-15T12:35:00Z Summary generated (147 words)",
    "[INFO] 2023-07-15T12:35:00Z Response complete",
  ],
  "image-generator": [
    "[INFO] 2023-07-15T12:40:23Z Request received",
    "[INFO] 2023-07-15T12:40:23Z Validating input parameters",
    "[INFO] 2023-07-15T12:40:24Z Input validation successful",
    "[INFO] 2023-07-15T12:40:24Z Initializing model stable-diffusion-xl-turbo",
    "[INFO] 2023-07-15T12:40:26Z Model initialized",
    "[INFO] 2023-07-15T12:40:26Z Processing prompt",
    "[INFO] 2023-07-15T12:40:28Z Starting inference (50 steps)",
    "[INFO] 2023-07-15T12:40:35Z Inference 20% complete",
    "[INFO] 2023-07-15T12:40:42Z Inference 40% complete",
    "[INFO] 2023-07-15T12:40:49Z Inference 60% complete",
    "[INFO] 2023-07-15T12:40:56Z Inference 80% complete",
    "[INFO] 2023-07-15T12:41:03Z Inference 100% complete",
    "[INFO] 2023-07-15T12:41:05Z Post-processing image",
    "[INFO] 2023-07-15T12:41:07Z Uploading result",
    "[INFO] 2023-07-15T12:41:09Z Response complete",
  ],
  "data-analyzer": [
    "[INFO] 2023-07-15T12:45:10Z Request received",
    "[INFO] 2023-07-15T12:45:10Z Validating input parameters",
    "[INFO] 2023-07-15T12:45:11Z Input validation successful",
    "[INFO] 2023-07-15T12:45:11Z Downloading CSV data",
    "[INFO] 2023-07-15T12:45:13Z CSV data downloaded (102KB)",
    "[INFO] 2023-07-15T12:45:13Z Parsing CSV data",
    "[INFO] 2023-07-15T12:45:14Z Found 5 columns and 1000 rows",
    "[INFO] 2023-07-15T12:45:14Z Analyzing data types",
    "[INFO] 2023-07-15T12:45:15Z Computing basic statistics",
    "[INFO] 2023-07-15T12:45:17Z Computing correlations",
    "[INFO] 2023-07-15T12:45:19Z Generating visualizations",
    "[INFO] 2023-07-15T12:45:23Z Generated 4 visualizations",
    "[INFO] 2023-07-15T12:45:24Z Response complete",
  ],
};

/**
 * Mock MCP server for testing purposes
 */
export class MockMCPServer {
  private authToken: string | null = null;
  
  /**
   * Get the manifest
   */
  getManifest(token?: string): Promise<MCPManifest> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // If auth is required and no token is provided, reject
        if (mockManifest.auth?.required && !token && !this.authToken) {
          reject(new Error("Authentication required"));
          return;
        }
        
        // If a token is provided, store it
        if (token) {
          this.authToken = token;
        }
        
        resolve(mockManifest);
      }, 500);
    });
  }
  
  /**
   * Execute a tool
   */
  executeTool(
    toolSlug: string,
    inputs: Record<string, any>,
    token?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // If auth is required and no token is provided, reject
      if (mockManifest.auth?.required && !token && !this.authToken) {
        reject(new Error("Authentication required"));
        return;
      }
      
      // Find the tool
      const tool = mockManifest.tools.find((t) => t.slug === toolSlug);
      if (!tool) {
        reject(new Error(`Tool '${toolSlug}' not found`));
        return;
      }
      
      // Simulate processing time
      setTimeout(() => {
        // Return mock output based on tool slug
        const output = mockOutputs[toolSlug as keyof typeof mockOutputs];
        if (!output) {
          reject(new Error(`No mock output available for tool '${toolSlug}'`));
          return;
        }
        
        resolve(output);
      }, 2000);
    });
  }
  
  /**
   * Get logs for a tool execution
   */
  getLogs(toolSlug: string): string[] {
    return mockLogs[toolSlug as keyof typeof mockLogs] || [];
  }
}
