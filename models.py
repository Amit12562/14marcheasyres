import datetime
from app import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified = db.Column(db.Boolean, default=True)  # Default to True since we removed OTP verification
    is_admin = db.Column(db.Boolean, default=False)
    wallet_balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Define relationship with Transaction model
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    utr_number = db.Column(db.String(30), nullable=False, unique=True)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    processor_note = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return f'<Transaction {self.id} - {self.amount} - {self.status}>'
    
    def approve(self, admin_note=None):
        """Approve the transaction and update user's wallet balance"""
        self.status = 'approved'
        self.processed_at = datetime.datetime.utcnow()
        if admin_note:
            self.processor_note = admin_note
        
        # Update user's wallet balance
        user = User.query.get(self.user_id)
        if user:
            user.wallet_balance += self.amount
        
        db.session.commit()
    
    def reject(self, admin_note=None):
        """Reject the transaction"""
        self.status = 'rejected'
        self.processed_at = datetime.datetime.utcnow()
        if admin_note:
            self.processor_note = admin_note
        
        db.session.commit()
