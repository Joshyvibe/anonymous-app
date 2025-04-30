from django.contrib import admin
from api.views import *
from django.urls import path, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('posts/', PostListCreateView.as_view(), name='post_list'),
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)