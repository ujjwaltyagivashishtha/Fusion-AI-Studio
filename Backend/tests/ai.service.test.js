import { describe, it } from "node:test";
import assert from "node:assert";
import {
  processAiPrompt,
  generateFallbackResponse,
  extractCodeBlock,
  extractCodeBlockWithMeta,
  detectTargetFileAndAction,
  detectIntent,
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

  // 11. Regression Tests: Intent-Aware Routing & Failing Prompts Verification
  describe("11. Regression Tests: Intent-Aware Routing & Failing Prompts", () => {
    it("should correctly classify prompt intents for all requested categories", () => {
      // Conceptual
      assert.strictEqual(detectIntent("What is Mongoose?"), "CONCEPTUAL");
      assert.strictEqual(detectIntent("What is MongoDB?"), "CONCEPTUAL");
      assert.strictEqual(detectIntent("How does JWT work?"), "CONCEPTUAL");
      assert.strictEqual(detectIntent("Difference between SQL and NoSQL"), "CONCEPTUAL");

      // Code Generation
      assert.strictEqual(detectIntent("Give me user model code using Mongoose."), "CODE_GENERATION");
      assert.strictEqual(detectIntent("Create a Mongoose user model."), "CODE_GENERATION");
      assert.strictEqual(detectIntent("Generate a product model using Mongoose."), "CODE_GENERATION");
      assert.strictEqual(detectIntent("Create JWT authentication middleware"), "CODE_GENERATION");

      // Code Explanation
      assert.strictEqual(detectIntent("Explain this schema"), "CODE_EXPLANATION");
      assert.strictEqual(detectIntent("explain the schema"), "CODE_EXPLANATION");
      assert.strictEqual(detectIntent("what does this file do"), "CODE_EXPLANATION");

      // Debugging
      assert.strictEqual(detectIntent("Fix this validation error"), "DEBUGGING");
      assert.strictEqual(detectIntent("Fix this Mongoose validation error"), "DEBUGGING");
      assert.strictEqual(detectIntent("Debug this syntax error"), "DEBUGGING");

      // Refactoring
      assert.strictEqual(detectIntent("Refactor this function for performance"), "REFACTORING");
      assert.strictEqual(detectIntent("Optimize this database query"), "REFACTORING");

      // Test Generation
      assert.strictEqual(detectIntent("Write unit tests for user service"), "TEST_GENERATION");
      assert.strictEqual(detectIntent("Create test suite using vitest"), "TEST_GENERATION");

      // Conversation
      assert.strictEqual(detectIntent("Hello"), "CONVERSATION");
      assert.strictEqual(detectIntent("Good morning!"), "CONVERSATION");
    });

    // Prompt A: "What is Mongoose?"
    it("Prompt A: 'What is Mongoose?' must return an educational explanation without modifying workspace files", async () => {
      // 1. Fallback verification
      const fallbackResult = generateFallbackResponse({
        prompt: "What is Mongoose?",
        activeFile: "app.js"
      });

      assert.strictEqual(fallbackResult.suggestedCode, null, "Conceptual question must NOT produce suggestedCode file changes");
      assert.strictEqual(fallbackResult.targetFile, null, "Conceptual question must have null targetFile");
      assert.strictEqual(fallbackResult.action, "explain", "Action must be 'explain'");
      assert.ok(fallbackResult.reply.includes("Object Data Modeling"), "Expected ODM explanation");
      assert.ok(fallbackResult.reply.includes("MongoDB"), "Expected explanation to discuss MongoDB integration");
      assert.ok(fallbackResult.reply.includes("Schema"), "Expected explanation to discuss Schemas");
      assert.ok(!fallbackResult.reply.includes("req?.body"), "Should NOT contain generic req.body echo");
      assert.ok(!fallbackResult.reply.includes("export const handler"), "Should NOT contain generic handler boilerplate");

      // 2. Mocked Gemini live verification
      const originalClient = getGenAiClient();
      const mockModel = {
        startChat: () => ({
          sendMessage: async () => ({
            response: {
              text: () => `Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.\n\n\`\`\`javascript\nconst schema = new mongoose.Schema({ name: String });\n\`\`\``
            }
          })
        })
      };

      try {
        setGenAiClient({ getGenerativeModel: () => mockModel });
        const liveResult = await processAiPrompt({
          prompt: "What is Mongoose?",
          activeFile: "app.js"
        });

        assert.strictEqual(liveResult.source, "gemini");
        assert.strictEqual(liveResult.suggestedCode, null, "Live conceptual answer must not extract illustrative snippet as suggestedCode");
        assert.strictEqual(liveResult.targetFile, null, "Live conceptual answer must have targetFile: null");
        assert.strictEqual(liveResult.action, "explain");
      } finally {
        setGenAiClient(originalClient);
      }
    });

    // Prompt B: "Give me user model code using Mongoose."
    it("Prompt B: 'Give me user model code using Mongoose.' must return task-specific model and schema code", async () => {
      // 1. Fallback verification
      const fallbackResult = generateFallbackResponse({
        prompt: "Give me user model code using Mongoose.",
        activeFile: "app.js"
      });

      assert.strictEqual(fallbackResult.targetFile, "models/user.model.js");
      assert.strictEqual(fallbackResult.action, "create");
      assert.ok(fallbackResult.suggestedCode, "Expected code implementation");
      assert.ok(fallbackResult.suggestedCode.includes("mongoose.Schema"), "Expected Mongoose schema");
      assert.ok(fallbackResult.suggestedCode.includes("email"), "Expected email field");
      assert.ok(fallbackResult.suggestedCode.includes("password"), "Expected password field");
      assert.ok(fallbackResult.suggestedCode.includes("bcrypt"), "Expected bcrypt password hashing logic");
      assert.ok(fallbackResult.suggestedCode.includes("comparePassword"), "Expected password comparison method");
      assert.ok(!fallbackResult.suggestedCode.includes("req?.body"), "Should NOT contain generic body echo");

      // 2. Mocked Gemini live verification
      const originalClient = getGenAiClient();
      const mockModel = {
        startChat: () => ({
          sendMessage: async () => ({
            response: {
              text: () => `### Target File: models/user.model.js\n### Action: create\n\n\`\`\`javascript\nimport mongoose from "mongoose";\nconst userSchema = new mongoose.Schema({ email: String });\nexport default mongoose.model("User", userSchema);\n\`\`\``
            }
          })
        })
      };

      try {
        setGenAiClient({ getGenerativeModel: () => mockModel });
        const liveResult = await processAiPrompt({
          prompt: "Give me user model code using Mongoose.",
          activeFile: "app.js"
        });

        assert.strictEqual(liveResult.source, "gemini");
        assert.strictEqual(liveResult.targetFile, "models/user.model.js");
        assert.strictEqual(liveResult.action, "create");
        assert.ok(liveResult.suggestedCode.includes("mongoose.Schema"));
      } finally {
        setGenAiClient(originalClient);
      }
    });

    // Prompt C: "Explain this schema"
    it("Prompt C: 'Explain this schema' must provide educational explanation targeting the active file without suggesting file modifications", async () => {
      const fallbackResult = generateFallbackResponse({
        prompt: "Explain this schema",
        activeFile: "models/user.model.js",
        fileContent: "const userSchema = new mongoose.Schema({ email: String });"
      });

      assert.strictEqual(fallbackResult.action, "explain");
      assert.strictEqual(fallbackResult.targetFile, "models/user.model.js");
      assert.strictEqual(fallbackResult.suggestedCode, null, "Code explanation must not provide replacement code");
      assert.ok(fallbackResult.reply.includes("models/user.model.js"), "Expected reply to reference target schema file");
    });

    // Prompt D: "Fix this validation error"
    it("Prompt D: 'Fix this validation error' must return a dedicated Mongoose error handler without generic boilerplate", async () => {
      const fallbackResult = generateFallbackResponse({
        prompt: "Fix this validation error",
        activeFile: "app.js"
      });

      assert.strictEqual(fallbackResult.targetFile, "middleware/error.middleware.js");
      assert.strictEqual(fallbackResult.action, "create");
      assert.ok(fallbackResult.suggestedCode, "Expected error handler code");
      assert.ok(fallbackResult.suggestedCode.includes("ValidationError"), "Expected ValidationError handling");
      assert.ok(fallbackResult.suggestedCode.includes("CastError"), "Expected CastError handling");
      assert.ok(fallbackResult.suggestedCode.includes("11000"), "Expected duplicate key handling");
      assert.ok(!fallbackResult.suggestedCode.includes("req?.body"), "Should NOT contain generic req.body echo");
    });

    // Gemini Failure Behavior
    it("Gemini failure on 'What is Mongoose?' must still safely return Mongoose explanation instead of generic boilerplate", async () => {
      const originalClient = getGenAiClient();
      const failingMockClient = {
        getGenerativeModel: () => {
          const err = new Error("RESOURCE_EXHAUSTED: Quota exceeded");
          err.status = 429;
          throw err;
        }
      };

      try {
        setGenAiClient(failingMockClient);
        const result = await processAiPrompt({
          prompt: "What is Mongoose?",
          activeFile: "app.js"
        });

        assert.strictEqual(result.source, "fallback");
        assert.strictEqual(result.suggestedCode, null);
        assert.strictEqual(result.targetFile, null);
        assert.strictEqual(result.action, "explain");
        assert.strictEqual(result.errorDetails?.category, "QUOTA_EXCEEDED");
        assert.ok(result.reply.includes("Object Data Modeling"));
        assert.ok(!result.reply.includes("req?.body"));
      } finally {
        setGenAiClient(originalClient);
      }
    });
  });

  // 12. Express Server & Multi-Language Generation
  describe("12. Express Server & Multi-Language Generation", () => {
    it("should generate a complete Express server with health check and middleware for 'create a express server'", () => {
      const result = generateFallbackResponse({
        prompt: "create a express server",
        activeFile: "app.js"
      });

      assert.strictEqual(result.targetFile, "app.js");
      assert.strictEqual(result.action, "create");
      assert.ok(result.suggestedCode, "Expected Express server code");
      assert.ok(result.suggestedCode.includes("express()"), "Expected express() initialization");
      assert.ok(result.suggestedCode.includes("/health"), "Expected /health endpoint");
      assert.ok(result.suggestedCode.includes("app.listen"), "Expected server listener");
      assert.ok(result.suggestedCode.includes("PORT"), "Expected port configuration");
    });

    it("should resolve target files for multi-language requests (Python, Java, C++, SQL)", () => {
      const pyPlan = detectTargetFileAndAction({ prompt: "Write a python script to process images", activeFile: "app.js" });
      assert.strictEqual(pyPlan.targetFile, "main.py");

      const javaPlan = detectTargetFileAndAction({ prompt: "Create a Java class for user service", activeFile: "app.js" });
      assert.strictEqual(javaPlan.targetFile, "App.java");

      const sqlPlan = detectTargetFileAndAction({ prompt: "Create a SQL schema for orders", activeFile: "app.js" });
      assert.strictEqual(sqlPlan.targetFile, "schema.sql");

      const cppPlan = detectTargetFileAndAction({ prompt: "Write a C++ program for matrix multiplication", activeFile: "app.js" });
      assert.strictEqual(cppPlan.targetFile, "main.cpp");
    });
  });

  // 13. Structured Error Reporting & Fallback Diagnostic Integrity
  describe("13. Structured Error Reporting & Diagnostics", () => {
    it("should return isError: true and retain retryPrompt when offline without false success", () => {
      const result = generateFallbackResponse({
        prompt: "arbitrary unrecognized custom calculation algorithm",
        activeFile: "app.js",
        errorInfo: { category: "AUTH_ERROR", safeMessage: "Invalid API key in .env", status: 401 }
      });

      assert.strictEqual(result.isError, true);
      assert.strictEqual(result.retryPrompt, "arbitrary unrecognized custom calculation algorithm");
      assert.strictEqual(result.suggestedCode, null);
      assert.strictEqual(result.source, "fallback");
      assert.ok(result.reply.includes("Live AI Service Offline"));
      assert.ok(result.reply.includes("Invalid API key in .env"));
    });
  });
});

