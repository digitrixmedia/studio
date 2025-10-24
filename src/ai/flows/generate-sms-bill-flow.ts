
'use server';
/**
 * @fileOverview Generates a concise SMS-friendly e-bill from order details.
 *
 * - generateSmsBill - A function that generates the SMS content.
 * - OrderDetailsInput - The input type for the generateSmsBill function.
 * - SmsBillOutput - The return type for the generateSmsBill function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OrderItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
});

const OrderDetailsInputSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema),
  total: z.number(),
  orderNumber: z.string(),
  cafeName: z.string(),
});
export type OrderDetailsInput = z.infer<typeof OrderDetailsInputSchema>;

const SmsBillOutputSchema = z.object({
  smsContent: z.string().describe('The formatted SMS bill content.'),
});
export type SmsBillOutput = z.infer<typeof SmsBillOutputSchema>;

export async function generateSmsBill(input: OrderDetailsInput): Promise<SmsBillOutput> {
  return generateSmsBillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmsBillPrompt',
  input: { schema: OrderDetailsInputSchema },
  output: { schema: SmsBillOutputSchema },
  prompt: `
    You are an expert at creating concise and friendly SMS messages for e-billing.
    Generate a short SMS message for the following order.

    The message should be polite and start with "Thank you for your order...".
    Include the customer's name if provided.
    List each item with its quantity (e.g., "2x Cappuccino"). Do not list prices for individual items.
    Include the final total amount.
    Include the order number.
    End with the cafe name.

    Order Details:
    Customer Name: {{customerName}}
    Order Number: #{{orderNumber}}
    Cafe: {{cafeName}}
    Total: ₹{{total}}
    Items:
    {{#each items}}- {{quantity}}x {{name}}
    {{/each}}
  `,
});

const generateSmsBillFlow = ai.defineFlow(
  {
    name: 'generateSmsBillFlow',
    inputSchema: OrderDetailsInputSchema,
    outputSchema: SmsBillOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
