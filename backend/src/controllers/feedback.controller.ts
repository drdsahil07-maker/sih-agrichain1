import { Response } from 'express';
import { AuthRequest, getScopedClient } from '../middleware/auth';

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { category, message, rating, page_context } = req.body;
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be authenticated to submit feedback.' }
      });
    }

    if (!category || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Category and message are required.' }
      });
    }

    const client = getScopedClient(req);

    const { data, error } = await client
      .from('user_feedback')
      .insert({
        user_id: user.id,
        role: user.role,
        category,
        message,
        rating: rating ? parseInt(rating, 10) : null,
        page_context: page_context || null
      })
      .select()
      .single();

    if (error) {
      console.error('[FEEDBACK_DB_ERROR]', error);
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: error.message }
      });
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('[FEEDBACK_SERVER_ERROR]', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

export const getFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
      });
    }

    const client = getScopedClient(req);
    let query = client.from('user_feedback').select('*');

    if (user.role !== 'government_admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[FEEDBACK_GET_ERROR]', error);
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: error.message }
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('[FEEDBACK_GET_SERVER_ERROR]', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};
