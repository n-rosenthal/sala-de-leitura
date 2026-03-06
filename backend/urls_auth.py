# api/urls_auth.py

from django.urls import path
from api.views.Auth import LoginView, LogoutView, RefreshView, MeView

urlpatterns = [
    path("login/",   LoginView.as_view(),   name="auth-login"),
    path("logout/",  LogoutView.as_view(),  name="auth-logout"),
    path("refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("me/",      MeView.as_view(),      name="auth-me"),
]