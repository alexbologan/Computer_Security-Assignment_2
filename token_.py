import jwt
from datetime import datetime, timedelta

secret_key = "UVlMbNzBm7YYTAFsB9TPFjSRuk4IALDw"
token = jwt.encode(
    {"username": "ionhar123", "isAdmin": True, "exp": datetime.utcnow() + timedelta(minutes=15)},
    secret_key,
    algorithm="HS256"
)
print(token)
