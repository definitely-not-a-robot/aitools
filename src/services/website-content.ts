// This is a server action.
'use server';

/**
 * @fileOverview Service to fetch website content.
 * 
 * - getWebsiteContent - Fetches the HTML content of a given URL.
 */

export async function getWebsiteContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',

      },
       // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Failed to fetch website content from ${url}. Status: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      console.warn(`Content type for ${url} is not HTML: ${contentType}`);
      // Allow processing non-HTML for now, but this could be an error in other contexts
    }

    const textContent = await response.text();
    
    // Basic HTML cleaning - remove script and style tags
    // More sophisticated parsing (e.g., using a library like Cheerio) could be done here if needed.
    const cleanedContent = textContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ') // Remove all other HTML tags, leaving their text content
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim();

    return cleanedContent;

  } catch (error) {
    console.error(`Error fetching or processing website content from ${url}:`, error);
    return null;
  }
}
