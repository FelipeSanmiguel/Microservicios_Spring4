
import { NextResponse } from 'next/server';

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

        if (!nombre) {
            return NextResponse.json(
                { error: 'El campo nombre es obligatorio' }, 
                { status: 400 }
            );
        }

        // Aquí irá el código para guardar el cliente en la propia base de datos de este microservicio

        return NextResponse.json( 
            { mensaje: 'Cliente creado con éxito', nombre: nombre },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: 'Error interno al intentar crear el cliente' }, 
            { status: 500 }
        );
    }
}