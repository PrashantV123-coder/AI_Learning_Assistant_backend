const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions
) => `
You are an AI trained to generate technical interview questions and answers.

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT write markdown.
- Do NOT use triple backticks.
- Do NOT explain anything outside JSON.
- Answers must be plain text.
- Never include code fences.
- Do not include trailing commas in JSON.
- Do not use markdown tables.
- Escape double quotes properly inside strings.

TASK:
- Role: ${role}
- Experience: ${experience} years
- Topics: ${topicsToFocus}
- Generate ${numberOfQuestions} interview questions and answers.
- Keep answers beginner-friendly and concise.

RETURN FORMAT:
[
  {
    "question": "Question here?",
    "answer": "Answer here."
  }
]
`;

const conceptExplainPrompt = (question) => `
You are an AI trained to explain technical interview concepts.

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT write markdown.
- Do NOT use triple backticks.
- Do NOT explain anything outside JSON.
- Do not include trailing commas in JSON.
- Keep explanation beginner-friendly.
- Use plain text only.
- Escape double quotes properly inside strings.
- Never include markdown code blocks.

TASK:
- Explain the following interview question clearly for a beginner developer.
- Question: "${question}"

RETURN FORMAT:
{
  "title": "Short concept title",
  "explanation": "Detailed explanation here"
}
`;

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt,
};