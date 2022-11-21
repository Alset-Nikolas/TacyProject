from django.contrib import admin

# Register your models here.
from .models import (
    IntermediateDateProject,
    MetricsProject,
    Project,
    ProjectStages,
    PropertiesItemsProject,
    PropertiesProject,
    PropertiesСommunityProject,
    RightsUserBool,
    RightsUSerInProject,
    RolesUserInProject,
    СommunityProject,
)


class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "date_start",
        "date_end",
        "author",
    )
    # list_editable = ("intermediate_dates", "metrics")
    search_fields = ("name",)
    list_filter = ("date_start",)
    empty_value_display = "-пусто-"


admin.site.register(Project, ProjectAdmin)
admin.site.register(MetricsProject)
admin.site.register(IntermediateDateProject)
admin.site.register(PropertiesProject)
admin.site.register(PropertiesItemsProject)
admin.site.register(СommunityProject)
admin.site.register(PropertiesСommunityProject)
admin.site.register(RolesUserInProject)
admin.site.register(RightsUserBool)
admin.site.register(RightsUSerInProject)
admin.site.register(ProjectStages)
