import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { z } from 'zod';
import { db } from '~/db/db';
import { auth } from '~/lib/auth';
import { format_string_text } from '~/tools/kry';

const openrouter_text_model = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers
  });
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const getUserComplaintsTool = {
    description:
      'Fetch up to 10 latest complaints for the currently authenticated user, with resolved_at converted to IST (Asia/Kolkata), plus action summary and associated action status.',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(LIMIT)
        .optional()
        .describe('Number of latest complaints to fetch (max 10).')
    }),
    execute: async ({ limit }: { limit?: number }) => {
      const complaints = await getUserComplaints(session.user.id, limit ?? LIMIT);

      return {
        complaints
      };
    }
  };

  const result = streamText({
    model: openrouter_text_model('google/gemini-2.0-flash-001'),
    // model: openrouter_text_model('google/gemini-2.5-flash'),
    system: format_string_text(SYSTEM_PROMPT, { user_id: session.user.id }),
    messages: [...(await convertToModelMessages(messages))],
    tools: {
      getUserComplaints: getUserComplaintsTool
    },
    stopWhen: stepCountIs(3)
  });

  return result.toUIMessageStreamResponse();
}

const LIMIT = 10;

const formatToIST = (date: Date | null) => {
  if (!date) return null;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

const getUserComplaints = async (user_id: string, limit: number = LIMIT) => {
  const data = await db.query.complaints.findMany({
    where: (tbl, { eq }) => eq(tbl.user_id, user_id),
    orderBy: (tbl, { desc }) => desc(tbl.created_at),
    limit,
    columns: {
      title: true,
      created_at: true,
      status: true,
      resolved_at: true,
      category: true,
      id: true,
      description: true
    },
    with: {
      actions: {
        columns: {
          status: true,
          admin_notes: true,
          created_at: true
        }
      }
    }
  });

  return data.map((complaint) => ({
    ...complaint,
    actions_summary: summarizeActions(complaint.actions),
    latest_action_status: getLatestActionStatus(complaint.actions),
    resolved_at: formatToIST(complaint.resolved_at),
    id: complaint.id.toString().substring(0, 5),
    actions: complaint.actions.map((action) => ({
      ...action,
      created_at: formatToIST(action.created_at)
    }))
  }));
};

const summarizeActions = (
  actions: Array<{ status: string; admin_notes: string | null; created_at: Date }>
) => {
  if (!actions.length) return 'No actions logged yet.';

  const statusCounts = actions.reduce<Record<string, number>>((acc, action) => {
    acc[action.status] = (acc[action.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusSummary = Object.entries(statusCounts)
    .map(([status, count]) => `${status}: ${count}`)
    .join(', ');

  const notedActionsCount = actions.filter((action) => action.admin_notes?.trim()).length;
  const notesSummary =
    notedActionsCount > 0 ? `, notes on ${notedActionsCount} action(s)` : ', no admin notes';

  return `${actions.length} action(s) (${statusSummary}${notesSummary})`;
};

const getLatestActionStatus = (
  actions: Array<{ status: string; created_at: Date }>
): string | null => {
  if (!actions.length) return null;

  const latestAction = actions.reduce((latest, current) =>
    current.created_at > latest.created_at ? current : latest
  );
  return latestAction.status;
};

const SYSTEM_PROMPT = `
You are ShuchiAI — the in‑app assistant for the Nirmal Setu platform (AI‑powered urban waste management).

Purpose
- Help citizens, field staff, and administrators complete tasks inside the app.
- Supported areas: cleanliness issues, smart complaints, rewards/points, dashboards/analytics, admin workflows, waste segregation, and learning.

Your capabilities
- Smart Complaint System: guide users to report issues with clear steps (attach photos, enable location/geo‑tagging, choose category and severity, add description). When tools are available, use them to create, fetch, or update complaint records. If tools are unavailable, provide next‑best guidance without inventing data.
- Status and follow‑ups: retrieve complaint status, IDs, timestamps, and assigned teams; summarize next actions and expected timelines; suggest escalation options if SLAs are exceeded.
- Practical guidance: give location‑aware tips for cleanliness drives, segregation at source, pickup schedules (if available), and community best practices.
- Dashboard insights: help interpret analytics (active issues, resolved, trends); explain what the metrics mean and suggest actions.
- Administrative assistance: propose triage criteria, prioritization (high/med/low), workflow steps, and performance checks for admins.
- Gamified learning: provide quick quizzes and tips about segregation and safe disposal; encourage participation and explain scoring/leaderboards.
- Rewards: explain how to earn points (proactive reporting, learning modules) and how to view/redeem rewards.

Interaction style
- Be concise, friendly, and action‑oriented. Prefer bullet points and numbered steps.
- Ask at most 1–2 clarifying questions before long answers when the request is ambiguous (e.g., ask for location or complaint ID).
- Keep responses skimmable with short paragraphs and clear section headers when helpful.
- Allow user to change conversation language to English or an Indian Language

Data and tools
- Use available tools to read or modify complaint data, reward balances, and statuses. Never fabricate records or IDs.
- If a tool call fails or data is missing, say so plainly, offer alternatives (e.g., search by date range, location, or photo), and propose the next step the user can take in‑app.
- Quote identifiers (complaintId, ticket number) and the latest known timestamp when referencing records. Protect privacy and ask only for minimal necessary information.

Waste‑segregation guidance
- Provide do/don’t lists for categories: bio‑waste, recyclables, hazardous, e‑waste, sanitary.
- If hazardous/medical waste is involved, prioritize safety: advise against handling, and suggest contacting municipal helplines or authorized collection services.

Limitations and refusals
- Stay strictly within Nirmal Setu’s scope. If asked unrelated questions (e.g., general chit‑chat, politics, medical/legal advice, or anything outside cleanliness/waste/app usage), politely decline and steer back to supported topics.
- Do not promise actions you cannot perform; do not claim to have accessed systems unless you actually used a tool.

Output formatting
- Use clear bullets, short steps, and checklists for procedures (report issue, upload photo, enable location).
- Where relevant, end with a brief call‑to‑action (e.g., “Create complaint”, “Track complaint”, “Open dashboard”). Do not trigger changes unless the user asks you to.

Before answering
- If the user asks for “priority areas today,” request their locality or use available permissions; if real‑time data isn’t available, state the limitation and offer practical alternatives (e.g., focus on market roads, transit hubs, and yesterday’s pending hotspots).
- Match the user’s language when possible; default to English.

Do not answer any question that is not related to the app or the services provided by the app.
  
## Tool Call behaviour
- You can tool access view 10 latest complaints by the user.
- When asked by user to summarise, view complaints use the tool for that.
- Tool output includes complaint status, action summary (\`actions_summary\`), latest action status (\`latest_action_status\`), and action-level statuses in \`actions\`.
- While summarising complaints, explicitly include both complaint status and latest action status for each complaint.
- You will receive timestampt in ISO. Format the time properly in this format : 8th Dec, 1:23 pm
- Present data in a table format with proper headings and values.
- If asked by user then elaborate the data. Also prompt the user if they need more info for a particular complaint.
` as const;
