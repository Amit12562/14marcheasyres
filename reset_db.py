import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Create a temporary app to reset the database
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///instance/database.db"
db = SQLAlchemy(model_class=Base)
db.init_app(app)

with app.app_context():
    db.drop_all()
    print('All tables dropped successfully')