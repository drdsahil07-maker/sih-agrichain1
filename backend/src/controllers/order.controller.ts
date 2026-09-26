import { Response } from 'express';
import { AuthRequest, getScopedClient, supabaseAnon } from '../middleware/auth';

const VALID_STATUSES = [
  'CREATED', 'CONFIRMED', 'POOLING', 'TRANSPORT_ASSIGNED', 
  'PICKUP_READY', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 
  'COMPLETED', 'CANCELLED'
];

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { 
      pool_id, 
      crop, 
      quantity_kg, 
      agreed_price_per_kg, 
      pickup_location, 
      delivery_location 
    } = req.body;

    // 1. Authenticate user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required to create orders' } 
      });
    }

    // 2. Authorize role: only consumers and distributors can create orders
    if (req.user.role !== 'consumer' && req.user.role !== 'distributor') {
      return res.status(403).json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'Only consumers or distributors can create orders' } 
      });
    }

    // 3. Validate input parameters
    if (!crop || !quantity_kg || !agreed_price_per_kg) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_INPUT', message: 'Missing required fields: crop, quantity_kg, agreed_price_per_kg' } 
      });
    }

    const numQuantity = Number(quantity_kg);
    const numPrice = Number(agreed_price_per_kg);

    if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_INPUT', message: 'Quantity and price must be positive numbers' } 
      });
    }

    // 4. Execute atomic database reservation via PostgreSQL RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order_atomic', {
      p_pool_id: pool_id || null,
      p_crop: crop,
      p_quantity_kg: numQuantity,
      p_agreed_price_per_kg: numPrice,
      p_pickup_location: pickup_location || 'TBD',
      p_delivery_location: delivery_location || 'TBD'
    });

    if (!rpcError && rpcResult) {
      return res.status(201).json({ success: true, data: rpcResult });
    }

    // Handle RPC-level domain errors
    if (rpcError) {
      const errMsg = rpcError.message || '';
      
      if (errMsg.includes('INSUFFICIENT_CAPACITY')) {
        return res.status(409).json({ 
          success: false, 
          error: { code: 'INSUFFICIENT_CAPACITY', message: errMsg } 
        });
      }
      if (errMsg.includes('POOL_NOT_FOUND')) {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'POOL_NOT_FOUND', message: errMsg } 
        });
      }
      if (errMsg.includes('UNAUTHORIZED')) {
        return res.status(403).json({ 
          success: false, 
          error: { code: 'UNAUTHORIZED', message: errMsg } 
        });
      }
      if (errMsg.includes('UNAUTHENTICATED')) {
        return res.status(401).json({ 
          success: false, 
          error: { code: 'UNAUTHENTICATED', message: errMsg } 
        });
      }
      if (errMsg.includes('INVALID_INPUT')) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'INVALID_INPUT', message: errMsg } 
        });
      }

      return res.status(500).json({
        success: false,
        error: { code: rpcError.code || 'DATABASE_ERROR', message: errMsg || 'Failed to create order atomically' }
      });
    }

    return res.status(500).json({ success: false, error: { message: 'Unexpected database response' } });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: { code: 'DATABASE_ERROR', message: error.message || 'Internal server error' } 
    });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { status } = req.body;
    const orderId = req.params.id;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }

    // Get current order to validate transition and auth
    const { data: currentOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('status, buyer_id, transport_trip_id')
      .eq('id', orderId)
      .single();

    if (fetchErr || !currentOrder) {
      return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }

    // Basic lifecycle validation
    // E.g., cannot go back to CREATED if already COMPLETED
    if (currentOrder.status === 'COMPLETED' || currentOrder.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: { message: 'Cannot update status of a completed or cancelled order' } });
    }

    // Transporter restrictions: Transporters can only move through pickup -> transit -> delivery
    if (req.user?.role === 'transporter') {
      const allowedTransporterStatuses = ['PICKUP_READY', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
      if (!allowedTransporterStatuses.includes(status)) {
        return res.status(403).json({ success: false, error: { message: 'Transporter not authorized for this status transition' } });
      }
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Send notifications based on status change
    if (status === 'CONFIRMED') {
        await supabaseAnon.from('notifications').insert({
          user_id: currentOrder.buyer_id,
          type: 'ORDER_CONFIRMED',
          message: `Your order ${orderId.substring(0,8)} has been confirmed.`,
          reference_id: orderId
        });
    } else if (status === 'DELIVERED') {
         await supabaseAnon.from('notifications').insert({
          user_id: currentOrder.buyer_id,
          type: 'ORDER_DELIVERED',
          message: `Your order ${orderId.substring(0,8)} has been delivered.`,
          reference_id: orderId
        });
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
