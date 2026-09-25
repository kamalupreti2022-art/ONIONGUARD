import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const ROBOFLOW_MODEL_ID = 'chandrajith-j/onions-quality-analysis-1-yolo11n-t1';

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Health check endpoint
  if (event.httpMethod === 'GET') {
    const hasKey = Boolean(
      process.env.ROBOFLOW_API_KEY ||
      process.env.ROBOFLOW_KEY ||
      process.env.ROBOFLOW_APIKEY ||
      process.env.VITE_ROBOFLOW_API_KEY ||
      process.env.API_KEY
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        platform: 'netlify',
        message: 'OnionGuard AI Netlify API is operational',
        roboflowKeyConfigured: hasKey,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    let base64Image = '';
    let clientApiKey = '';

    if (event.body) {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;

      try {
        const parsed = JSON.parse(rawBody);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.image === 'string') {
            base64Image = parsed.image;
          }
          if (typeof parsed.apiKey === 'string') {
            clientApiKey = parsed.apiKey;
          }
        }
      } catch {
        // Fallback if raw base64 or urlencoded
        if (typeof rawBody === 'string') {
          base64Image = rawBody;
        }
      }
    }

    if (!base64Image || base64Image.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'No image data received. Expected JSON body with an "image" base64 property.',
        }),
      };
    }

    // Clean data URL prefix (e.g. data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();

    // Check all possible environment variable names configured in Netlify
    const roboflowKey =
      clientApiKey.trim() ||
      process.env.ROBOFLOW_API_KEY?.trim() ||
      process.env.ROBOFLOW_KEY?.trim() ||
      process.env.ROBOFLOW_APIKEY?.trim() ||
      process.env.VITE_ROBOFLOW_API_KEY?.trim() ||
      process.env.API_KEY?.trim() ||
      '';

    if (!roboflowKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Roboflow API key not found in Netlify environment. Please set ROBOFLOW_API_KEY in your Netlify Site Settings > Environment Variables, or enter it in the app Settings tab.',
        }),
      };
    }

    // Call Roboflow hosted inference API
    const detectUrl = `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${encodeURIComponent(roboflowKey)}`;

    let response = await fetch(detectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: cleanBase64,
    });

    // If detect endpoint had issues, fallback to serverless endpoint
    if (!response.ok && response.status !== 401) {
      const serverlessUrl = `https://serverless.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${encodeURIComponent(roboflowKey)}`;
      const slResponse = await fetch(serverlessUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: cleanBase64,
      });
      if (slResponse.ok) {
        response = slResponse;
      }
    }

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = null;
    }

    if (response.ok && responseData) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseData),
      };
    }

    // If Roboflow returned an error status (e.g., 401 invalid key, 400 bad image)
    const errorDetails =
      responseData?.message ||
      responseData?.error ||
      `Roboflow server returned HTTP ${response.status}`;

    return {
      statusCode: response.status || 502,
      headers,
      body: JSON.stringify({
        error: errorDetails,
        status: response.status,
        details: responseData || responseText.slice(0, 200),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Netlify serverless function execution failed: ' + (error instanceof Error ? error.message : String(error)),
      }),
    };
  }
};
