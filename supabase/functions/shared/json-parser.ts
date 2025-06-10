/**
 * Utility functions for parsing JSON responses from AI services
 */

/**
 * Extracts and parses JSON from OpenAI responses that may be wrapped in markdown code blocks
 *
 * Args:
 *     responseText (string): The response text to parse.
 *
 * Returns:
 *     unknown: The parsed JSON object, or throws if parsing fails.
 */
export function parseAIResponse(responseText: string): unknown {
  if (!responseText) {
    throw new Error('Empty response text');
  }

  // First try direct JSON parsing
  try {
    return JSON.parse(responseText);
  } catch (directParseError) {
    console.log('Direct JSON parse failed, trying markdown extraction...');
    
    // Try to extract JSON from markdown code blocks
    const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
    const match = responseText.match(jsonBlockRegex);
    
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (markdownParseError) {
        console.error('Markdown JSON parse failed:', markdownParseError);
      }
    }
    
    // Try to find any JSON-like object in the response
    const jsonObjectRegex = /\{[\s\S]*\}/;
    const objectMatch = responseText.match(jsonObjectRegex);
    
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (objectParseError) {
        console.error('Object JSON parse failed:', objectParseError);
      }
    }
    
    // If all parsing attempts fail, throw error with context
    console.error('All JSON parsing attempts failed for response:', responseText.substring(0, 200) + '...');
    throw new Error(`Failed to parse JSON response. Original error: ${directParseError.message}`);
  }
}

/**
 * Validates that a parsed object has required fields
 *
 * Args:
 *     obj (unknown): The object to validate.
 *     requiredFields (string[]): The required field names.
 *
 * Returns:
 *     boolean: True if all required fields are present, false otherwise.
 */
export function validateRequiredFields(obj: unknown, requiredFields: string[]): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return requiredFields.every(field => Object.prototype.hasOwnProperty.call(obj, field));
}
