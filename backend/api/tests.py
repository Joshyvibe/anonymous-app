from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import *
import io


class ApiTests(APITestCase):

    def setUp(self):
        # Create test data
        audio_file = SimpleUploadedFile("test_audio.mp3", b"dummy_audio_data", content_type="audio/mpeg")
        self.post = Post.objects.create(audio=audio_file)

    #setup test create post method
    def test_create_post(self):
        audio_file = SimpleUploadedFile("test_audio.mp3", b"dummy_audio_data", content_type="audio/mpeg")
        response = self.client.post('/posts/', {'audio': audio_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    #setup test get post method
    def test_get_posts(self):
        response = self.client.get('/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    #setup test create comments method

    def test_create_comment(self):
        response = self.client.post(f'/posts/{self.post.id}/comments/', {"text": "This is a test comment"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)

    #setup comments get method
    def test_get_comments(self):
        Comment.objects.create(post=self.post, text="This is a test comment")
        response = self.client.get(f'/posts/{self.post.id}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)