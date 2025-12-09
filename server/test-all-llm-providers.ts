import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { CohereClient } from 'cohere-ai';

async function testAllProviders() {
  console.log("=== Complete LLM Provider API Key Test ===\n");
  
  const results: any[] = [];
  
  // Test OpenAI
  console.log("1. Testing OpenAI GPT-4o...");
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Say 'OpenAI works' in 2 words" }],
        max_tokens: 10
      });
      console.log("   ✅ OpenAI: SUCCESS");
      results.push({ provider: "OpenAI", status: "SUCCESS", model: "gpt-4o" });
    } catch (e: any) {
      console.log("   ❌ OpenAI: FAILED - " + e.message?.slice(0,50));
      results.push({ provider: "OpenAI", status: "FAILED" });
    }
  } else {
    console.log("   ⚠️  OpenAI: NOT_CONFIGURED");
    results.push({ provider: "OpenAI", status: "NOT_CONFIGURED" });
  }
  
  // Test Anthropic
  console.log("2. Testing Anthropic Claude...");
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "Say 'Anthropic works' in 2 words" }]
      });
      console.log("   ✅ Anthropic: SUCCESS");
      results.push({ provider: "Anthropic", status: "SUCCESS", model: "claude-sonnet-4" });
    } catch (e: any) {
      console.log("   ❌ Anthropic: FAILED - " + e.message?.slice(0,50));
      results.push({ provider: "Anthropic", status: "FAILED" });
    }
  } else {
    console.log("   ⚠️  Anthropic: NOT_CONFIGURED");
    results.push({ provider: "Anthropic", status: "NOT_CONFIGURED" });
  }
  
  // Test Gemini
  console.log("3. Testing Google Gemini...");
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Say 'Gemini works' in 2 words"
      });
      console.log("   ✅ Gemini: SUCCESS");
      results.push({ provider: "Gemini", status: "SUCCESS", model: "gemini-2.0-flash" });
    } catch (e: any) {
      if (e.message?.includes("429") || e.message?.includes("quota")) {
        console.log("   ⚠️  Gemini: QUOTA_EXCEEDED (API key valid but rate limited)");
        results.push({ provider: "Gemini", status: "QUOTA_EXCEEDED", model: "gemini-2.0-flash" });
      } else {
        console.log("   ❌ Gemini: FAILED - " + e.message?.slice(0,50));
        results.push({ provider: "Gemini", status: "FAILED" });
      }
    }
  } else {
    console.log("   ⚠️  Gemini: NOT_CONFIGURED");
    results.push({ provider: "Gemini", status: "NOT_CONFIGURED" });
  }
  
  // Test Groq
  console.log("4. Testing Groq...");
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Say 'Groq works' in 2 words" }],
        max_tokens: 10
      });
      console.log("   ✅ Groq: SUCCESS");
      results.push({ provider: "Groq", status: "SUCCESS", model: "llama-3.3-70b" });
    } catch (e: any) {
      console.log("   ❌ Groq: FAILED - " + e.message?.slice(0,50));
      results.push({ provider: "Groq", status: "FAILED" });
    }
  } else {
    console.log("   ⚠️  Groq: NOT_CONFIGURED");
    results.push({ provider: "Groq", status: "NOT_CONFIGURED" });
  }
  
  // Test Cohere
  console.log("5. Testing Cohere...");
  if (process.env.COHERE_API_KEY) {
    try {
      const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
      const response = await cohere.chat({
        model: "command-r-plus",
        message: "Say 'Cohere works' in 2 words"
      });
      console.log("   ✅ Cohere: SUCCESS");
      results.push({ provider: "Cohere", status: "SUCCESS", model: "command-r-plus" });
    } catch (e: any) {
      console.log("   ❌ Cohere: FAILED - " + e.message?.slice(0,50));
      results.push({ provider: "Cohere", status: "FAILED" });
    }
  } else {
    console.log("   ⚠️  Cohere: NOT_CONFIGURED");
    results.push({ provider: "Cohere", status: "NOT_CONFIGURED" });
  }
  
  console.log("\n=== Summary ===");
  const successCount = results.filter(r => r.status === "SUCCESS").length;
  const quotaCount = results.filter(r => r.status === "QUOTA_EXCEEDED").length;
  console.log(`✅ ${successCount}/5 providers fully working`);
  if (quotaCount > 0) console.log(`⚠️  ${quotaCount} provider(s) have quota limits`);
  console.log(JSON.stringify(results, null, 2));
}

testAllProviders().catch(console.error);
