import { GoogleGenAI } from "@google/genai";
import { ReportSeverity } from "../types";

const apiKey = process.env.API_KEY;

export const analyzeReportSeverity = async (description: string, category: string): Promise<{ severity: ReportSeverity; reason: string }> => {
  
  if (!apiKey) {
    // Fallback logic if API key is not present (for demo robustness)
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('trap') || lowerDesc.includes('blood') || lowerDesc.includes('fire') || lowerDesc.includes('critical')) {
        return { severity: 'high', reason: 'Keywords detected (fallback mode)' };
    }
    return { severity: 'medium', reason: 'Standard assessment (fallback mode)' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Analyze the following disaster report.
      Category: ${category}
      Description: "${description}"
      
      Determine the severity (low, medium, or high).
      "High" means life-threatening, immediate rescue needed, fire, or severe injury.
      "Medium" means property damage or non-critical injury.
      "Low" means minor inconvenience or observation.

      Return ONLY a JSON object: { "severity": "low" | "medium" | "high", "reason": "short explanation" }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return { 
        severity: (result.severity || 'medium').toLowerCase() as ReportSeverity, 
        reason: result.reason || 'AI Analysis' 
    };

  } catch (error) {
    console.error("AI Analysis failed", error);
    return { severity: 'medium', reason: 'AI unavailable' };
  }
};