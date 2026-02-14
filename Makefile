up:
	sudo docker compose up --build

down:
	sudo docker compose down

backend-shell:
	sudo docker compose exec backend bash

migrate:
	sudo docker compose exec backend python manage.py makemigrations
	&& sudo docker compose exec backend python manage.py migrate

createsuperuser:
	sudo docker compose exec backend python manage.py createsuperuser
