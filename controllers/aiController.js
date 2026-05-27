const Groq = require("groq-sdk");

const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require("../utils/prompts");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ==============================
// SAFE JSON PARSER
// ==============================
const parseAIResponse = (rawText) => {
  const cleanedText = rawText
    .replace(/^```json\s*/, "")
    .replace(/```$/, "")
    .trim();

  const jsonMatch =
    cleanedText.match(/\[[\s\S]*\]/) || cleanedText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No valid JSON found");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    // fallback cleanup
    const fixedJson = jsonMatch[0]
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\t/g, " ")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    return JSON.parse(fixedJson);
  }
};

// ==============================
// GENERATE INTERVIEW QUESTIONS
// ==============================

// @desc Generate Interview Questions
// @route POST /api/ai/generate-questions
// @access Private
const generateInterviewQuestions = async (req, res) => {
  try {

    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (
      !role?.trim() ||
      experience === undefined ||
      experience === null ||
      isNaN(Number(experience)) ||
      !topicsToFocus?.trim() ||
      !numberOfQuestions
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions,
    );

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    if (!rawText) {
      return res.status(500).json({
        message: "Empty AI response",
      });
    }

    let data;

    try {
      data = parseAIResponse(rawText);
    } catch (err) {
      console.error("========== RAW AI RESPONSE ==========");
      console.error(rawText);
      console.error("=====================================");

      return res.status(500).json({
        message: "AI returned invalid JSON",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("GROQ ERROR:", error);

    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// ==============================
// GENERATE CONCEPT EXPLANATION
// ==============================

// @desc Generate Concept Explanation
// @route POST /api/ai/generate-explanation
// @access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const prompt = conceptExplainPrompt(question);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.5,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    if (!rawText) {
      return res.status(500).json({
        message: "Empty AI response",
      });
    }

    let data;

    try {
      data = parseAIResponse(rawText);
    } catch (err) {
      console.error("========== RAW AI RESPONSE ==========");
      console.error(rawText);
      console.error("=====================================");

      return res.status(500).json({
        message: "AI returned invalid JSON format",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("GROQ ERROR:", error);

    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
};
