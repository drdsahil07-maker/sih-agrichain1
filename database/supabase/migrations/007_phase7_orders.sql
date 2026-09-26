-- Phase 7: Orders and Realtime Lifecycle

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES public.pools(id),
    buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
    crop TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
    agreed_price_per_kg NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    farmer_net_value NUMERIC NOT NULL,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    transport_trip_id UUID REFERENCES public.transport_trips(id),
    status TEXT NOT NULL CHECK (status IN ('CREATED', 'CONFIRMED', 'POOLING', 'TRANSPORT_ASSIGNED', 'PICKUP_READY', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
    expected_delivery_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    changed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Triggers
-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to record status history
CREATE OR REPLACE FUNCTION public.record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by)
        VALUES (
            NEW.id,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
            NEW.status,
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.record_order_status_change();

-- 5. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for orders
CREATE POLICY "Buyers can view their own orders"
ON public.orders FOR SELECT
USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can update their own orders"
ON public.orders FOR UPDATE
USING (buyer_id = auth.uid());

CREATE POLICY "Farmers can view orders linked to their pools"
ON public.orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pool_members pm
        JOIN public.harvests h ON pm.harvest_id = h.id
        WHERE pm.pool_id = orders.pool_id
        AND h.farmer_id = auth.uid()
    )
);

CREATE POLICY "Transporters can view orders assigned to them"
ON public.orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.transport_trips tt
        WHERE tt.id = orders.transport_trip_id
        AND tt.transporter_id = auth.uid()
    )
);

CREATE POLICY "Transporters can update orders assigned to them"
ON public.orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.transport_trips tt
        WHERE tt.id = orders.transport_trip_id
        AND tt.transporter_id = auth.uid()
    )
);

CREATE POLICY "Gov Admin can view all orders"
ON public.orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'government_admin'
    )
);

-- 7. RLS Policies for order_status_history
CREATE POLICY "Users can view history of their orders"
ON public.order_status_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_status_history.order_id
        AND (
            o.buyer_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.pool_members pm
                JOIN public.harvests h ON pm.harvest_id = h.id
                WHERE pm.pool_id = o.pool_id AND h.farmer_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.transport_trips tt
                WHERE tt.id = o.transport_trip_id AND tt.transporter_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role = 'government_admin'
            )
        )
    )
);

-- 8. RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- 9. Realtime Publication
-- We need to ensure supabase_realtime publication includes our new tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Publication might not exist locally, ignore if it fails
        RAISE NOTICE 'Failed to add tables to realtime publication';
END $$;

