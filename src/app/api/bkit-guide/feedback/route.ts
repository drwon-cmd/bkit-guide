// bkit-guide Feedback API
// Handle thumbs up/down feedback for Q&A

import { NextRequest, NextResponse } from 'next/server';
import { updateHelpful, getQAById } from '@/lib/bkit-guide/qa-store';

export async function POST(request: NextRequest) {
  try {
    const { qaId, helpful } = await request.json();

    if (!qaId) {
      return NextResponse.json({ error: 'qaId is required' }, { status: 400 });
    }

    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'helpful must be a boolean' },
        { status: 400 }
      );
    }

    // Check if Q&A exists
    const qa = await getQAById(qaId);
    if (!qa) {
      return NextResponse.json({ error: 'Q&A not found' }, { status: 404 });
    }

    // Update helpful count
    const increment = helpful ? 1 : -1;
    const updated = await updateHelpful(qaId, increment);

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      qaId,
      helpful,
      newScore: qa.helpful + increment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Feedback failed' },
      { status: 500 }
    );
  }
}
