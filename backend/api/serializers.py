from rest_framework import serializers
from .models import *


class PostSerializer(serializers.ModelSerializer):
    # setup a serializer model for the comment model
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'audio', 'created_at', 'comments']

    def get_comments(self, obj):
        # get all comments related to the post
       return CommentSerializer(obj.comments.all(), many=True).data


class CommentSerializer(serializers.ModelSerializer):
    # setup a serializer model for the comment model
    class Meta:
        model = Comment
        fields = ['id', 'post', 'text', 'created_at']
        extra_kwargs = {'post': {'required': False}}