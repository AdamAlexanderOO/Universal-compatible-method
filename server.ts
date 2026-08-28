import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to call Gemini with model fallback and automatic retry for 503 / high-demand errors
async function generateWithFallback(prompt: string, systemInstruction?: string): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: systemInstruction || "You are an advanced futuristic cybernetic AI Core.",
          },
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        const isTransient =
          err?.status === 503 ||
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("UNAVAILABLE") ||
          err?.status === 429 ||
          err?.message?.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 0) {
          // Brief pause before retry
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        // Try next candidate model
        break;
      }
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "operational",
      aiCoreAvailable: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Core Simulation Endpoint
  app.post("/api/simulate", async (req, res) => {
    try {
      const { mode, parameters, context } = req.body;
      const flux = parameters?.fluxFrequency || 65;

      const prompt = `You are the Aurora Machine AI Core & Light-Protocol Simulation Engine.
The user is running a simulation in mode: "${mode || "Quantum Synthesis"}".
Current Deck Telemetry & Parameters:
${JSON.stringify(parameters, null, 2)}
Additional System Context:
${JSON.stringify(context || {}, null, 2)}

Provide a concise, authentic sci-fi simulation response in JSON format with:
- "title": string (crisp cybernetic protocol title)
- "description": string (2 sentences detailing physics/bio-cybernetic results)
- "metrics": object with key metrics (e.g., efficiency, quantumCoherence, entropyIndex, thermalDissipation)
- "recommendation": string (tactical directive for the operator)
- "anomaliesDetected": number
- "events": array of 3 short chronological log entries`;

      let generatedJson: string | null = null;
      try {
        generatedJson = await generateWithFallback(
          prompt,
          "You are the AI Core intelligence embedded within a futuristic Aurora biomechanical deck."
        );
      } catch (e) {
        generatedJson = null;
      }

      if (generatedJson) {
        try {
          const parsed = JSON.parse(generatedJson);
          return res.json({
            status: "simulated_ai",
            simulationId: `SIM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            output: parsed,
          });
        } catch (e) {
          // Fall through to deterministic generator
        }
      }

      // Robust fallback generation if API key is missing or model experiences temporary high demand
      return res.json({
        status: "simulated_local",
        simulationId: `SIM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        output: {
          title: `Aurora ${String(mode || "Quantum").toUpperCase()} Matrix Pulse`,
          description: `Generated stable quantum photon excitation at ${flux.toFixed(1)} GHz. Light-Protocol traces and 36-tooth gear train locked with ${(99.1 + Math.random() * 0.7).toFixed(1)}% efficiency.`,
          metrics: {
            efficiency: `${(flux * 0.94 + 48).toFixed(1)}%`,
            quantumCoherence: `${(0.982 + (Math.random() * 0.015)).toFixed(3)} Φ`,
            entropyIndex: `${(0.010 + Math.random() * 0.005).toFixed(3)} Δe`,
            thermalDissipation: `${Math.round(220 + flux * 0.3)} W/cm²`,
          },
          recommendation: "Increase Nutrient System circulation to dampen harmonic flux resonance.",
          anomaliesDetected: 0,
          events: [
            "Holographic faceted prism synchronized with base gear train.",
            "Light-Protocol routed 4.6 GW photon flux to AI Synaptic matrix.",
            "Shield deflector modulated to 450 THz.",
          ],
        },
      });
    } catch (err: any) {
      console.warn("Simulation fallback handled:", err?.message || err);
      res.json({
        status: "simulated_local",
        simulationId: `SIM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        output: {
          title: "Aurora Core Harmonic Pulse",
          description: "Auxiliary quantum synthesis completed across secondary optical channels.",
          metrics: {
            efficiency: "99.4%",
            quantumCoherence: "0.991 Φ",
            entropyIndex: "0.008 Δe",
            thermalDissipation: "215 W/cm²",
          },
          recommendation: "Maintain stable operating telemetry.",
          anomaliesDetected: 0,
          events: [
            "Subsystem telemetry aligned.",
            "Photon bus operational.",
            "Matrix stabilized.",
          ],
        },
      });
    }
  });

  // Diagnostics & Tactical Analysis Endpoint
  app.post("/api/diagnose", async (req, res) => {
    try {
      const { deckState } = req.body;

      const prompt = `Analyze this live cyber-deck status and generate an authentic diagnostic breakdown:
State:
${JSON.stringify(deckState, null, 2)}

Return JSON with:
- "analysis": string
- "subsystemRatings": object mapping subsystem names to status ratings (e.g., OPTIMAL, STABLE, WARNING)
- "directives": array of strings (tactical operator instructions)`;

      let generatedJson: string | null = null;
      try {
        generatedJson = await generateWithFallback(
          prompt,
          "You are the onboard diagnostic telemetry analyst of the Aurora Machine."
        );
      } catch (e) {
        generatedJson = null;
      }

      if (generatedJson) {
        try {
          const parsed = JSON.parse(generatedJson);
          return res.json({
            status: "diagnostic_ai",
            ...parsed,
          });
        } catch (e) {}
      }

      return res.json({
        status: "diagnostic_nominal",
        analysis: "All subsystems within operational tolerances. Light-Protocol flux optimal across health, shield, and nutrient conduits. Gear train lubrication efficiency at 97.8%.",
        subsystemRatings: {
          lightProtocol: "OPTIMAL",
          gearTrain: "SYNCHRONIZED",
          hologramMesh: "COHERENT",
          nutrientCirculation: "STABLE",
          aiCoreSynapses: "BALANCED",
        },
        directives: [
          "Maintain current flux frequency between 60-80 GHz.",
          "Verify secondary heat-treated alloy seals on node 04.",
        ],
      });
    } catch (err: any) {
      console.warn("Diagnostic fallback handled:", err?.message || err);
      res.json({
        status: "diagnostic_nominal",
        analysis: "Telemetry confirmed within operational bounds.",
        subsystemRatings: {
          lightProtocol: "OPTIMAL",
          gearTrain: "SYNCHRONIZED",
        },
        directives: ["Operational parameters verified."],
      });
    }
  });

  // Light-Protocol Synthesis Endpoint
  app.post("/api/synthesize-light", async (req, res) => {
    try {
      const { lightPreset, wavelengthTHz, powerWatts } = req.body;

      const prompt = `Synthesize a new Light-Protocol based on preset "${lightPreset}", frequency "${wavelengthTHz} THz", and power "${powerWatts} Watts".
Return JSON with:
- "protocolName": string
- "spectralBand": string
- "energyYield": string
- "resonanceColor": hex color string (e.g. #00f0ff or #ff007f or #ffaa00)
- "fluxPathways": array of 3-4 string descriptions of circuit routing
- "summary": string (1-2 sentences on quantum properties)`;

      let generatedJson: string | null = null;
      try {
        generatedJson = await generateWithFallback(
          prompt,
          "You are a quantum photonics engineer synthesizing Light-Protocols."
        );
      } catch (e) {
        generatedJson = null;
      }

      if (generatedJson) {
        try {
          const parsed = JSON.parse(generatedJson);
          return res.json({
            status: "synthesized_ai",
            ...parsed,
          });
        } catch (e) {}
      }

      return res.json({
        status: "synthesized_local",
        protocolName: `${lightPreset || "AURORA"}-HARMONIC-v${Math.floor(Math.random() * 9 + 1)}`,
        spectralBand: `${wavelengthTHz || 540} THz`,
        energyYield: `${((powerWatts || 100) * 1.42).toFixed(1)} MW/s`,
        resonanceColor: "#00f0ff",
        fluxPathways: ["Core -> AI Synapse", "Core -> Nutrient Buffer", "Core -> Shield Grid"],
        summary: "Coherent photon stream stabilized and locked into hardware matrix.",
      });
    } catch (err: any) {
      console.warn("Synthesis fallback handled:", err?.message || err);
      res.json({
        status: "synthesized_local",
        protocolName: "AURORA-HARMONIC-v1",
        spectralBand: "540 THz",
        energyYield: "142.0 MW/s",
        resonanceColor: "#00f0ff",
        fluxPathways: ["Core -> AI Synapse", "Core -> Shield Grid"],
        summary: "Coherent photon stream stabilized.",
      });
    }
  });

  // Static assets serving with CORS headers for seamless Canvas & WebGL texture ingestion
  const serveStaticOptions = {
    setHeaders: (res: express.Response) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      res.set("Cache-Control", "public, max-age=3600");
    },
  };
  app.use("/public", express.static(path.join(process.cwd(), "public"), serveStaticOptions));
  app.use("/assets", express.static(path.join(process.cwd(), "public", "assets"), serveStaticOptions));
  app.use("/images", express.static(path.join(process.cwd(), "public", "images"), serveStaticOptions));
  app.use("/src/assets", express.static(path.join(process.cwd(), "src", "assets"), serveStaticOptions));
  app.use(express.static(path.join(process.cwd(), "public"), serveStaticOptions));

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aurora Cyber-Deck Server running on http://localhost:${PORT}`);
  });
}

startServer();
