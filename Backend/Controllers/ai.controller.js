import * as aiService from "../services/ai.service.js";

export const promptAiController = async (req, res) => {
  try {
    const { prompt, activeFile, fileContent, mode, files, history } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    const result = await aiService.processAiPrompt({
      prompt,
      activeFile,
      fileContent,
      mode,
      files,
      history
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("AI Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process AI prompt"
    });
  }
};
