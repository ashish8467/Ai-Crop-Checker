import os

# Keep test runs isolated from a developer's configured PostgreSQL or local app database.
os.environ["DATABASE_URL"] = "sqlite:///./test_smart_farming.db"
