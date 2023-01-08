from django.contrib import admin

# Register your models here.
from .models import (
    Initiatives,
    InitiativesAddFields,
    SettingsAddFeldsInitiative,
    Risks,
    RisksAddFields,
    SettingsAddFeldsRisks,
    Events,
    EventsAddFields,
    SettingsAddFeldsEvent,
    InitiativesPropertiesFields,
    InitiativesMetricsFields,
    EventMetricsFields,
    SettingsStatusInitiative,
    SettingsComponents,
    RolesUserInInitiative,
)


admin.site.register(Initiatives)
admin.site.register(InitiativesAddFields)
admin.site.register(InitiativesPropertiesFields)
admin.site.register(SettingsAddFeldsInitiative)
admin.site.register(InitiativesMetricsFields)
admin.site.register(SettingsStatusInitiative)
admin.site.register(SettingsComponents)

admin.site.register(Risks)
admin.site.register(RisksAddFields)
admin.site.register(SettingsAddFeldsRisks)

admin.site.register(Events)
admin.site.register(EventsAddFields)
admin.site.register(SettingsAddFeldsEvent)
admin.site.register(EventMetricsFields)

admin.site.register(RolesUserInInitiative)
