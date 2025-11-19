from django.db import models


class QueryLog(models.Model):
    """
    Lightweight model to keep the door open for future persistence needs.
    Currently unused at runtime but kept for potential audit trails.
    """

    query = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.query[:50]

from django.db import models

# Create your models here.
