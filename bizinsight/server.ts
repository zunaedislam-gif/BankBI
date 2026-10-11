import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API route: Generate AI insights
app.post('/api/insights', async (req: Request, res: Response) => {
  try {
    const summaryData = req.body;

    if (!summaryData || !summaryData.kpis) {
      res.status(400).json({ error: 'Missing business summary data in request body.' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not set. Please ensure an API key is attached in Settings > Secrets.',
      });
      return;
    }

    const promptText = `
You are analyzing a business's sales performance report for the executive leadership team.
Here is the structured summary of the currently filtered sales dataset:

Overall Performance KPIs:
- Total Revenue / Sales: $${Number(summaryData.kpis.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Total Net Profit: $${Number(summaryData.kpis.totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Overall Profit Margin: ${summaryData.kpis.profitMargin}%
- Total Orders / Transactions: ${summaryData.kpis.totalOrders}
- Average Order Value (AOV): $${summaryData.kpis.avgOrderValue ? Number(summaryData.kpis.avgOrderValue).toFixed(2) : 'N/A'}

Active View Filters:
- Region: ${summaryData.activeFilters?.region || 'All Regions'}
- Category: ${summaryData.activeFilters?.category || 'All Categories'}

Monthly Sales & Profit Trend (Chronological):
${JSON.stringify(summaryData.monthlySales || [], null, 2)}

Category Breakdown:
${JSON.stringify(summaryData.topCategories || [], null, 2)}

Region Performance Breakdown:
${JSON.stringify(summaryData.topRegions || [], null, 2)}

Top 5 Best-Selling Products:
${JSON.stringify(summaryData.topProducts || [], null, 2)}

Statistical 3-Month Baseline Sales Forecast (calculated via linear regression):
${JSON.stringify(summaryData.forecast || [], null, 2)}

TASK:
1. Provide a crisp 1-2 sentence executive summary of overall financial health and momentum.
2. Provide 4 to 5 concise, high-impact bullet insights in plain English. Reference specific percentages, dollar figures, category drivers, regional standouts, profit margin anomalies, or growth trajectory.
3. Provide exactly 2 strategic, highly actionable recommendations for executive leadership to boost profit margins or scale top revenue channels.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction:
          'You are a senior Business Intelligence advisor and CFO advisor. Provide executive-grade, clear, analytical business insights and strategic recommendations based on the verified sales figures. Avoid generic pleasantries or filler phrases. Return structured JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: '1-2 sentence executive summary of financial health and trajectory.',
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4-5 concise, specific bullet insights in plain English highlighting metrics, trends, and drivers.',
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 2 concrete, strategic recommendations to maximize profitability and revenue.',
            },
          },
          required: ['summary', 'insights', 'recommendations'],
        },
      },
    });

    const responseContent = response.text;
    if (!responseContent) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsedJson = JSON.parse(responseContent);
    res.json(parsedJson);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate insights';
    console.error('Error generating AI insights:', errorMsg);
    res.status(500).json({
      error: `AI Insight generation failed: ${errorMsg}`,
    });
  }
});

// Dev vs Production static handling
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`BizInsight server running on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
