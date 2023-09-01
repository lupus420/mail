# import unittest
from django.test import TestCase
from .models import User, Email
from django.utils import timezone
# Create your tests here.
class EmailTestCase(TestCase):
    def setUp(self):

        # Create users
        usr1 = User.objects.create(username="user1", password="user1")
        usr2 = User.objects.create(username="user2", password="user2")

    def test_email(self):
        usr1 = User.objects.get(username="user1")
        usr2 = User.objects.get(username="user2")
        # With many to many relation we can't create an email with a list of recipients
        email = Email.objects.create(user=usr1 ,sender=usr1, subject="test", body="test")
        # recipients have to be added seperately
        email.recipients.add(usr2)
        self.assertEqual(email.sender, usr1)
        self.assertEqual(email.recipients.all()[0], usr2)
        self.assertEqual(email.subject, "test")
        self.assertEqual(email.body, "test")
        # check timestamp
        self.assertEqual(email.timestamp.year, timezone.now().year)
        self.assertEqual(email.timestamp.month, timezone.now().month)
        self.assertEqual(email.timestamp.day, timezone.now().day)
        self.assertEqual(email.timestamp.hour, timezone.now().hour)
        self.assertEqual(email.timestamp.minute, timezone.now().minute)

        self.assertEqual(email.read, False)
        self.assertEqual(email.archived, False)

    def test_user(self):
        usr1 = User.objects.get(username="user1")
        usr2 = User.objects.get(username="user2")
        self.assertEqual(usr1.username, "user1")
        self.assertEqual(usr1.password, "user1")
        self.assertEqual(usr2.username, "user2")
        self.assertEqual(usr2.password, "user2")
        # check if is_valid_user works
        self.assertTrue(usr1.is_valid_user())
        self.assertTrue(usr2.is_valid_user())
        # check if is_valid_email works
        email = Email.objects.create(user=usr1 ,sender=usr1, subject="test", body="test")
        email.recipients.add(usr2)
        self.assertTrue(email.is_valid_email())
        # check if serialize works
        self.assertEqual(email.serialize(), {
            "id": email.id,
            "sender": email.sender.email,
            "recipients": [user.email for user in email.recipients.all()],
            "subject": email.subject,
            "body": email.body,
            "timestamp": email.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "read": email.read,
            "archived": email.archived
        })
