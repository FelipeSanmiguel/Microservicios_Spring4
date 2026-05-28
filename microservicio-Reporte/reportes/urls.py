from django.urls import path
from . import views

urlpatterns = [
    path("reportes/", views.listar_reportes, name="listar_reportes"),
    path("reportes/crear/", views.crear_reporte, name="crear_reporte"),
    path("reportes/<str:reporte_id>/", views.obtener_reporte, name="obtener_reporte"),
    path("reportes/<str:reporte_id>/actualizar/", views.actualizar_reporte, name="actualizar_reporte"),
    path("reportes/<str:reporte_id>/eliminar/", views.eliminar_reporte, name="eliminar_reporte"),
]