import { describe, it } from "node:test";
import assert from "node:assert";
import {
  processAiPrompt,
  generateFallbackResponse,
  extractCodeBlock,
  extractCodeBlockWithMeta,
  detectTargetFileAndAction,
  categorizeGeminiError,
  getGenAiClient,
  setGenAiClient
} from "../services/ai.service.js";

describe("Fusion AI Code Generation Engine - Test Suite", () => {
  // 1. Mongoose Model Generation
  describe("1. Mongoose Model Generation", () => {
    it("should generate a proper Mongoose user schema and model via fallback", () => {
      const result = generateFallbackResponse({
        prompt: "Generate a user model using Mongoose.",
        activeFile: "app.js"
      });

      assert.strictEqual(result.targetFile, "models/user.model.js");
      assert.strictEqual(result.action, "create");
      assert.strictEqual(result.source, "fallback");
      assert.ok(result.suggestedCode, "Expected suggested code to exist");

      // Verify Mongoose schema specifics
      const code = result.suggestedCode;
      assert.ok(code.includes("mongoose.Schema"), "Expected code to define a Mongoose schema");
      assert.ok(code.includes("email"), "Expected user schema to contain email field");
      assert.ok(code.includes("password"), "Expected user schema to contain password field");
      assert.ok(code.includes("timestamps: true"), "Expected timestamps option to be enabled");
      assert.ok(code.includes("bcrypt"), "Expected bcrypt hashing logic for password");
      assert.ok(code.includes("User"), "Expected User model instantiation and export");

      // Ensure it never returns the old generic handler
      assert.ok(!code.includes("req?.body"), "Should NOT return a generic request-body echo handler");
      assert.ok(!code.includes("export const handler = async (req, res)"), "Should NOT return generic handler signature");
    });

    it("should generate a Mongoose product model when requested", () => {
      const result = generateFallbackResponse({
        prompt: "Generate a product model with price and stock using Mongoose.",
        activeFile: "app.js"
      });

      assert.strictEqual(result.targetFile, "models/product.model.js");
      assert.strictEqual(result.action, "create");
      assert.ok(result.suggestedCode.includes("price"), "Expected price field in product schema");
      assert.ok(result.suggestedCode.includes("stock"), "Expected stock field in product schema");
      assert.ok(result.suggestedCode.includes("Product"), "Expected Product model export");
    });
  });

  // 2. Express Middleware Generation
  describe("2. Express Middleware Generation", () => {
    it("should generate JWT authentication middleware with proper token verification and error handling", () => {
      const result = generateFallbackResponse({
        prompt: "Create a JWT authentication middleware",
        activeFile: "app.js"
      });

      assert.strictEqual(result.targetFile, "middleware/auth.middleware.js");
      assert.strictEqual(result.action, "create");
      assert.ok(result.suggestedCode, "Expected suggested code to exist");

      const code = result.suggestedCode;
      assert.ok(code.includes("jwt.verify"), "Expected jwt.verify for token verification");
      assert.ok(code.includes("req.user"), "Expected user payload attachment to req.user");
      assert.ok(code.includes("next()"), "Expected next() middleware chain continuation");
      assert.ok(code.includes("401"), "Expected 401 Unauthorized status code");
      assert.ok(code.includes("403"), "Expected 403 Forbidden status code");
      assert.ok(!code.includes("req?.body"), "Should NOT return generic body echo");
    });
  });

  // 3. REST API CRUD Generation
  describe("3. REST API Generation", () => {
    it("should generate complete Express CRUD endpoints for products", () => {
      const result = generateFallbackResponse({
        prompt: "Create CRUD APIs for products using Express and MongoDB",
        activeFile: "app.js"
      });

      assert.strictEqual(result.targetFile, "routes/product.route.js");
      assert.strictEqual(result.action, "create");
      assert.ok(result.suggestedCode, "Expected suggested code to exist");

      const code = result.suggestedCode;
      assert.ok(code.includes("Router()"), "Expected Express Router instantiation");
      assert.ok(code.includes("router.get"), "Expected GET route for listing/fetching");
      assert.ok(code.includes("router.post"), "Expected POST route for creation");
      assert.ok(code.includes("router.put"), "Expected PUT route for updating");
      assert.ok(code.includes("router.delete"), "Expected DELETE route for deletion");
      assert.ok(code.includes("201"), "Expected 201 Created status code for creation");
      assert.ok(code.includes("404"), "Expected 404 Not Found handling");
    });
  });

  // 4. Unit Test Generation
  describe("4. Unit-Test Generation", () => {
    it("should generate Vitest assertions targeting the active file", () => {
      const result = generateFallbackResponse({
        prompt: "Write unit tests for this function",
        activeFile: "services/project.service.js",
        mode: "test"
      });

      assert.strictEqual(result.targetFile, "services/project.service.test.js");
      assert.strictEqual(result.action, "create");
      assert.ok(result.suggestedCode, "Expected test code to exist");

      const code = result.suggestedCode;
      assert.ok(code.includes("describe"), "Expected describe test suite");
      assert.ok(code.includes("it("), "Expected it test assertions");
      assert.ok(code.includes("expect"), "Expected expect assertions");
    });
  });

  // 5. Explanation and Debugging Modes
  describe("5. Explanation and Debugging Modes", () => {
    it("should explain active file without suggesting code replacement", () => {
      const result = generateFallbackResponse({
        prompt: "Explain this file",
        activeFile: "server.js",
        fileContent: "const express = require('express');",
        mode: "explain"
      });

      assert.strictEqual(result.targetFile, "server.js");
      assert.strictEqual(result.action, "explain");
      assert.strictEqual(result.suggestedCode, null, "Explanation should not replace code");
      assert.ok(result.reply.includes("server.js"), "Expected reply to mention the file");
    });

    it("should provide resilient patches when debugging errors", () => {
      const result = generateFallbackResponse({
        prompt: "Fix this error: Cannot read properties of undefined",
        activeFile: "utils/helper.js",
        fileContent: "export const compute = (x) => x.val;",
        mode: "debug"
      });

      assert.strictEqual(result.targetFile, "utils/helper.js");
      assert.strictEqual(result.action, "replace");
      assert.ok(result.suggestedCode, "Expected patched code to exist");
    });
  });

  // 6. Gemini API Failure and Fallback Behavior
  describe("6. Gemini API Failure & Fallback Diagnostics", () => {
    it("should correctly categorize authentication errors (401/403)", () => {
      const diag = categorizeGeminiError(new Error("API key not valid. Please pass a valid API key."));
      assert.strictEqual(diag.category, "AUTH_ERROR");
      assert.strictEqual(diag.status, 401);
    });

    it("should correctly categorize model unavailable / 404 errors", () => {
      const diag = categorizeGeminiError({ status: 404, message: "models/gemini-1.5-flash is not found" });
      assert.strictEqual(diag.category, "MODEL_UNAVAILABLE");
      assert.strictEqual(diag.status, 404);
    });

    it("should correctly categorize rate limit / 429 quota errors", () => {
      const diag = categorizeGeminiError({ status: 429, message: "RESOURCE_EXHAUSTED: quota exceeded" });
      assert.strictEqual(diag.category, "QUOTA_EXCEEDED");
      assert.strictEqual(diag.status, 429);
    });

    it("should correctly categorize network failures", () => {
      const diag = categorizeGeminiError(new Error("fetch failed: ECONNREFUSED"));
      assert.strictEqual(diag.category, "NETWORK_ERROR");
      assert.strictEqual(diag.status, 503);
    });
  });

  // 7. Empty or Invalid Prompts
  describe("7. Empty or Invalid Prompts", () => {
    it("should throw an explicit validation error for empty prompts", async () => {
      await assert.rejects(
        async () => {
          await processAiPrompt({ prompt: "" });
        },
        /Prompt cannot be empty/
      );

      await assert.rejects(
        async () => {
          await processAiPrompt({ prompt: "   " });
        },
        /Prompt cannot be empty/
      );
    });
  });

  // 8. Correct Code Extraction and Target-File Selection
  describe("8. Code Extraction & Target File Selection", () => {
    it("should extract code and language metadata correctly", () => {
      const rawText = `Here is the solution:\n\`\`\`javascript\nconst a = 10;\nconsole.log(a);\n\`\`\`\nDone.`;
      const meta = extractCodeBlockWithMeta(rawText);
      assert.strictEqual(meta.lang, "javascript");
      assert.strictEqual(meta.code, "const a = 10;\nconsole.log(a);");

      const simple = extractCodeBlock(rawText);
      assert.strictEqual(simple, "const a = 10;\nconsole.log(a);");
    });

    it("should parse explicit target file headers from AI output", () => {
      const plan = detectTargetFileAndAction({
        prompt: "Create user controller",
        activeFile: "app.js",
        modelText: "### Target File: controllers/user.controller.js\n\n```javascript\nexport const get = () => {};\n```",
        mode: "copilot"
      });

      assert.strictEqual(plan.targetFile, "controllers/user.controller.js");
      assert.strictEqual(plan.action, "create");
    });
  });

  // 9. Prevention of Generic Boilerplate
  describe("9. Prevention of Generic Boilerplate", () => {
    it("should never return an echo handler for arbitrary offline requests", () => {
      const result = generateFallbackResponse({
        prompt: "Build an advanced WebGPU particle simulation shader",
        activeFile: "app.js",
        mode: "copilot"
      });

      assert.strictEqual(result.suggestedCode, null, "Should NOT fabricate a generic echo handler for unsupported tasks");
      assert.strictEqual(result.action, "explain");
      assert.ok(result.reply.includes("Offline"), "Expected honest offline service notification");
    });
  });

  // 10. Deterministic Mocked Gemini Integration & Failure Fallbacks
  describe("10. Deterministic Mocked Gemini Integration & Failure Fallbacks", () => {
    it("should process Mongoose model via mocked Gemini live model", async () => {
      const originalClient = getGenAiClient();

      const mockModel = {
        startChat: () => ({
          sendMessage: async () => ({
            response: {
              text: () => `### Target File: models/user.model.js\n### Action: create\n\n\`\`\`javascript\nimport mongoose from "mongoose";\nconst userSchema = new mongoose.Schema({ email: { type: String, required: true } });\nexport default mongoose.model("User", userSchema);\n\`\`\``
            }
          })
        })
      };

      const mockClient = {
        getGenerativeModel: () => mockModel
      };

      try {
        setGenAiClient(mockClient);
        const result = await processAiPrompt({
          prompt: "Generate a user model using Mongoose.",
          activeFile: "app.js"
        });

        assert.strictEqual(result.source, "gemini");
        assert.strictEqual(result.targetFile, "models/user.model.js");
        assert.strictEqual(result.action, "create");
        assert.ok(result.suggestedCode.includes("mongoose.Schema"), "Expected Mongoose schema code");
      } finally {
        setGenAiClient(originalClient);
      }
    });

    it("should process Express middleware via mocked Gemini live model", async () => {
      const originalClient = getGenAiClient();

      const mockModel = {
        startChat: () => ({
          sendMessage: async () => ({
            response: {
              text: () => `### Target File: middleware/auth.middleware.js\n### Action: create\n\n\`\`\`javascript\nimport jwt from "jsonwebtoken";\nexport const authUser = (req, res, next) => { next(); };\n\`\`\``
            }
          })
        })
      };

      const mockClient = {
        getGenerativeModel: () => mockModel
      };

      try {
        setGenAiClient(mockClient);
        const result = await processAiPrompt({
          prompt: "Create a JWT authentication middleware",
          activeFile: "app.js"
        });

        assert.strictEqual(result.source, "gemini");
        assert.strictEqual(result.targetFile, "middleware/auth.middleware.js");
        assert.strictEqual(result.action, "create");
        assert.ok(result.suggestedCode.includes("jsonwebtoken"), "Expected JWT middleware code");
      } finally {
        setGenAiClient(originalClient);
      }
    });

    it("should safely fall back to task-specific implementation when Gemini throws quota error", async () => {
      const originalClient = getGenAiClient();

      const failingMockClient = {
        getGenerativeModel: () => {
          const err = new Error("RESOURCE_EXHAUSTED: Quota exceeded for quota metric");
          err.status = 429;
          throw err;
        }
      };

      try {
        setGenAiClient(failingMockClient);
        const result = await processAiPrompt({
          prompt: "Generate a user model using Mongoose.",
          activeFile: "app.js"
        });

        assert.strictEqual(result.source, "fallback");
        assert.strictEqual(result.targetFile, "models/user.model.js");
        assert.strictEqual(result.action, "create");
        assert.strictEqual(result.errorDetails?.category, "QUOTA_EXCEEDED");
        assert.ok(result.suggestedCode.includes("mongoose.Schema"), "Expected valid fallback Mongoose schema");
      } finally {
        setGenAiClient(originalClient);
      }
    });

    it("should safely fall back when Gemini throws model not found (404) error", async () => {
      const originalClient = getGenAiClient();

      const failingMockClient = {
        getGenerativeModel: () => {
          const err = new Error("models/deprecated-model is not found");
          err.status = 404;
          throw err;
        }
      };

      try {
        setGenAiClient(failingMockClient);
        const result = await processAiPrompt({
          prompt: "Create a JWT authentication middleware",
          activeFile: "app.js"
        });

        assert.strictEqual(result.source, "fallback");
        assert.strictEqual(result.targetFile, "middleware/auth.middleware.js");
        assert.strictEqual(result.action, "create");
        assert.strictEqual(result.errorDetails?.category, "MODEL_UNAVAILABLE");
        assert.ok(result.suggestedCode.includes("jwt.verify"), "Expected valid fallback JWT middleware");
      } finally {
        setGenAiClient(originalClient);
      }
    });
  });
});
