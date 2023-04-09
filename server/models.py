import json
from typing import Optional

from flask_login import UserMixin
from sqlalchemy import text

import db


class User(UserMixin):
    def __init__(
        self,
        id: str,
        email: str,
        username: str,
        password: str,
        device_background: str,
    ):
        self.id = id
        self.email = email
        self.username = username
        self.password = password
        self.device_background = device_background

    @staticmethod
    def get(username: str) -> Optional["User"]:
        statement = text("select * from UserInfo where username=:username").bindparams(
            username=username
        )
        if result := db.query(statement).fetchone():
            return User(*result)

        return None

    def __repr__(self):
        return f"<User {self.id}>"
