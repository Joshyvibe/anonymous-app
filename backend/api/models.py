from django.db import models

class Post(models.Model):
    # This is the model for the post audio voic note
    title = models.CharField(max_length=50, blank=True)
    audio = models.FileField(upload_to='voice_notes/')
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Post {self.title} - {self.created_at}"


# The comment model which is going to have a relationship with the post model

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Comment {self.id} on Post {self.post.id}"