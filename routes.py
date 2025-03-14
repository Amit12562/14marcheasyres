import logging
from flask import render_template, redirect, url_for, flash, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

from app import app, db
from models import User, OTP
from utils.otp_generator import generate_otp
from utils.email_sender import send_email_otp
from utils.sms_sender import send_sms_otp

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
        delivery_method = request.form.get('delivery_method', 'email')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            # Generate OTP for login verification
            otp_code = generate_otp(app.config['OTP_LENGTH'])
            expiry_time = datetime.utcnow() + timedelta(seconds=app.config['OTP_EXPIRY_SECONDS'])
            
            # Create OTP record
            otp = OTP(
                user_id=user.id,
                otp_code=otp_code,
                purpose='login',
                delivery_method=delivery_method,
                expires_at=expiry_time
            )
            db.session.add(otp)
            db.session.commit()
            
            # Store user_id in session for OTP verification
            session['user_id'] = user.id
            session['otp_id'] = otp.id
            
            # Send OTP based on delivery method
            if delivery_method == 'email':
                if send_email_otp(user.email, otp_code, 'Login'):
                    flash('OTP has been sent to your email address.', 'success')
                else:
                    flash('Failed to send OTP to your email. Please try again.', 'danger')
                    return redirect(url_for('login'))
            elif delivery_method == 'sms':
                if not user.phone_number:
                    flash('Phone number not available. Please use email OTP instead.', 'warning')
                    return redirect(url_for('login'))
                
                if send_sms_otp(user.phone_number, otp_code, 'Login'):
                    flash('OTP has been sent to your phone number.', 'success')
                else:
                    flash('Failed to send OTP to your phone. Please try again.', 'danger')
                    return redirect(url_for('login'))
            
            return redirect(url_for('verify_otp', purpose='login'))
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
        delivery_method = request.form.get('delivery_method', 'email')
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists. Please choose a different one.', 'danger')
            return redirect(url_for('register'))
        
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            flash('Email already registered. Please use a different one.', 'danger')
            return redirect(url_for('register'))
        
        # Create user
        user = User(
            username=username,
            email=email,
            phone_number=phone_number,
            password_hash=generate_password_hash(password),
            is_verified=False
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate OTP for registration verification
        otp_code = generate_otp(app.config['OTP_LENGTH'])
        expiry_time = datetime.utcnow() + timedelta(seconds=app.config['OTP_EXPIRY_SECONDS'])
        
        # Create OTP record
        otp = OTP(
            user_id=user.id,
            otp_code=otp_code,
            purpose='registration',
            delivery_method=delivery_method,
            expires_at=expiry_time
        )
        db.session.add(otp)
        db.session.commit()
        
        # Store user_id in session for OTP verification
        session['user_id'] = user.id
        session['otp_id'] = otp.id
        
        # Send OTP based on delivery method
        if delivery_method == 'email':
            if send_email_otp(user.email, otp_code, 'Registration'):
                flash('OTP has been sent to your email address.', 'success')
            else:
                flash('Failed to send OTP to your email. Please try again.', 'danger')
                return redirect(url_for('register'))
        elif delivery_method == 'sms':
            if not user.phone_number:
                flash('Phone number not provided. Please use email OTP instead.', 'warning')
                return redirect(url_for('register'))
            
            if send_sms_otp(user.phone_number, otp_code, 'Registration'):
                flash('OTP has been sent to your phone number.', 'success')
            else:
                flash('Failed to send OTP to your phone. Please try again.', 'danger')
                return redirect(url_for('register'))
        
        return redirect(url_for('verify_otp', purpose='registration'))
    
    return render_template('register.html')

@app.route('/verify_otp/<purpose>', methods=['GET', 'POST'])
def verify_otp(purpose):
    if 'user_id' not in session or 'otp_id' not in session:
        flash('Session expired. Please try again.', 'danger')
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    otp_id = session['otp_id']
    
    user = User.query.get(user_id)
    otp = OTP.query.get(otp_id)
    
    if not user or not otp:
        flash('Invalid verification attempt. Please try again.', 'danger')
        return redirect(url_for('login'))
    
    # Check if OTP purpose matches the route purpose
    if otp.purpose != purpose:
        flash('Invalid verification flow. Please try again.', 'danger')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        entered_otp = request.form.get('otp_code')
        
        # Check if OTP is expired
        if otp.is_expired:
            flash('OTP has expired. Please request a new OTP.', 'danger')
            return redirect(url_for('login'))
        
        # Check if max attempts reached (3 attempts)
        if otp.attempt_count >= 3:
            flash('Maximum OTP verification attempts reached. Please request a new OTP.', 'danger')
            return redirect(url_for('login'))
        
        # Verify OTP
        if otp.otp_code == entered_otp:
            otp.is_verified = True
            
            if purpose == 'registration':
                user.is_verified = True
                flash('Registration successful! You can now log in.', 'success')
                db.session.commit()
                session.pop('user_id', None)
                session.pop('otp_id', None)
                return redirect(url_for('login'))
            
            elif purpose == 'login':
                db.session.commit()
                # Clear session data
                session.pop('user_id', None)
                session.pop('otp_id', None)
                # Log in the user
                login_user(user)
                flash('Login successful!', 'success')
                return redirect(url_for('dashboard'))
            
            elif purpose == 'reset_password':
                db.session.commit()
                # Implement password reset logic here
                flash('Password reset successful!', 'success')
                return redirect(url_for('login'))
        else:
            # Increment attempt count
            otp.increment_attempt()
            remaining_attempts = 3 - otp.attempt_count
            flash(f'Invalid OTP. You have {remaining_attempts} attempts remaining.', 'danger')
    
    return render_template('verify_otp.html', purpose=purpose, delivery_method=otp.delivery_method)

@app.route('/resend_otp', methods=['POST'])
def resend_otp():
    if 'user_id' not in session or 'otp_id' not in session:
        return jsonify({'success': False, 'message': 'Session expired. Please try again.'}), 400
    
    user_id = session['user_id']
    old_otp_id = session['otp_id']
    
    user = User.query.get(user_id)
    old_otp = OTP.query.get(old_otp_id)
    
    if not user or not old_otp:
        return jsonify({'success': False, 'message': 'Invalid user or OTP information.'}), 400
    
    # Generate new OTP
    otp_code = generate_otp(app.config['OTP_LENGTH'])
    expiry_time = datetime.utcnow() + timedelta(seconds=app.config['OTP_EXPIRY_SECONDS'])
    
    # Create new OTP record
    new_otp = OTP(
        user_id=user.id,
        otp_code=otp_code,
        purpose=old_otp.purpose,
        delivery_method=old_otp.delivery_method,
        expires_at=expiry_time
    )
    db.session.add(new_otp)
    db.session.commit()
    
    # Update session with new OTP ID
    session['otp_id'] = new_otp.id
    
    # Send OTP based on delivery method
    if new_otp.delivery_method == 'email':
        if send_email_otp(user.email, otp_code, new_otp.purpose.capitalize()):
            return jsonify({'success': True, 'message': 'OTP has been resent to your email address.'}), 200
        else:
            return jsonify({'success': False, 'message': 'Failed to send OTP to your email. Please try again.'}), 500
    elif new_otp.delivery_method == 'sms':
        if not user.phone_number:
            return jsonify({'success': False, 'message': 'Phone number not available. Please use email OTP instead.'}), 400
        
        if send_sms_otp(user.phone_number, otp_code, new_otp.purpose.capitalize()):
            return jsonify({'success': True, 'message': 'OTP has been resent to your phone number.'}), 200
        else:
            return jsonify({'success': False, 'message': 'Failed to send OTP to your phone. Please try again.'}), 500
    
    return jsonify({'success': False, 'message': 'Unknown delivery method.'}), 400

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))
