import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    password: 'Factura2026',
    host: '54.90.68.218', // Cambia esto por la IP o dominio de tu base de datos
    port: 5432,
    database: 'facturacion_db',
});

export async function GET() {
    try {
        // Hacemos un JOIN para traer el cliente y agrupar sus proyectos en un arreglo
        const query = `
            SELECT 
                c.id, 
                c.nombre, 
                COALESCE(json_agg(cp.proyecto_id) FILTER (WHERE cp.proyecto_id IS NOT NULL), '[]') as proyectos
            FROM facturacion_cliente c
            LEFT JOIN facturacion_clienteproyecto cp ON c.id = cp.cliente_id
            GROUP BY c.id;
        `;
        const resultado = await pool.query(query);
        
        return NextResponse.json(
            { 
                estado: 'Activo',
                total_clientes: resultado.rowCount,
                clientes: resultado.rows 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return NextResponse.json(
            { error: 'Error al consultar la base de datos.' }, 
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    // Pedimos un cliente de conexión específico para hacer una transacción segura
    const dbClient = await pool.connect();

    try {
        const body = await request.json();
        const { nombre, proyectos } = body;

        if (!nombre) {
            return NextResponse.json(
                { error: 'El campo nombre es obligatorio' }, 
                { status: 400 }
            );
        }

        // 1. Iniciamos la transacción
        await dbClient.query('BEGIN');

        // 2. Insertamos el cliente en su tabla
        const queryCliente = `
            INSERT INTO facturacion_cliente (id, nombre) 
            VALUES (gen_random_uuid(), $1) 
            RETURNING id, nombre;
        `;
        const resCliente = await dbClient.query(queryCliente, [nombre]);
        const clienteCreado = resCliente.rows[0];

        // 3. Insertamos los proyectos en la tabla relacional (si vienen en el JSON)
        if (proyectos && Array.isArray(proyectos) && proyectos.length > 0) {
            const queryProyecto = `
                INSERT INTO facturacion_clienteproyecto (cliente_id, proyecto_id) 
                VALUES ($1, $2);
            `;
            for (const proyecto_id of proyectos) {
                await dbClient.query(queryProyecto, [clienteCreado.id, proyecto_id]);
            }
        }

        // 4. Confirmamos que todo salió bien y guardamos
        await dbClient.query('COMMIT');

        return NextResponse.json( 
            { 
                mensaje: 'Cliente y proyectos creados con éxito', 
                cliente: {
                    ...clienteCreado,
                    proyectos: proyectos || []
                }
            },
            { status: 201 }
        );

    } catch (error) {
        // Si algo falla, deshacemos cualquier inserción a medias
        await dbClient.query('ROLLBACK');
        console.error("Error al guardar en BD:", error);
        return NextResponse.json(
            { error: 'Error interno al intentar crear el cliente o sus proyectos' }, 
            { status: 500 }
        );
    } finally {
        // Liberamos la conexión de vuelta al pool
        dbClient.release();
    }
}