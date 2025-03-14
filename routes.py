import logging
from flask import render_template, redirect, url_for, flash, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from functools import wraps

from app import app, db
from models import User, Transaction

# Make datetime available in all templates
@app.context_processor
def inject_now():
    return {'now': datetime.now}

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            # Log in the user directly without OTP
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'danger')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        phone_number = request.form.get('phone_number')
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists. Please choose a different one.', 'danger')
            return redirect(url_for('register'))
        
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            flash('Email already registered. Please use a different one.', 'danger')
            return redirect(url_for('register'))
        
        # Create user (verified by default, no OTP)
        user = User(
            username=username,
            email=email,
            phone_number=phone_number,
            password_hash=generate_password_hash(password),
            is_verified=True,  # Set as verified by default 
            is_admin=False,
            wallet_balance=0.0
        )
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

# OTP routes removed as they are no longer needed

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's pending transactions
    pending_transactions = Transaction.query.filter_by(
        user_id=current_user.id, 
        status='pending'
    ).order_by(Transaction.created_at.desc()).all()
    
    # Get user's completed transactions
    completed_transactions = Transaction.query.filter(
        (Transaction.user_id == current_user.id) & 
        ((Transaction.status == 'approved') | (Transaction.status == 'rejected'))
    ).order_by(Transaction.created_at.desc()).limit(10).all()
    
    return render_template(
        'dashboard.html',
        pending_transactions=pending_transactions,
        completed_transactions=completed_transactions
    )

@app.route('/add_balance', methods=['GET', 'POST'])
@login_required
def add_balance():
    if request.method == 'POST':
        utr_number = request.form.get('utr_number')
        amount = float(request.form.get('amount', 0))
        
        # Validate inputs
        if not utr_number or not amount or amount <= 0:
            flash('Please provide a valid UTR number and amount.', 'danger')
            return redirect(url_for('add_balance'))
        
        # Check if UTR number already exists
        existing_transaction = Transaction.query.filter_by(utr_number=utr_number).first()
        if existing_transaction:
            flash('This UTR number has already been used.', 'danger')
            return redirect(url_for('add_balance'))
        
        # Create new transaction
        transaction = Transaction(
            user_id=current_user.id,
            amount=amount,
            utr_number=utr_number
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        flash('Your balance request has been submitted and is pending approval.', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('add_balance.html')

# Define an admin_required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('You do not have permission to access this page.', 'danger')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin/pending_transactions')
@login_required
@admin_required
def admin_pending_transactions():
    pending_transactions = Transaction.query.filter_by(status='pending').order_by(Transaction.created_at.desc()).all()
    return render_template('admin/pending_transactions.html', transactions=pending_transactions)

@app.route('/admin/approve_transaction/<int:transaction_id>', methods=['POST'])
@login_required
@admin_required
def approve_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    
    admin_note = request.form.get('admin_note', '')
    
    transaction.approve(admin_note)
    
    flash(f'Transaction #{transaction_id} has been approved.', 'success')
    return redirect(url_for('admin_pending_transactions'))

@app.route('/admin/reject_transaction/<int:transaction_id>', methods=['POST'])
@login_required
@admin_required
def reject_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    
    admin_note = request.form.get('admin_note', '')
    
    transaction.reject(admin_note)
    
    flash(f'Transaction #{transaction_id} has been rejected.', 'success')
    return redirect(url_for('admin_pending_transactions'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))
