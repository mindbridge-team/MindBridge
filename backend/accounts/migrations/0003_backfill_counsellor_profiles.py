from django.db import migrations


def forwards(apps, schema_editor):
    Profile = apps.get_model("accounts", "Profile")
    Counsellor = apps.get_model("accounts", "Counsellor")
    for profile in Profile.objects.filter(role="counsellor"):
        counsellor, created = Counsellor.objects.get_or_create(
            user_id=profile.user_id,
            defaults={
                "specialization": "Counselling",
                "experience_years": 1,
                "availability_text": "Please contact for available times.",
                "is_verified": True,
            },
        )
        if not created and not counsellor.is_verified:
            counsellor.is_verified = True
            counsellor.save(update_fields=["is_verified"])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_counsellor"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
