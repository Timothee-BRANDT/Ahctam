from flask import (
    current_app,
    url_for,
    render_template
)
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer


def send_confirmation_email(email, token):
    with current_app.app_context():
        confirm_url = url_for('auth.confirm_email',
                              token=token, _external=True)
        mail = current_app.extensions['mail']
        msg = Message(
            subject='Matcha . Confirm your email',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email],
            html=render_template('email_confirmation.html',
                                 confirm_url=confirm_url)
        )
        mail.send(msg)


def send_reset_password_email(email):
    with current_app.app_context():
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        token = serializer.dumps(
            email, salt=current_app.config['SMTP_SECURITY_SALT'])
        mail = current_app.extensions['mail']
        msg = Message(
            subject='Matcha . Reset your password',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email])
        link = url_for('auth.reset_password_page', token=token, _external=True)
        msg.body = f"""
        To reset your password, visit the following link:
        {link}
        If you did not make this request then simply ignore this email.
        """
        mail.send(msg)
        print('Email sent')
