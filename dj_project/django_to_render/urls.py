from django.urls import path
from . import views

urlpatterns = [
    path('watermark/', views.addWatermark)
]
