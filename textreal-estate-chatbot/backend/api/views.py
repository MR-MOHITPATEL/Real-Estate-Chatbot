from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .analysis import analyze_query
from .serializers import AnalysisRequestSerializer, AnalysisResponseSerializer


class AnalysisView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request, *args, **kwargs):
        serializer = AnalysisRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data["query"]
        upload = request.FILES.get("file")

        try:
            result = analyze_query(query=query, uploaded_file=upload)
        except (ValueError, FileNotFoundError) as exc:
            raise ValidationError(str(exc)) from exc
        response_serializer = AnalysisResponseSerializer(data=result)
        response_serializer.is_valid(raise_exception=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

