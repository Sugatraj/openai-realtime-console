// server.local.js - Local development only
import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
app.use(express.text());
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Don't exit if API key is missing - just warn
if (!apiKey) {
  console.warn("⚠️ OPENAI_API_KEY is missing. Create .env with your API key.");
} else {
  console.log("🔑 API Key loaded:", apiKey.substring(0, 10) + "...");
}

// CORS for local development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Configure Vite middleware
let vite;
try {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
  console.log("✅ Vite middleware configured");
} catch (error) {
  console.error("❌ Vite setup failed:", error.message);
  process.exit(1);
}

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime",
    audio: {
      output: {
        voice: "marin",
      },
    },
  },
});

// Health check (always works)
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: "local-development",
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString() 
  });
});

// Token endpoint
app.get("/token", async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is missing",
      hint: "Add your API key to .env file"
    });
  }
  
  try {
    console.log("🔑 Generating ephemeral token...");
    
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: sessionConfig,
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Token generated successfully");
    res.json(data);
    
  } catch (error) {
    console.error("❌ Token generation failed:", error.message);
    res.status(500).json({ 
      error: "Failed to generate token", 
      details: error.message 
    });
  }
});

// Session endpoint
app.post("/session", async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is missing",
      hint: "Add your API key to .env file"
    });
  }
  
  try {
    console.log("🎯 Setting up WebRTC session...");
    
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        "OpenAI-Beta": "realtime=v1",
        Authorization: `Bearer ${apiKey}`,
      },
      body: fd,
    });

    if (!r.ok) {
      throw new Error(`OpenAI API error: ${r.status} ${r.statusText}`);
    }

    const sdp = await r.text();
    console.log("✅ WebRTC session established");
    res.send(sdp);
    
  } catch (error) {
    console.error("❌ Session setup failed:", error.message);
    res.status(500).json({ 
      error: "Failed to setup session", 
      details: error.message 
    });
  }
});

// Serve React app
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;
  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8")
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    console.error("❌ React rendering failed:", e.message);
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`🚀 Local server running on http://localhost:${port}`);
  console.log(`🌍 Environment: local-development`);
  console.log(`📱 Open: http://localhost:${port}`);
});
