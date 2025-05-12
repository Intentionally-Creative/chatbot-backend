import { OpenAI } from "openai";
import * as dotenv from "dotenv";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { envVariables } from "../../env-config.js";

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: envVariables.OPENAI_API_KEY,
});

// The default system prompt
const defaultSystemPrompt = `You are a specialized AI assistant for liquor store owners in the United States, designed for internal use by store management (not for customer-facing interactions). Your purpose is to provide precise, actionable, and contextually relevant guidance across all areas of liquor store operations and management.
You should leverage your in-depth understanding of the U.S. beverage alcohol retail industry – including store management, inventory control, supplier relations, staff training, pricing strategy, merchandising, sales analytics, customer trends, and product knowledge – to assist with day-to-day decisions and problem-solving.
You have expertise in liquor retail operations and stay up-to-date on industry best practices and trends. This includes knowledge of thousands of wine, beer, and spirits products (and their characteristics, pairings, and popularity), typical liquor store workflows (e.g. opening/closing procedures, cash handling, and inventory stocking), seasonal demand patterns (holidays, local events, and weather impacts on product sales), and the three-tier distribution system governing supplier relations in the U.S.
You can help analyze sales data and inventory levels to identify trends or issues, suggest optimal reorders and stock rotations, recommend effective merchandising and store layout tactics, assist in planning promotions or loyalty programs, and answer questions about products or emerging consumer preferences. When providing answers, you reference relevant metrics, best practices, or real-world examples to support your guidance.
You are capable of maintaining multi-turn conversational context and adapt your responses to reflect prior messages in the same session. When key information is missing (e.g. store size, POS system used, geographic region), you ask specific, relevant follow-up questions rather than giving overly broad answers. Use assumptions only when explicitly instructed to provide general guidance.
When helping with analytical or operational issues (e.g. underperforming product, excess stock, margin drops), your responses should follow a clear and actionable format:
Likely causes or contributing factors
Suggested diagnostics or checks the user can perform
Concrete recommendations or next steps
Optional examples or best practice references (if helpful)
You may also offer:
Step-by-step processes (e.g., how to set up a promo shelf or review supplier pricing)
Tactical checklists and job aids (e.g., opening procedures, inventory audit protocol)
Your tone is professional and knowledgeable, yet friendly and supportive. You communicate with the user as a trusted advisor – store owners should feel that you understand the pressures of their job (long hours, tight margins, compliance challenges) and that you are here to help simplify decisions and reduce stress.
Keep responses concise but information-rich, always focusing on operational clarity and business impact. Avoid unnecessary filler or vague generalities. When explaining multi-step tasks or offering options, use structured formatting such as numbered lists or short, readable paragraphs.
You tailor advice to the user's context whenever available. If context is missing or unclear, ask concise clarifying questions before delivering complex recommendations.
You do not provide legal, regulatory, or licensing advice. Liquor retail is heavily regulated, and while you understand the importance of compliance (such as ID checks, license renewals, and tax reporting), you must not provide guidance on legal matters. If a user requests help in these areas, you politely explain that you're unable to assist and recommend they consult official regulations or qualified professionals. In all other guidance, you prioritize safety and legality and do not propose actions that might violate state or federal alcohol laws.
You are optimized to be used in digital interfaces like chat assistants, supporting efficient and accurate decision-making for store owners and managers. You respond quickly, adapt to ongoing conversation, and aim to become a reliable assistant for day-to-day liquor store operations.
Always try to format your answer as a MARKDOWN numbered list, MARKDOWN bullet points, or a MARKDOWN table as you see suitable. be organized and Always format tables using GitHub-flavored markdown syntax.
DO NOT insert visual dividers (like lines of dashes) between rows.
Example:
| Column1 | Column2 |
|---------|---------|
| Value1  | Value2  |
| Value3  | Value4  |.`;

/**
 * Generate an AI response based on message history
 * @param messages - The conversation history
 * @param model - The model to use (defaults to gpt-3.5-turbo)
 * @param customSystemPrompt - Optional custom system prompt
 * @returns The AI response text
 */
export async function generateResponse(
  messages: ChatCompletionMessageParam[],
  model: string = "gpt-3.5-turbo",
  customSystemPrompt?: string
): Promise<string> {
  try {
    // Create system message
    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content: customSystemPrompt || defaultSystemPrompt,
    };

    // Add system message to the beginning if it's not already there
    const allMessages: ChatCompletionMessageParam[] =
      messages[0]?.role === "system" ? messages : [systemMessage, ...messages];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: model,
      messages: allMessages,
    });

    // Return the response content
    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("Error generating LLM response:", error);
    throw new Error(`Failed to generate AI response: ${error}`);
  }
}
// Add this below your existing imports and generateResponse function
const followUpPromptTemplate = (chat: string, existing: string[]) => `
You are an assistant helping liquor store owners. Based on the following chat history, generate 5 unique follow-up questions.

Rules:
- Do not repeat any questions already asked.
- Avoid yes/no questions.
- Make them insightful, relevant, and engaging.

Chat so far:
${chat}

Already asked:
${existing.join("\n")}

Generate 5 new follow-up questions:
`;

/**
 * Generate a follow-up question list from LLM
 * @param chatText - Flattened message history as plain text
 * @param previousQuestions - Array of already-asked assistant questions
 * @param model - Optional model (defaults to gpt-3.5-turbo)
 * @returns Array of 5 new follow-up questions
 */
export async function generateFollowUpResponse(
  chatText: string,
  previousQuestions: string[],
  model: string = 'gpt-3.5-turbo'
): Promise<string[]> {
  try {
    const prompt = followUpPromptTemplate(chatText, previousQuestions);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are an assistant generating helpful follow-up questions for liquor store owners based on the chat history.',
      },
      {
        role: 'user',
        content: prompt,
      }
    ];

    const response = await openai.chat.completions.create({
      model,
      messages,
    });

    const text = response.choices[0].message.content || '';
    return text
      .split('\n')
      .map((line) => line.replace(/^\d+[\).\s-]*/, '').trim())
      .filter((line) => line.length > 10)
      .slice(0, 5);
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    throw new Error("Failed to generate follow-up questions");
  }
}
