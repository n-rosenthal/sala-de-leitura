from datetime import timedelta
from django.db import migrations, models
from django.utils.timezone import now


def default_data_prevista():
    return now().date() + timedelta(days=7)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_alter_emprestimo_data_prevista'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emprestimo',
            name='data_prevista',
            field=models.DateField(default=default_data_prevista),
        ),
    ]