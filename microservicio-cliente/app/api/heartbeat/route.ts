import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json(
        { 
            estado: 'vivo', 
            timestamp: Date.now() 
        },
        { status: 200 }
    );
}