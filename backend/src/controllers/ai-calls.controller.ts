import { Response } from 'express';
import { AuthRequest, getScopedClient } from '../middleware/auth';

export const initiateAiCall = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be authenticated to start a call.' }
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Phone number is required.' }
      });
    }

    // Phone number format validation
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PHONE_FORMAT', message: 'Invalid phone number format. Please provide a valid country code (e.g., +91).' }
      });
    }

    // Exotel environment settings only (securely kept on server-side)
    const sid = process.env.EXOTEL_ACCOUNT_SID;
    const apiKey = process.env.EXOTEL_API_KEY;
    const apiToken = process.env.EXOTEL_API_TOKEN;
    const exoPhone = process.env.EXOTEL_EXOPHONE;
    const streamUrl = process.env.EXOTEL_STREAM_URL || `wss://${req.get('host')}/api/exotel-stream`;

    const isConfigured = !!(sid && apiKey && apiToken && exoPhone);

    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        code: 'EXOTEL_NOT_CONFIGURED',
        message: 'Real AI calling is not configured. Please define EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY, EXOTEL_API_TOKEN, and EXOTEL_EXOPHONE in your environment settings.'
      });
    }

    const client = getScopedClient(req);

    // Insert database record to public.ai_calls with status "initiating"
    const { data: callRecord, error: dbError } = await client
      .from('ai_calls')
      .insert({
        user_id: user.id,
        phone_number: cleanPhone,
        status: 'initiating',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('[DB_EXOTEL_INIT_ERROR]', dbError);
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: dbError.message }
      });
    }

    // Call real Exotel connect outbound Voice AI API
    try {
      const response = await fetch(`https://api.in.exotel.com/v1/Accounts/${sid}/Calls/connect.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${apiToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: cleanPhone,
          CallerId: exoPhone,
          StreamUrl: `${streamUrl}?callId=${callRecord.id}`,
          StreamType: 'bidirectional',
          StatusCallback: process.env.EXOTEL_STATUS_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/admin/farmer-calls/status-callback`
        })
      });

      const bodyText = await response.text();

      if (!response.ok) {
        console.error('[EXOTEL_CONNECT_PROVIDER_REJECTED]', bodyText);
        await client.from('ai_calls').update({ status: 'failed' }).eq('id', callRecord.id);
        
        let reason = 'EXOTEL_PROVIDER_ERROR';
        if (bodyText.includes('Authentication Failed') || response.status === 401) {
          reason = 'EXOTEL_AUTH_FAILED';
        } else if (bodyText.includes('KYC') || bodyText.includes('Whitelisted')) {
          reason = 'EXOTEL_KYC_REQUIRED';
        }

        return res.status(502).json({
          success: false,
          error: { code: reason, message: 'Exotel outbound carrier refused the connection.' }
        });
      }

      // Read real Exotel SID
      const xmlMatch = bodyText.match(/<Sid>([^<]+)<\/Sid>/) || bodyText.match(/"Sid":\s*"([^"]+)"/);
      const exotelCallSid = xmlMatch ? xmlMatch[1] : `ex_sid_${Date.now()}`;

      // Update call status to ringing
      const { data: updatedRecord } = await client
        .from('ai_calls')
        .update({
          status: 'ringing',
          summary: `Exotel Voice session active. Exotel Call SID: ${exotelCallSid}`
        })
        .eq('id', callRecord.id)
        .select()
        .single();

      return res.status(201).json({
        success: true,
        provider: 'exotel',
        callSid: exotelCallSid,
        status: 'ringing',
        call: updatedRecord
      });

    } catch (carrierErr: any) {
      console.error('[EXOTEL_CARRIER_CONNECT_EXCEPTION]', carrierErr);
      await client.from('ai_calls').update({ status: 'failed' }).eq('id', callRecord.id);
      return res.status(500).json({
        success: false,
        error: { code: 'EXOTEL_PROVIDER_ERROR', message: 'Failed to establish connection to Exotel trunk.' }
      });
    }

  } catch (err: any) {
    console.error('[EXOTEL_AI_CALLS_CRITICAL_FAILURE]', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};

export const getAiCallDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
      });
    }

    const client = getScopedClient(req);
    const { data: call, error } = await client
      .from('ai_calls')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !call) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Call record not found.' }
      });
    }

    return res.json({
      success: true,
      call
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};
