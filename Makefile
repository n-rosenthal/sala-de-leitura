up:
	docker compose up --build

down:
	docker compose down

backend-shell:
	docker compose exec backend bash

migrate:
	docker compose exec backend python manage.py migrate

createsuperuser:
	docker compose exec backend python manage.py createsuperuser
