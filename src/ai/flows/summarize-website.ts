// This is a server action.
'use server';

/**
 * @fileOverview Summarizes a given website URL.
 * 
 * - summarizeWebsite - A function that handles the summarization of a website.
 * - SummarizeWebsiteInput - The input type for the summarizeWebsite function.
 * - SummarizeWebsiteOutput - The return type for the summarizeWebsite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getWebsiteContent} from '@/services/website-content';

const SummarizeWebsiteInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to summarize.'),
});
export type SummarizeWebsiteInput = z.infer<typeof SummarizeWebsiteInputSchema>;

const SummarizeWebsiteOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the website content.'),
  toolUsed: z.boolean().describe('Whether or not the tool was used to summarize the website.'),
});
export type SummarizeWebsiteOutput = z.infer<typeof SummarizeWebsiteOutputSchema>;

export async function summarizeWebsite(input: SummarizeWebsiteInput): Promise<SummarizeWebsiteOutput> {
  return summarizeWebsiteFlow(input);
}

const shouldSummarizeTool = ai.defineTool({
  name: 'shouldSummarize',
  description: 'This tool determines whether to summarize the website content or not.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL of the website to check.'),
    contentLength: z.number().describe('The length of the website content.'),
  }),
  outputSchema: z.boolean().describe('A boolean value indicating whether to summarize the website content or not.'),
}, async (input) => {
  // Implement the logic to determine whether to summarize the website or not.
  // If the content length is greater than 1000 characters, summarize the website.
  return input.contentLength > 1000;
});

const summarizeWebsitePrompt = ai.definePrompt({
  name: 'summarizeWebsitePrompt',
  input: {
    schema: SummarizeWebsiteInputSchema,
  },
  output: {
    schema: SummarizeWebsiteOutputSchema,
  },
  tools: [shouldSummarizeTool],
  prompt: `You are an AI assistant that summarizes the content of a website.\n
  The user will provide a URL. You will use the shouldSummarize tool to decide if you should summarize the content of the website.\n
  If the tool returns true, summarize the content of the website.\n  If the tool returns false, return an empty summary.\n
  URL: {{{url}}}\n  Summary:`, // Ensure you're using Handlebars syntax.
});

const summarizeWebsiteFlow = ai.defineFlow(
  {
    name: 'summarizeWebsiteFlow',
    inputSchema: SummarizeWebsiteInputSchema,
    outputSchema: SummarizeWebsiteOutputSchema,
  },
  async input => {
    // Call the getWebsiteContent service to fetch the website content
    const websiteContent = await getWebsiteContent(input.url);

    // If the content is empty, return an empty summary
    if (!websiteContent) {
      return {
        summary: 'Failed to retrieve website content.',
        toolUsed: false,
      };
    }

    // Call the shouldSummarize tool to determine whether to summarize the website content or not.
    const shouldSummarize = await shouldSummarizeTool({
      url: input.url,
      contentLength: websiteContent.length,
    });

    if (!shouldSummarize) {
      return {
        summary: 'Website content is too short to summarize.',
        toolUsed: true,
      };
    }

    // Call the prompt to summarize the website content
    const {output} = await summarizeWebsitePrompt(input);

    return {
      summary: output?.summary ?? 'No summary available.',
      toolUsed: true,
    };
  }
);
