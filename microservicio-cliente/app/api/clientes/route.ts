import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// 1. Configuramos la conexión usando los datos del Learner Lab
const pool = new Pool({
    user: 'postgres',
    password: 'Factura2026',
    host: '54.90.68.218',
    port: 5432,
    database: 'facturacion_db',
});

export async function GET() {
    return NextResponse.json(
        { 
            estado: 'Activo',
            mensaje: '¡El microservicio de clientes está funcionando correctamente!' 
        },
        { status: 200 }
    );
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre } = body;

        // Validación básica
        if (!nombre) {
            return NextResponse.json(
                { error: 'El campo nombre es obligatorio' }, 
                { status: 400 }
            );
        }

        // 2. Ejecutamos la consulta SQL para insertar el cliente directamente en la BD
        const query = `
            INSERT INTO facturacion_cliente (id, nombre) 
            VALUES (gen_random_uuid(), $1) 
            RETURNING *;
        `;
        const valores = [nombre];

        const resultado = await pool.query(query, valores);
        const clienteCreado = resultado.rows[0];

        // 3. Retornamos éxito
        return NextResponse.json( 
            { 
                mensaje: 'Cliente creado con éxito en PostgreSQL', 
                cliente: clienteCreado 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error al guardar en BD:", error);
        return NextResponse.json(
            { error: 'Error interno al intentar crear el cliente en la base de datos' }, 
            { status: 500 }
        );
    }
}