import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchWithAuth } from '../services/apiFetch';
import { Order } from '../../../shared/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await fetchWithAuth('/api/orders');
      if (res.ok) {
        const { data } = await res.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          loadOrders(); // Refresh orders on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders, loading, refreshOrders: loadOrders };
};
