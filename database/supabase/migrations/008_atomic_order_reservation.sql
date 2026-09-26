-- Migration: 008_atomic_order_reservation.sql
-- True Database-Level Atomic Pool Reservation using PostgreSQL Transaction & Row Locking

CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_pool_id UUID,
    p_crop TEXT,
    p_quantity_kg NUMERIC,
    p_agreed_price_per_kg NUMERIC,
    p_pickup_location TEXT DEFAULT 'TBD',
    p_delivery_location TEXT DEFAULT 'TBD'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_buyer_id UUID;
    v_buyer_role TEXT;
    v_pool RECORD;
    v_ordered_quantity NUMERIC;
    v_available_quantity NUMERIC;
    v_total_amount NUMERIC;
    v_service_cost NUMERIC;
    v_transport_cost NUMERIC;
    v_expected_loss NUMERIC;
    v_farmer_net_value NUMERIC;
    v_new_order RECORD;
BEGIN
    -- 1. Authenticate caller
    v_buyer_id := auth.uid();
    IF v_buyer_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Caller must be authenticated';
    END IF;

    -- 2. Validate caller role (consumer or distributor only)
    SELECT role INTO v_buyer_role FROM public.profiles WHERE id = v_buyer_id;
    IF v_buyer_role NOT IN ('consumer', 'distributor') THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only consumers or distributors can create orders (current role: %)', v_buyer_role;
    END IF;

    -- 3. Validate input parameters
    IF p_quantity_kg IS NULL OR p_quantity_kg <= 0 THEN
        RAISE EXCEPTION 'INVALID_INPUT: Quantity must be greater than zero';
    END IF;

    IF p_agreed_price_per_kg IS NULL OR p_agreed_price_per_kg <= 0 THEN
        RAISE EXCEPTION 'INVALID_INPUT: Agreed price per kg must be greater than zero';
    END IF;

    IF p_crop IS NULL OR trim(p_crop) = '' THEN
        RAISE EXCEPTION 'INVALID_INPUT: Crop name is required';
    END IF;

    -- 4. Atomic Pool Capacity Check & Row Locking
    IF p_pool_id IS NOT NULL THEN
        -- Acquire row-level lock on the targeted pool
        SELECT * INTO v_pool 
        FROM public.pools 
        WHERE id = p_pool_id 
        FOR UPDATE;

        IF v_pool IS NULL THEN
            RAISE EXCEPTION 'POOL_NOT_FOUND: Pool with id % does not exist', p_pool_id;
        END IF;

        IF v_pool.status IN ('completed', 'cancelled') THEN
            RAISE EXCEPTION 'POOL_NOT_AVAILABLE: Pool status is % and cannot accept new orders', v_pool.status;
        END IF;

        -- Calculate existing active order commitments against this pool
        SELECT COALESCE(SUM(quantity_kg), 0) INTO v_ordered_quantity
        FROM public.orders
        WHERE pool_id = p_pool_id 
          AND status != 'CANCELLED';

        -- Available quantity calculation using ACTUAL schema fields (current_quantity_kg)
        v_available_quantity := v_pool.current_quantity_kg - v_ordered_quantity;

        -- Atomic rejection if capacity is insufficient
        IF v_available_quantity < p_quantity_kg THEN
            RAISE EXCEPTION 'INSUFFICIENT_CAPACITY: Requested % kg exceeds available pool capacity (% kg remaining)', 
                p_quantity_kg, v_available_quantity;
        END IF;
    END IF;

    -- 5. Calculate verified financial breakdown
    v_total_amount := round(p_quantity_kg * p_agreed_price_per_kg, 2);
    v_service_cost := round(v_total_amount * 0.10, 2);
    v_transport_cost := round(v_total_amount * 0.05, 2);
    v_expected_loss := round(v_total_amount * 0.02, 2);
    v_farmer_net_value := v_total_amount - v_service_cost - v_transport_cost - v_expected_loss;

    -- 6. Insert Order Record with initial status 'CREATED'
    INSERT INTO public.orders (
        pool_id,
        buyer_id,
        crop,
        quantity_kg,
        agreed_price_per_kg,
        total_amount,
        farmer_net_value,
        pickup_location,
        delivery_location,
        status
    ) VALUES (
        p_pool_id,
        v_buyer_id,
        p_crop,
        p_quantity_kg,
        p_agreed_price_per_kg,
        v_total_amount,
        v_farmer_net_value,
        COALESCE(p_pickup_location, 'TBD'),
        COALESCE(p_delivery_location, 'TBD'),
        'CREATED'
    )
    RETURNING * INTO v_new_order;

    -- 7. Insert Notification for Buyer
    INSERT INTO public.notifications (
        user_id,
        type,
        message,
        reference_id
    ) VALUES (
        v_buyer_id,
        'ORDER_CREATED',
        'Order for ' || p_quantity_kg || 'kg of ' || p_crop || ' has been successfully created.',
        v_new_order.id
    );

    RETURN to_jsonb(v_new_order);
END;
$$;

-- Strict Execution Permissions
REVOKE EXECUTE ON FUNCTION public.create_order_atomic(UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT) TO service_role;
