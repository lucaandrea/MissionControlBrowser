/**
 * Response type definitions for the different types of responses
 */
export type ResponseType = 
  | "empty"
  | "text"
  | "markdown"
  | "array"
  | "table"
  | "image"
  | "file"
  | "object"
  | "raw"
  | "error"
  | "unknown";

export interface ResponseData {
  type: ResponseType;
  content?: string | any[];
  url?: string;
  filename?: string;
}

/**
 * Attempts to determine the type of a response
 */
export function determineResponseType(response: any): ResponseType {
  if (!response) return "empty";
  
  if (typeof response === "string") {
    if (response.trim().startsWith("#") || response.includes("\n#") || 
        response.includes("**") || response.includes("__")) {
      return "markdown";
    }
    return "text";
  }
  
  if (Array.isArray(response)) {
    if (response.length > 0 && typeof response[0] === "object") {
      return "table";
    }
    return "array";
  }
  
  if (typeof response === "object") {
    // Check if it might be an image
    if (response.type === "image" || response.mimeType?.startsWith("image/") ||
        response.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return "image";
    }
    
    // Check if it might be a file
    if (response.type === "file" || response.mimeType || 
        response.filename || response.name || response.content) {
      return "file";
    }
    
    return "object";
  }
  
  return "unknown";
}

/**
 * Processes the response and returns structured data for rendering
 */
export function renderResponse(response: any): ResponseData {
  const responseType = determineResponseType(response);
  
  switch (responseType) {
    case "empty":
      return {
        type: "empty",
        content: "No output"
      };
      
    case "text":
      return {
        type: "text",
        content: String(response)
      };
      
    case "markdown":
      return {
        type: "markdown",
        content: response
      };
      
    case "array":
      return {
        type: "array",
        content: response
      };
      
    case "table":
      return {
        type: "table",
        content: response
      };
      
    case "image":
      if (typeof response === "object" && response.url) {
        return {
          type: "image",
          url: response.url
        };
      }
      return {
        type: "error",
        content: "Unsupported image format"
      };
      
    case "file":
      if (typeof response === "object") {
        const filename = response.filename || response.name || "file";
        return {
          type: "file",
          filename,
          url: response.url
        };
      }
      return {
        type: "error",
        content: "Unsupported file format"
      };
      
    case "object":
      return {
        type: "object",
        content: response
      };
      
    default:
      return {
        type: "raw",
        content: JSON.stringify(response, null, 2)
      };
  }
}

/**
 * Formats execution time in human-readable format
 */
export function formatExecutionTime(seconds: number): string {
  if (seconds < 0.01) {
    return `${Math.round(seconds * 1000)}ms`;
  }
  
  if (seconds < 1) {
    return `${seconds.toFixed(2)}s`;
  }
  
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formats a date in relative time (e.g. "3 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return "just now";
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
  
  if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
}
