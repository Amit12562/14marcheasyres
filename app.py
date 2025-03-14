import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager


# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///otp_service.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# App configurations for OTP service
app.config['OTP_EXPIRY_SECONDS'] = int(os.environ.get('OTP_EXPIRY_SECONDS', 300))  # 5 minutes default
app.config['OTP_LENGTH'] = int(os.environ.get('OTP_LENGTH', 6))
app.config['EMAIL_SENDER'] = os.environ.get('EMAIL_SENDER', 'noreply@otpservice.com')
app.config['EMAIL_SERVICE_API_KEY'] = os.environ.get('EMAIL_SERVICE_API_KEY', '')

# initialize the app with the extension
db.init_app(app)

# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

with app.app_context():
    # Make sure to import the models here so their tables will be created
    import models  # noqa: F401
    from werkzeug.security import generate_password_hash
    
    db.create_all()
    
    # Create admin user if no users exist
    if models.User.query.count() == 0:
        admin_user = models.User(
            username='noobruboss',
            email='amitaaa12562@gmail.com',
            password_hash=generate_password_hash('boss'),
            is_verified=True,
            is_admin=True,
            wallet_balance=0.0,
            phone_number=None
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully. Username: noobruboss, Password: boss")
    
    from routes import *  # Import routes after the app is created

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))
