import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

const pool = new Pool({
    user: 'postgres',
    password: 'Factura2026',
    host: '54.90.68.218',
    port: 5432,
    database: 'facturacion_db',
    // Forzamos a que si la BD tarda más de 300ms en contestar, cancele y cuente como Timeout
    connectionTimeoutMillis: 300, 
});

export async function GET() {
    const tiempoInicio = Date.now();

    try {
        await pool.query('SELECT 1');
        
        const tiempoFin = Date.now();
        const latenciaMs = tiempoFin - tiempoInicio;

        let estadoActual = 'OK';
        let statusCode = 200;

        if (latenciaMs > 300) {
            estadoActual = 'DENEGADO';
            statusCode = 503; // 503 Service Unavailable para que el monitor lo detecte rápido
        } else if (latenciaMs >= 100) {
            estadoActual = 'DEGRADADO';
        }

        return NextResponse.json(
            { 
                estado: estadoActual, 
                latencia_ms: latenciaMs,
                timestamp: tiempoFin 
            },
            { status: statusCode }
        );

    } catch (error) {
        // Entra aquí si hay un error de conexión o si supera el connectionTimeoutMillis de 300ms
        const tiempoError = Date.now();
        return NextResponse.json(
            { 
                estado: 'DENEGADO', 
                latencia_ms: tiempoError - tiempoInicio,
                timestamp: tiempoError,
                error: 'Timeout o fallo de base de datos'
            },
            { status: 503 }
        );
    }
}