from fastapi.testclient import TestClient
import pytest
from app.main import app

# Create test client
client = TestClient(app)

def test_read_root():
    """Test the root endpoint returns the correct message"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Polish Law for Foreigners Chat API is running"} 