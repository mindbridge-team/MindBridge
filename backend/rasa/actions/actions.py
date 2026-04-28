import random
from typing import Any, Text, Dict, List, Optional

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionPatientAssistant(Action):
    def name(self) -> Text:
        return "action_patient_assistant"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        user_text = (tracker.latest_message.get("text") or "").lower()
        intent: Optional[str] = tracker.latest_message.get("intent", {}).get("name")

        crisis_responses = [
            "I’m really sorry you’re feeling this way. I can’t provide emergency support, but you should contact a trusted person right now or call emergency services if you might hurt yourself or someone else. If you are in the U.S., you can call or text 988 for immediate crisis support.",
            "This sounds serious, and you deserve immediate help. Please reach out to someone you trust now, or call emergency services if there is any immediate danger. In the U.S., call or text 988 for the Suicide & Crisis Lifeline.",
            "I’m concerned about your safety. Please do not handle this alone. Contact a trusted person, local emergency services, or call/text 988 in the U.S. for crisis support.",
        ]

        dashboard_responses = [
            "The Dashboard is the main page after you log in. It shows today’s mood, upcoming sessions, mood streak, quick links, and featured resources.",
            "You can find Dashboard on the left sidebar. It gives you a quick overview of your mood, sessions, and resources.",
            "Dashboard is your home base in MindBridge. Use it to quickly log your mood, book a session, and see upcoming information.",
        ]

        appointment_responses = [
            "Appointments are under **Book Session** on the left sidebar. Click Book Session to schedule or view session options.",
            "To find appointments, use **Book Session** in the left menu. Your upcoming sessions should also appear on the Dashboard.",
            "If you want to book or manage appointments, go to **Book Session** from the sidebar.",
            "For sessions, click **Book Session** on the left side of the page. After booking, your upcoming session should show on the Dashboard.",
            "Appointment features are handled through **Book Session**. That is where you should go to schedule a counseling session.",
        ]

        mood_responses = [
            "Mood tracking is under **Mood Tracker** on the left sidebar. You can also use the dashboard quick link to log today’s mood.",
            "To log your mood, click **Mood Tracker** from the sidebar. That page helps you record how you’re feeling over time.",
            "Mood Tracker is where you can enter your daily mood and build a history of how you’ve been doing.",
            "If you want to check in or record how you feel, go to **Mood Tracker**.",
        ]

        reminder_responses = [
            "Reminders are meant for daily check-ins, appointment prep, and wellness routines. Check the reminders or settings area if your version has it enabled.",
            "For reminders, look for notification or reminder settings. They can help with daily mood check-ins or session reminders.",
            "Reminder support can help you stay consistent with mood logs and wellness check-ins.",
        ]

        resource_responses = [
            "Resources are under **Resources** on the left sidebar. That section has mental health material, coping strategies, and support content.",
            "To find resources, click **Resources** from the sidebar. Featured resources may also appear on your Dashboard.",
            "The Resources page is where you can find guides, articles, and self-help material.",
            "Use **Resources** when you want support material outside of a live session.",
        ]

        profile_responses = [
            "Your profile is under **Profile** on the left sidebar. That is where your account details should be.",
            "To check your account information, click **Profile** from the sidebar.",
            "Profile is the place to review your saved user information and personal details.",
        ]

        community_responses = [
            "Community is on the left sidebar. It is meant for peer or group-based support features if your team has enabled them.",
            "Use **Community** if you are looking for shared support spaces or connection features.",
            "Community should be the place for support beyond one-on-one sessions, depending on what features are active.",
        ]

        login_responses = [
            "If you are already signed in, you can use the sidebar to navigate. If something looks wrong, try logging out and back in.",
            "For login issues, check that you are signed in. If pages are not loading, logging out and back in may refresh your session.",
            "If your account information is not showing correctly, try signing out and signing in again.",
        ]

        navigation_responses = [
            "You can use the left sidebar to move around MindBridge. The main pages are Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile.",
            "The left menu is your main navigation. Dashboard is your overview, Book Session is for appointments, Mood Tracker is for mood logs, Resources has support content, and Profile has account info.",
            "I can help you navigate MindBridge. Tell me the page you want, like Book Session, Mood Tracker, Resources, Profile, or Dashboard.",
            "The sidebar has Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile. Pick the feature you need and I’ll point you there.",
        ]

        support_responses = [
            "I’m here with you. Try taking one slow breath in, holding briefly, and breathing out slowly. What is the main thing bothering you right now?",
            "That sounds difficult. A good first step is naming what you’re feeling: stressed, anxious, sad, overwhelmed, or something else.",
            "I can help you slow things down. What happened, and what feeling is strongest right now?",
            "You don’t have to figure everything out at once. Let’s focus on one thing you’re dealing with right now.",
            "I can listen and help you organize what you’re feeling. What has been weighing on you the most today?",
            "Let’s take it one step at a time. Is this more about stress, anxiety, sadness, relationships, school, or something else?",
            "I’m not a replacement for a counselor, but I can help you reflect, calm down, and decide what next step might help.",
        ]

        # Most specific / safety first
        if intent == "crisis":
            dispatcher.utter_message(text=random.choice(crisis_responses))

        # Specific app sections before broad navigation words like "where"
        elif intent in ["ask_appointment", "appointment_help"] or any(
            x in user_text for x in [
                "appointment", "appointments", "appoint", "appoints",
                "book", "booking", "book session",
                "session", "sessions", "schedule", "scheduling",
                "counselor", "counsellor", "therapy", "therapist"
            ]
        ):
            dispatcher.utter_message(text=random.choice(appointment_responses))

        elif intent in ["ask_mood", "mood_help"] or any(
            x in user_text for x in [
                "mood", "moods", "mood tracker", "feeling",
                "feelings", "tracker", "log mood", "log my mood",
                "check in", "check-in", "streak"
            ]
        ):
            dispatcher.utter_message(text=random.choice(mood_responses))

        elif intent in ["ask_resources", "resource_help"] or any(
            x in user_text for x in [
                "resource", "resources", "article", "articles",
                "guide", "guides", "material", "materials",
                "coping", "self help", "self-help"
            ]
        ):
            dispatcher.utter_message(text=random.choice(resource_responses))

        elif intent in ["ask_profile", "profile_help"] or any(
            x in user_text for x in [
                "profile", "account", "settings",
                "personal info", "personal information", "my info"
            ]
        ):
            dispatcher.utter_message(text=random.choice(profile_responses))

        elif intent in ["ask_community", "community_help"] or any(
            x in user_text for x in [
                "community", "group", "peer", "support group"
            ]
        ):
            dispatcher.utter_message(text=random.choice(community_responses))

        elif intent in ["ask_dashboard", "dashboard_help"] or any(
            x in user_text for x in [
                "dashboard", "home page", "homepage", "main page", "overview"
            ]
        ):
            dispatcher.utter_message(text=random.choice(dashboard_responses))

        elif intent in ["ask_reminder", "reminder_help"] or any(
            x in user_text for x in [
                "reminder", "reminders", "remind", "notification",
                "notifications", "daily check"
            ]
        ):
            dispatcher.utter_message(text=random.choice(reminder_responses))

        elif intent in ["ask_login", "login_help"] or any(
            x in user_text for x in [
                "login", "log in", "logout", "log out",
                "sign in", "sign out", "signed in", "password"
            ]
        ):
            dispatcher.utter_message(text=random.choice(login_responses))

        # Broad navigation comes near the end
        elif intent in ["ask_navigation", "website_help"] or any(
            x in user_text for x in [
                "where", "navigate", "navigation", "find",
                "page", "sidebar", "menu", "how do i use",
                "how do i get to", "where do i go"
            ]
        ):
            dispatcher.utter_message(text=random.choice(navigation_responses))

        else:
            dispatcher.utter_message(text=random.choice(support_responses))

        return []


class ActionChatCompletion(Action):
    def name(self) -> Text:
        return "action_chat_completion"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        intent: Optional[str] = tracker.latest_message.get("intent", {}).get("name")

        out_of_scope = [
            "I’m not fully sure how to help with that yet, but I can support you with stress, anxiety, mood, and general wellness check-ins.",
            "That’s a little outside what I’m built for right now, but I can still help with emotional support, coping ideas, and mental wellness topics.",
            "I may not have the best answer for that yet. I’m better at helping with mood support, stress, anxiety, and simple wellness guidance.",
            "I’m still learning that area, but I can help with mental health support, calming strategies, and check-in style conversations.",
            "That topic is a bit beyond my current scope, but I can help you talk through stress, anxious feelings, sadness, or coping techniques.",
            "I don’t have a strong answer for that right now, though I can help with supportive conversations around emotions and wellness.",
            "I’m not the best fit for that question yet, but I can help with stress relief ideas, grounding exercises, and general emotional support.",
        ]

        greet = [
            "Hi, welcome to MindBridge. I can help you navigate the site, manage appointments, and find reminder features.",
            "Hello! I’m the MindBridge assistant. I can help with website navigation, appointments, reminders, and general platform support.",
            "Hey there! I’m here to help you use MindBridge, whether you need help finding features, booking appointments, or managing reminders.",
            "Hi! I can guide you through MindBridge features like appointments, reminders, and navigating the platform.",
            "Welcome! I’m here to help with MindBridge support, including finding pages, setting up appointments, and using reminders.",
        ]

        gratitude = [
            "You’re welcome. I’m here if you need help finding anything else.",
            "No problem. I’m glad I could help.",
            "Anytime. You can ask me about appointments, mood tracking, resources, or your profile.",
        ]

        if intent == "out_of_scope":
            dispatcher.utter_message(text=random.choice(out_of_scope))

        elif intent == "goodbye":
            dispatcher.utter_message(text="Goodbye! I hope you have a good rest of your day.")

        elif intent == "greet":
            dispatcher.utter_message(text=random.choice(greet))

        elif intent in ["gratitude", "thank_you"]:
            dispatcher.utter_message(text=random.choice(gratitude))

        else:
            dispatcher.utter_message(
                text="I can help with MindBridge navigation, appointments, mood tracking, resources, reminders, and basic wellness support."
            )

        return []