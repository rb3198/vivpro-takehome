import re
from pydantic import BaseModel, Field, field_validator

username_pattern = re.compile(r'^[0-9a-zA-Z_-]+$')
name_pattern = re.compile(r'^[0-9a-zA-Z \.\-\']+$')
password_pattern = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).{8,}$')

class UserCreation(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
        pattern=username_pattern,
        description=
        'A username must be 3-30 characters long, and may contain alphabets, digits, underscores, and hyphens. No spaces.')
    name: str = Field(
        min_length=1,
        max_length=100,
        pattern=name_pattern,
        description=
        'A name must be 1-100 characters long, and may contain alphabets, digits, hyphens, periods, spaces, and apostrophes.'
    )
    password: str = Field(
        min_length=8,
        pattern=password_pattern,
        description=
        'A password must contain a lowercase, an uppercase, a digit, and a special character. No whitespaces allowed',
    )

    @field_validator("name")
    def no_all_spaces(cls, v):
        if v.strip() == "":
            raise ValueError("Name cannot be only spaces.")
        return v