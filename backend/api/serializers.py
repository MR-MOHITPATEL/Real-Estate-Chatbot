from rest_framework import serializers


class AnalysisRequestSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=500)


class ChartDatasetSerializer(serializers.Serializer):
    label = serializers.CharField()
    data = serializers.ListField(child=serializers.FloatField(allow_null=True))


class ChartDataSerializer(serializers.Serializer):
    labels = serializers.ListField(child=serializers.CharField())
    datasets = ChartDatasetSerializer(many=True)


class TableRowSerializer(serializers.Serializer):
    final_location = serializers.CharField()
    year = serializers.IntegerField()
    metric_value = serializers.FloatField(allow_null=True)
    total_units = serializers.IntegerField(required=False)
    total_sales = serializers.IntegerField(required=False)


class AnalysisResponseSerializer(serializers.Serializer):
    summary = serializers.CharField()
    chart_data = ChartDataSerializer()
    table_data = TableRowSerializer(many=True)
    chart_type = serializers.ChoiceField(choices=["line", "bar"])


