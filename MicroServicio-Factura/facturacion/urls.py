from django.urls import path
from .views import GenerarFacturaCommand, ConsultarFacturasQuery

urlpatterns = [
    # Command: Para crear la factura
    path('facturas/generar/', GenerarFacturaCommand.as_view(), name='generar-factura'),
    
    # Query: Para consultar las facturas de un cliente (esta la probaremos después)
    path('facturas/cliente/<uuid:cliente_id>/', ConsultarFacturasQuery.as_view(), name='consultar-facturas'),
]