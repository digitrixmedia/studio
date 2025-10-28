
'use server';
/**
 * @fileOverview Extracts menu items from a document (PDF, Excel).
 *
 * - extractMenuItems - A function that handles the menu extraction process.
 * - MenuDocumentInput - The input type for the extractMenuItems function.
 * - MenuItemsOutput - The return type for the extractMenuItems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { MenuItem, MenuItemVariation } from '@/lib/types';

const MenuDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A menu document (e.g., PDF, CSV, DOCX), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MenuDocumentInput = z.infer<typeof MenuDocumentInputSchema>;

const ExtractedVariationSchema = z.object({
  name: z.string().describe("The name of the variation (e.g., 'Large', 'Small')."),
  priceModifier: z.number().describe("The additional price for this variation."),
});

const ExtractedMenuItemSchema = z.object({
  name: z.string().describe("The name of the menu item."),
  price: z.number().describe("The base price of the item."),
  category: z.string().describe("The category this item belongs to (e.g., 'Hot Coffee', 'Sandwiches')."),
  description: z.string().optional().describe("A brief description of the item."),
  variations: z.array(ExtractedVariationSchema).optional().describe("An array of different sizes or options for the item."),
});

const MenuItemsOutputSchema = z.object({
  items: z.array(ExtractedMenuItemSchema),
});
export type MenuItemsOutput = z.infer<typeof MenuItemsOutputSchema>;

export async function extractMenuItems(input: MenuDocumentInput): Promise<MenuItemsOutput> {
  return extractMenuItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMenuItemsPrompt',
  input: { schema: MenuDocumentInputSchema },
  output: { schema: MenuItemsOutputSchema },
  prompt: `
    You are an expert data extraction AI. Your task is to analyze the provided document and extract all menu items into a structured JSON format.

    The document contains a restaurant or cafe menu. Carefully parse it to identify each item's name, price, description, and category.

    - **name**: The exact name of the item.
    - **price**: The price of the item. This should be a number.
    - **category**: The section of the menu where the item is listed (e.g., "Appetizers", "Main Courses", "Desserts"). If an item is under a heading, that heading is its category.
    - **description**: Any descriptive text accompanying the item.
    - **variations**: If an item has different sizes or options with different prices (e.g., Small/Large, 8oz/12oz), extract them as variations. The 'priceModifier' should be the *additional* cost compared to the base price. If a variation has a full price listed, calculate the difference from the base item's price.

    Pay close attention to the structure and formatting of the menu to correctly associate prices, descriptions, and variations with their respective items.

    Document to analyze:
    {{media url=documentDataUri}}
  `,
});

const extractMenuItemsFlow = ai.defineFlow(
  {
    name: 'extractMenuItemsFlow',
    inputSchema: MenuDocumentInputSchema,
    outputSchema: MenuItemsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
