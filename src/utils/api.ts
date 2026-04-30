import type { GenerationStage } from '../types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  _onProgress?: (stage: GenerationStage, progress: number) => void
): Promise<string> {
  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = body?.error?.message || `API error: ${response.status}`;
        lastError = new ApiError(msg, response.status);

        // Only retry on 429 (rate limit) or 5xx (server errors)
        if (response.status === 429 || response.status >= 500) {
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAYS[attempt] || 10000;
            await sleep(delay);
            continue;
          }
        }

        throw lastError;
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network error - retry once
      if (attempt === 0) {
        await sleep(2000);
        continue;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export const SPEC_SYSTEM_PROMPT = `You are an expert SAP functional and technical consultant with 15+ years of experience. You produce detailed, professional Functional Specifications (FS) and Technical Specifications (TS) for SAP development projects.

When generating specifications, follow this exact format:

# FUNCTIONAL SPECIFICATION

## 1. Overview
- Business context and objectives
- Scope of the development

## 2. Business Requirements
- Detailed functional requirements
- Business process flow
- Input/Output specifications

## 3. Functional Design
- Processing logic
- Validation rules
- Error handling requirements
- User interface requirements (if applicable)

## 4. Integration Points
- Interfaces with other SAP modules
- External system integrations
- Data flow diagrams

## 5. Acceptance Criteria
- Test scenarios
- Expected results

---

# TECHNICAL SPECIFICATION

## 1. Technical Overview
- Development objects required
- Technology stack (ABAP, OData, etc.)

## 2. Data Model
- Tables, structures, types
- Field-level specifications
- Database operations (CRUD)

## 3. Program Design
- Class/method design
- Function modules
- BAPI/BADI implementations

## 4. Code Architecture
- Program flow
- Modular design
- Error handling strategy

## 5. Performance Considerations
- Index recommendations
- Buffering strategy
- Query optimization

## 6. Transport & Deployment
- Transport strategy
- Configuration steps
- Post-deployment activities`;

export const ABAP_SYSTEM_PROMPT = `You are a senior SAP ABAP developer with 15+ years of experience. You write clean, optimized, production-ready ABAP code following SAP coding standards and best practices.

When generating ABAP code:
- Use modern ABAP syntax (inline declarations, string templates, etc.)
- Follow SAP naming conventions
- Include proper error handling
- Add meaningful comments
- Use proper modularization (classes, methods, function modules)
- Consider performance (indexed reads, proper WHERE clauses, field lists)
- Include proper authorization checks
- Follow Clean ABAP guidelines

Output the complete, compilable ABAP code.`;

export const SPEC_STAGES: { stage: GenerationStage; label: string; progress: number }[] = [
  { stage: 'analyzing', label: 'Analyzing requirement...', progress: 15 },
  { stage: 'generating-fs', label: 'Generating Functional Specification...', progress: 40 },
  { stage: 'generating-ts', label: 'Generating Technical Specification...', progress: 70 },
  { stage: 'finalizing', label: 'Finalizing output...', progress: 90 },
];

export const ABAP_STAGES: { stage: GenerationStage; label: string; progress: number }[] = [
  { stage: 'understanding', label: 'Understanding specifications...', progress: 15 },
  { stage: 'designing', label: 'Designing logic...', progress: 35 },
  { stage: 'writing', label: 'Writing ABAP code...', progress: 60 },
  { stage: 'optimizing', label: 'Optimizing code...', progress: 80 },
  { stage: 'finalizing', label: 'Finalizing...', progress: 95 },
];

export function runStagedProgress(
  stages: { stage: GenerationStage; label: string; progress: number }[],
  onProgress: (stage: GenerationStage, progress: number, label: string) => void,
  intervalMs = 2000
): { cancel: () => void; complete: () => void } {
  let idx = 0;
  let cancelled = false;

  const advance = () => {
    if (cancelled || idx >= stages.length) return;
    const s = stages[idx];
    onProgress(s.stage, s.progress, s.label);
    idx++;
    if (idx < stages.length) {
      setTimeout(advance, intervalMs);
    }
  };

  advance();

  return {
    cancel: () => { cancelled = true; },
    complete: () => {
      if (!cancelled) {
        onProgress('complete', 100, 'Complete');
      }
    },
  };
}
