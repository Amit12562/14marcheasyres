document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(message => {
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(message);
            alert.close();
        }, 5000);
    });

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = document.querySelector(this.getAttribute('data-target'));
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

    // OTP focus handling for separate input fields
    const otpInputs = document.querySelectorAll('.otp-input');
    if (otpInputs.length > 0) {
        otpInputs.forEach((input, index) => {
            input.addEventListener('keyup', function(e) {
                // If a number is entered, move to the next input
                if (this.value.length === this.maxLength && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
                
                // If backspace is pressed on an empty input, move to the previous input
                if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone_number');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Allow only numbers, +, -, and spaces
            this.value = this.value.replace(/[^\d\+\-\s]/g, '');
        });
    }
});
