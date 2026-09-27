import { Response } from 'express';
import { AuthRequest, getScopedClient } from '../middleware/auth';

export const getGovernmentOverview = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);

    // Get active pools count
    const { count: activePools } = await supabase
      .from('pools')
      .select('id', { count: 'exact', head: true })
      .in('status', ['forming', 'ready', 'matched', 'dispatched']);

    // Get active transport trips
    const { count: activeTransports } = await supabase
      .from('transport_trips')
      .select('id', { count: 'exact', head: true })
      .in('status', ['AVAILABLE', 'MATCHED', 'ASSIGNED', 'IN_TRANSIT']);

    // Get users count by role
    const { data: users } = await supabase.from('profiles').select('role');
    const roleCounts = {
      farmer: 0,
      distributor: 0,
      transporter: 0,
      consumer: 0
    };
    if (users) {
      users.forEach(u => {
        if (roleCounts.hasOwnProperty(u.role)) {
          roleCounts[u.role as keyof typeof roleCounts]++;
        }
      });
    }

    // Since we don't have all data yet, we might return some placeholders for non-existent tables
    res.json({
      success: true,
      data: {
        registeredFarmers: roleCounts.farmer,
        activeTransporters: roleCounts.transporter,
        activePools: activePools || 0,
        ordersInTransit: activeTransports || 0,
        // The following are estimations or placeholders since exact tables don't exist yet
        totalQuantityMoved: 'Calculation Pending', 
        averageFarmerNetValue: 'Calculation Pending',
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getSupplyDemand = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    // Simple supply demand aggregation
    const { data: harvests } = await supabase.from('harvests').select('crop, quantity_kg');
    const { data: demands } = await supabase.from('buyer_demands').select('crop, required_quantity_kg');

    const aggregated: Record<string, { supply: number; demand: number }> = {};
    
    if (harvests) {
      harvests.forEach(h => {
        if (!aggregated[h.crop]) aggregated[h.crop] = { supply: 0, demand: 0 };
        aggregated[h.crop].supply += h.quantity_kg || 0;
      });
    }

    if (demands) {
      demands.forEach(d => {
        if (!aggregated[d.crop]) aggregated[d.crop] = { supply: 0, demand: 0 };
        aggregated[d.crop].demand += d.required_quantity_kg || 0;
      });
    }

    const results = Object.keys(aggregated).map(crop => ({
      crop,
      supplyQuantity: aggregated[crop].supply,
      demandQuantity: aggregated[crop].demand,
      gap: aggregated[crop].supply - aggregated[crop].demand
    }));

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getPools = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: pools, error } = await supabase.from('pools').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ success: true, data: pools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getLogistics = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: trips, error } = await supabase.from('transport_trips').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ success: true, data: trips });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getFarmers = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: farmers, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'farmer')
      .order('full_name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: farmers || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getExotelStatus = async (req: AuthRequest, res: Response) => {
  const configured = !!(
    process.env.EXOTEL_ACCOUNT_SID &&
    process.env.EXOTEL_API_KEY &&
    process.env.EXOTEL_API_TOKEN &&
    process.env.EXOTEL_EXOPHONE
  );
  const streamConfigured = !!process.env.EXOTEL_STREAM_URL;

  res.json({
    provider: "Exotel",
    configured,
    streamConfigured
  });
};

export const initiateAdminFarmerCall = async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId } = req.body;
    const user = req.user;

    if (!user || user.role !== 'government_admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only government administrators can trigger outbound farmer alerts.' }
      });
    }

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Farmer ID is required.' }
      });
    }

    const supabase = getScopedClient(req);

    // Fetch the target farmer profile
    const { data: farmer, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', farmerId)
      .eq('role', 'farmer')
      .single();

    if (profileErr || !farmer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farmer profile not found.' }
      });
    }

    const rawPhone = farmer.phone_number || '';
    const cleanPhone = rawPhone.replace(/\s+/g, '');
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PHONE_NUMBER', message: 'This farmer does not have a registered contact number.' }
      });
    }

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

    // Insert call log into database
    const { data: callRecord, error: dbError } = await supabase
      .from('ai_calls')
      .insert({
        user_id: farmer.id,
        phone_number: cleanPhone,
        status: 'initiating',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('[EXOTEL_DB_ERROR]', dbError);
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: dbError.message }
      });
    }

    // Trigger Outbound Exotel Call Contract:
    // POST https://api.exotel.com/v1/Accounts/${sid}/Calls/connect.json
    try {
      const response = await fetch(`https://api.exotel.com/v1/Accounts/${sid}/Calls/connect.json`, {
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
        console.error('[EXOTEL_CARRIER_ERROR]', bodyText);
        await supabase.from('ai_calls').update({ status: 'failed' }).eq('id', callRecord.id);
        return res.status(502).json({
          success: false,
          error: { code: 'EXOTEL_PROVIDER_ERROR', message: 'Exotel voice engine rejected connection. Verify Exotel trial number white-listing or KYC configuration.' }
        });
      }

      // Read response SID
      const xmlMatch = bodyText.match(/<Sid>([^<]+)<\/Sid>/) || bodyText.match(/"Sid":\s*"([^"]+)"/);
      const exotelCallSid = xmlMatch ? xmlMatch[1] : `ex_sid_${Date.now()}`;

      const { data: updatedRecord } = await supabase
        .from('ai_calls')
        .update({
          status: 'ringing',
          summary: `Exotel Connect session initiated. Call SID: ${exotelCallSid}`
        })
        .eq('id', callRecord.id)
        .select()
        .single();

      return res.status(201).json({
        success: true,
        callSid: exotelCallSid,
        call: updatedRecord
      });

    } catch (carrierErr: any) {
      console.error('[EXOTEL_CARRIER_EXCEPTION]', carrierErr);
      await supabase.from('ai_calls').update({ status: 'failed' }).eq('id', callRecord.id);
      return res.status(500).json({
        success: false,
        error: { code: 'CARRIER_TIMEOUT', message: 'Failed to establish route to Exotel carrier server.' }
      });
    }

  } catch (err: any) {
    console.error('[INITIATE_ADMIN_CALL_ERROR]', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};
