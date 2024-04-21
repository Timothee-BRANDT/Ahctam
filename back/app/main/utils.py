from flask import (
    current_app,
    url_for,
    render_template
)
from flask_mail import Message


def send_confirmation_email(email, token):
    with current_app.app_context():
        confirm_url = url_for('main.confirm_email',
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
        print('Email sent')
