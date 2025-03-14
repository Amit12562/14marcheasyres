import datetime
from app import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Define relationship with OTP model
    otps = db.relationship('OTP', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'


class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    otp_code = db.Column(db.String(10), nullable=False)
    purpose = db.Column(db.String(50), nullable=False)  # login, registration, reset_password
    delivery_method = db.Column(db.String(10), nullable=False)  # email, sms
    is_verified = db.Column(db.Boolean, default=False)
    attempt_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    def __repr__(self):
        return f'<OTP {self.otp_code} for {self.purpose}>'
    
    @property
    def is_expired(self):
        return datetime.datetime.utcnow() > self.expires_at
    
    def increment_attempt(self):
        self.attempt_count += 1
        db.session.commit()
