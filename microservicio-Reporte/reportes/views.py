from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from pymongo.errors import DuplicateKeyError, PyMongoError

from .mongo_client import command_reportes_collection, query_reportes_collection

CAMPOS_OBLIGATORIOS = [
    "reporte_id",
    "proyecto_asociado",
    "tipo",
    "total_facturado",
    "gasto_cpu",
    "gasto_bases_de_datos",
    "ahorro",
]


def validar_campos_obligatorios(data):
    campos_faltantes = []

    for campo in CAMPOS_OBLIGATORIOS:
        if campo not in data:
            campos_faltantes.append(campo)

    return campos_faltantes


@api_view(["GET"])
def listar_reportes(request):
    try:
        reportes = list(
            query_reportes_collection.find({}, {"_id": 0})
        )

        return Response(reportes, status=status.HTTP_200_OK)

    except PyMongoError as error:
        return Response(
            {
                "error": "Error al obtener los reportes desde MongoDB",
                "detalle": str(error)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def obtener_reporte(request, reporte_id):
    try:
        reporte = command_reportes_collection.find_one(
            {"reporte_id": reporte_id},
            {"_id": 0}
        )

        if not reporte:
            return Response(
                {"error": "Reporte no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(reporte, status=status.HTTP_200_OK)

    except PyMongoError as error:
        return Response(
            {
                "error": "Error al obtener el reporte desde MongoDB",
                "detalle": str(error)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
def crear_reporte(request):
    try:
        data = request.data

        campos_faltantes = validar_campos_obligatorios(data)

        if campos_faltantes:
            return Response(
                {
                    "error": "Faltan campos obligatorios",
                    "campos_faltantes": campos_faltantes
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        nuevo_reporte = {
            "reporte_id": data["reporte_id"],
            "proyecto_asociado": data["proyecto_asociado"],
            "tipo": data["tipo"],
            "total_facturado": data["total_facturado"],
            "gasto_cpu": data["gasto_cpu"],
            "gasto_bases_de_datos": data["gasto_bases_de_datos"],
            "ahorro": data["ahorro"],
        }

        command_reportes_collection.insert_one(nuevo_reporte)

        respuesta = {
            "reporte_id": nuevo_reporte["reporte_id"],
            "proyecto_asociado": nuevo_reporte["proyecto_asociado"],
            "tipo": nuevo_reporte["tipo"],
            "total_facturado": nuevo_reporte["total_facturado"],
            "gasto_cpu": nuevo_reporte["gasto_cpu"],
            "gasto_bases_de_datos": nuevo_reporte["gasto_bases_de_datos"],
            "ahorro": nuevo_reporte["ahorro"],
        }

        return Response(respuesta, status=status.HTTP_201_CREATED)

    except DuplicateKeyError:
        return Response(
            {"error": "Ya existe un reporte con ese reporte_id"},
            status=status.HTTP_400_BAD_REQUEST
        )

    except PyMongoError as error:
        return Response(
            {
                "error": "Error al crear el reporte en MongoDB",
                "detalle": str(error)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["PUT"])
def actualizar_reporte(request, reporte_id):
    try:
        data = request.data

        if "reporte_id" in data:
            return Response(
                {"error": "No se permite modificar el reporte_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        resultado = command_reportes_collection.update_one(
            {"reporte_id": reporte_id},
            {"$set": data}
        )

        if resultado.matched_count == 0:
            return Response(
                {"error": "Reporte no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        reporte_actualizado = command_reportes_collection.find_one(
            {"reporte_id": reporte_id},
            {"_id": 0}
        )

        return Response(reporte_actualizado, status=status.HTTP_200_OK)

    except PyMongoError as error:
        return Response(
            {
                "error": "Error al actualizar el reporte en MongoDB",
                "detalle": str(error)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["DELETE"])
def eliminar_reporte(request, reporte_id):
    try:
        resultado = command_reportes_collection.delete_one(
            {"reporte_id": reporte_id}
        )

        if resultado.deleted_count == 0:
            return Response(
                {"error": "Reporte no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {"mensaje": "Reporte eliminado correctamente"},
            status=status.HTTP_200_OK
        )

    except PyMongoError as error:
        return Response(
            {
                "error": "Error al eliminar el reporte en MongoDB",
                "detalle": str(error)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )