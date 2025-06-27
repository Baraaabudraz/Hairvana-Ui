import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch salon with related data
    const { data: salon, error } = await supabase
      .from('salons')
      .select(`
        *,
        services:services(*),
        staff:staff(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching salon:', error);
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      );
    }

    // Fetch salon's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('salon_id', id)
      .eq('status', 'active')
      .single();

    // Return salon data with subscription info
    return NextResponse.json({
      ...salon,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Error in salon details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}