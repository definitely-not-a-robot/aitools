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
  toolUsed: z.boolean().describe('Whether or not an AI tool was used in the process (decision or summarization).'),
});
export type SummarizeWebsiteOutput = z.infer<typeof SummarizeWebsiteOutputSchema>;

export async function summarizeWebsite(input: SummarizeWebsiteInput): Promise<SummarizeWebsiteOutput> {
  return summarizeWebsiteFlow(input);
}

const shouldSummarizeTool = ai.defineTool({
  name: 'shouldSummarize',
  description: 'This tool determines whether to summarize the website content based on its length.',
  inputSchema: z.object({
    contentLength: z.number().describe('The length of the website content.'),
  }),
  outputSchema: z.boolean().describe('A boolean value indicating whether to summarize the website content or not.'),
}, async (input) => {
  return input.contentLength > 1000;
});

const summarizeContentPrompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {
    schema: z.object({
      url: z.string().url().describe('The URL of the website (for context).'),
      content: z.string().describe('The actual text content of the website to be summarized.'),
    }),
  },
  output: {
    schema: z.object({
        summary: z.string().describe('A concise summary of the provided website content.'),
    })
  },
  prompt: `You are an AI assistant that summarizes website content.
You have been provided with the text content of a website.
Please generate a concise summary for the following content from URL: {{{url}}}

Content:
{{{content}}}

Provide only the summary in your response.`,
});

const summarizeWebsiteFlow = ai.defineFlow(
  {
    name: 'summarizeWebsiteFlow',
    inputSchema: SummarizeWebsiteInputSchema,
    outputSchema: SummarizeWebsiteOutputSchema,
  },
  async (flowInput): Promise<SummarizeWebsiteOutput> => {
    const websiteContent = await getWebsiteContent(flowInput.url);

    if (!websiteContent) {
      return {
        summary: 'Failed to retrieve website content.',
        toolUsed: false, 
      };
    }
    
    const doSummarize = await shouldSummarizeTool({
      contentLength: websiteContent.length,
    });

    if (!doSummarize) {
      return {
        summary: 'Website content is too short to summarize (less than 1000 characters).',
        toolUsed: true, 
      };
    }

    const promptInput = { url: flowInput.url, content: websiteContent };
    const { output } = await summarizeContentPrompt(promptInput);

    if (!output || !output.summary) { 
      return {
        summary: 'AI failed to generate a summary for the content.',
        toolUsed: true,
      };
    }

    return {
      summary: output.summary,
      toolUsed: true, 
    };
  }
);
