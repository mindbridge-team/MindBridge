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

        def is_where_question(text: str) -> bool:
            where_words = [
                "where", "located", "find", "go to", "get to",
                "open", "show me", "navigate", "navigation"
            ]
            return any(word in text for word in where_words)

        def is_what_question(text: str) -> bool:
            what_words = [
                "what is", "what are", "what does", "explain",
                "tell me about", "what can i do", "how does"
            ]
            return any(word in text for word in what_words)

        def choose_response(location_responses, explanation_responses, general_responses):
            if is_where_question(user_text):
                return random.choice(location_responses)
            if is_what_question(user_text):
                return random.choice(explanation_responses)
            return random.choice(general_responses)

        crisis_keywords = [
            "kill myself", "suicide", "end my life", "hurt myself",
            "self harm", "self-harm", "cut myself", "i want to die",
            "i don't want to live", "i dont want to live", "overdose",
            "hurt someone", "harm someone", "i want to hurt someone",
            "i might hurt someone", "going to hurt someone",
            "i want to hurt myself", "i might hurt myself"
        ]

        crisis_responses = [
            "I’m really sorry you’re feeling this way. I can’t provide emergency support, but you should contact a trusted person right now or call emergency services if you might hurt yourself or someone else. If you are in the U.S., you can call or text 988 for immediate crisis support.",
            "This sounds serious, and you deserve immediate help. Please reach out to someone you trust now, or call emergency services if there is any immediate danger. In the U.S., call or text 988 for the Suicide & Crisis Lifeline.",
            "I’m concerned about your safety. Please do not handle this alone. Contact a trusted person, local emergency services, or call/text 988 in the U.S. for crisis support.",
            "Your safety matters. I can’t handle emergencies, but you should contact a trusted person, emergency services, or 988 in the U.S. if you may hurt yourself or someone else.",
            "This sounds urgent. Please do not stay alone with this. Contact someone you trust right now, or call emergency services if there is immediate danger.",
            "If you feel unsafe, please get immediate help from a trusted person nearby, local emergency services, or 988 in the U.S.",
        ]

        dashboard_location = [
            "The Dashboard is on the left sidebar. Click **Dashboard** to return to your main overview page.",
            "You can find Dashboard in the left navigation menu. It is usually the main page after you log in.",
            "To open Dashboard, use the sidebar and select **Dashboard**.",
            "Dashboard should be one of the main sidebar options, usually near the top.",
        ]

        dashboard_explanation = [
            "The Dashboard is your main overview page. It shows things like mood activity, upcoming sessions, quick links, and featured resources.",
            "Dashboard is your home base in MindBridge. It helps you quickly access mood tracking, booking, resources, and account activity.",
            "The Dashboard summarizes your patient activity so you do not have to open every section separately.",
            "Think of Dashboard as the control center for the patient side of MindBridge.",
        ]

        dashboard_general = dashboard_location + dashboard_explanation + [
            "If you are not sure where to start, Dashboard is usually the best first page to check.",
            "Dashboard connects you to the main patient tools like Book Session, Mood Tracker, Resources, and Profile.",
        ]

        appointment_location = [
            "Appointments are under **Book Session** on the left sidebar.",
            "To find appointments, click **Book Session** in the left menu.",
            "If you want to schedule a counseling session, go to **Book Session** from the sidebar.",
            "Appointment booking is handled through **Book Session**, not Profile or Resources.",
        ]

        appointment_explanation = [
            "Appointments are counseling sessions that patients can schedule through the **Book Session** page.",
            "The appointment feature is for booking, viewing, or managing sessions with a counselor or provider.",
            "**Book Session** is the appointment area of MindBridge. It is where patients start the scheduling process.",
            "Appointments help connect patients with support through scheduled sessions.",
        ]

        appointment_general = appointment_location + appointment_explanation + [
            "After booking, your upcoming session may also appear on the Dashboard.",
            "Use **Book Session** whenever you want to set up a meeting, check scheduling options, or prepare for a counseling session.",
        ]

        mood_location = [
            "Mood tracking is under **Mood Tracker** on the left sidebar.",
            "To log your mood, click **Mood Tracker** from the sidebar.",
            "You can access Mood Tracker from the left menu, and sometimes through a Dashboard quick link.",
            "If you want to record how you feel, go to **Mood Tracker**.",
        ]

        mood_explanation = [
            "Mood Tracker is where you record how you are feeling over time.",
            "The Mood Tracker helps you notice patterns in stress, anxiety, sadness, or overall wellness.",
            "Mood tracking is useful because it creates a history of your emotional check-ins.",
            "The Mood Tracker is for daily or regular emotional check-ins.",
        ]

        mood_general = mood_location + mood_explanation + [
            "If you are feeling stressed, sad, anxious, or okay, Mood Tracker is where you can log that feeling.",
            "Mood Tracker can help you and a counselor better understand changes in your emotions over time.",
        ]

        reminder_location = [
            "If reminders are enabled, they should be in the reminders, notification, or settings area.",
            "For reminders, check the reminder or notification settings in the app.",
            "If your version has reminders, look for reminder settings connected to check-ins or wellness routines.",
            "Reminder options may appear in settings or a reminders section depending on how your team built the page.",
        ]

        reminder_explanation = [
            "Reminders are meant to help you stay consistent with mood check-ins, appointment prep, and wellness routines.",
            "A reminder is basically a nudge to help you return to the app and complete something important.",
            "Reminders can help you remember to log your mood or prepare for a session.",
            "MindBridge reminders support consistency, but they do not replace counselor or emergency support.",
        ]

        reminder_general = reminder_location + reminder_explanation + [
            "Use reminders for things like mood logs, session preparation, and daily wellness routines.",
            "Reminder support can help patients keep up with regular wellness habits.",
        ]

        resource_location = [
            "Resources are under **Resources** on the left sidebar.",
            "To find resources, click **Resources** from the sidebar.",
            "Featured resources may also appear on your Dashboard, but the main page is **Resources**.",
            "If you want support materials, go to the **Resources** page.",
        ]

        resource_explanation = [
            "Resources are support materials inside MindBridge, like guides, articles, coping strategies, or wellness content.",
            "The Resources page gives you mental health support material you can use outside of a live session.",
            "Resources are not appointments. They are articles, guides, or tools you can review on your own.",
            "Resources can help with stress management, grounding, coping strategies, and emotional wellness.",
        ]

        resource_general = resource_location + resource_explanation + [
            "Use **Resources** when you want extra support material between sessions.",
            "If you are unsure what to do next, Resources can be a good place to find helpful mental health information.",
        ]

        profile_location = [
            "Your Profile is on the left sidebar under **Profile**.",
            "To check your account information, click **Profile** from the sidebar.",
            "If you are looking for account details, go to **Profile**.",
            "Profile should be in the main sidebar with Dashboard, Book Session, Mood Tracker, Resources, and Community.",
        ]

        profile_explanation = [
            "Profile is where your account information and personal details should be stored.",
            "The Profile page is mainly for account-related information, not booking or mood tracking.",
            "Profile helps you manage the personal side of your MindBridge account.",
            "Profile is different from Dashboard. Dashboard is your overview, while Profile is your account details.",
        ]

        profile_general = profile_location + profile_explanation + [
            "If something about your account looks wrong, Profile is the first place I would check.",
            "You can use Profile to review your information after logging in.",
        ]

        community_location = [
            "The Community page is on the left sidebar. Click **Community** to open it.",
            "You can find Community in the left navigation menu with Dashboard, Book Session, Mood Tracker, Resources, and Profile.",
            "To get to Community, use the sidebar and select **Community**.",
            "If you are looking for the Community page, check the left sidebar and click **Community**.",
        ]

        community_explanation = [
            "Community is a patient support area for peer or group-based connection features, if your team has enabled them.",
            "The Community page is meant for support and connection beyond one-on-one sessions.",
            "Community may include shared support spaces, peer interaction, or group-based wellness features depending on what is active.",
            "Community is different from Book Session. Book Session is for appointments, while Community is for broader support or connection.",
        ]

        community_general = community_location + community_explanation + [
            "Community can help patients feel less isolated by offering a space for support or shared connection.",
            "Community is not emergency support, but it may help users connect with supportive spaces in the platform.",
        ]

        login_location = [
            "Login is usually on the main sign-in page before entering the patient dashboard.",
            "If you are logged out, use the login page to access your MindBridge account.",
            "After logging in, you should see the patient dashboard and sidebar.",
            "If you need to sign out, look for the logout option in the account or navigation area.",
        ]

        login_explanation = [
            "Login is how you access your MindBridge account and patient features.",
            "Authentication protects your account so only you can access your saved information.",
            "If your session expires, you may need to log in again.",
            "If login fails, it may be caused by wrong credentials, expired session, or the backend not responding.",
        ]

        login_general = login_location + login_explanation + [
            "If the site looks stuck after login, refresh the page or sign out and back in.",
            "Once you are logged in, you should be able to access Dashboard, Book Session, Mood Tracker, Resources, Community, and Profile.",
        ]

        navigation_responses = [
            "You can use the left sidebar to move around MindBridge. The main pages are Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile.",
            "The left menu is your main navigation. Dashboard is your overview, Book Session is for appointments, Mood Tracker is for mood logs, Resources has support content, Community is for support connection, and Profile has account info.",
            "I can help you navigate MindBridge. Tell me the page you want, like Book Session, Mood Tracker, Resources, Profile, Community, or Dashboard.",
            "The sidebar has Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile. Pick the feature you need and I’ll point you there.",
            "If you are looking for a feature, start with the left sidebar. Most patient tools are listed there.",
            "Navigation means moving between pages. In MindBridge, the sidebar is the main way to do that.",
            "For appointments, go to Book Session. For mood logs, go to Mood Tracker. For reading support materials, go to Resources.",
            "If you are not sure where something is, ask me the page name and I can point you to the correct section.",
            "Most patient tools are grouped in the sidebar, including Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile.",
            "The fastest way to find a MindBridge feature is usually the left sidebar menu.",
        ]

        support_responses = [
            "I’m here with you. Try taking one slow breath in, holding briefly, and breathing out slowly. What is the main thing bothering you right now?",
            "That sounds difficult. A good first step is naming what you’re feeling: stressed, anxious, sad, overwhelmed, or something else.",
            "I can help you slow things down. What happened, and what feeling is strongest right now?",
            "You don’t have to figure everything out at once. Let’s focus on one thing you’re dealing with right now.",
            "I can listen and help you organize what you’re feeling. What has been weighing on you the most today?",
            "Let’s take it one step at a time. Is this more about stress, anxiety, sadness, relationships, school, or something else?",
            "I’m not a replacement for a counselor, but I can help you reflect, calm down, and decide what next step might help.",
            "If things feel overwhelming, try focusing on one small next step instead of solving everything at once.",
            "It can help to describe the situation in one sentence first. What happened today?",
            "I can help with basic wellness support, grounding ideas, and finding the right MindBridge feature.",
        ]

        if intent == "crisis" or any(word in user_text for word in crisis_keywords):
            dispatcher.utter_message(text=random.choice(crisis_responses))
            return []

        elif intent in ["ask_appointment_help", "ask_appointment", "appointment_help"] or any(
            x in user_text for x in [
                "appointment", "appointments", "appoint", "appoints",
                "book", "booking", "book session", "session", "sessions",
                "schedule", "scheduling", "counselor", "counsellor",
                "therapy", "therapist"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(appointment_location, appointment_explanation, appointment_general)
            )

        elif intent in ["ask_mood_help", "ask_mood", "mood_help"] or any(
            x in user_text for x in [
                "mood", "moods", "mood tracker", "feeling", "feelings",
                "tracker", "log mood", "log my mood", "check in",
                "check-in", "streak"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(mood_location, mood_explanation, mood_general)
            )

        elif intent in ["ask_resources_help", "ask_resources", "resource_help"] or any(
            x in user_text for x in [
                "resource", "resources", "article", "articles", "guide",
                "guides", "material", "materials", "coping", "self help",
                "self-help"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(resource_location, resource_explanation, resource_general)
            )

        elif intent in ["ask_profile_help", "ask_profile", "profile_help"] or any(
            x in user_text for x in [
                "profile", "account", "settings", "personal info",
                "personal information", "my info"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(profile_location, profile_explanation, profile_general)
            )

        elif intent in ["ask_community_help", "ask_community", "community_help"] or any(
            x in user_text for x in [
                "community", "group", "peer", "support group",
                "community page", "what is community"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(community_location, community_explanation, community_general)
            )

        elif intent in ["ask_dashboard_help", "ask_dashboard", "dashboard_help"] or any(
            x in user_text for x in [
                "dashboard", "home page", "homepage", "main page", "overview"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(dashboard_location, dashboard_explanation, dashboard_general)
            )

        elif intent in ["ask_reminder_help", "ask_reminder", "reminder_help"] or any(
            x in user_text for x in [
                "reminder", "reminders", "remind", "notification",
                "notifications", "daily check"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(reminder_location, reminder_explanation, reminder_general)
            )

        elif intent in ["ask_login_help", "ask_login", "login_help"] or any(
            x in user_text for x in [
                "login", "log in", "logout", "log out", "sign in",
                "sign out", "signed in", "password"
            ]
        ):
            dispatcher.utter_message(
                text=choose_response(login_location, login_explanation, login_general)
            )

        elif intent in ["ask_website_help", "ask_navigation", "website_help"] or any(
            x in user_text for x in [
                "where", "navigate", "navigation", "find", "page",
                "sidebar", "menu", "how do i use", "how do i get to",
                "where do i go"
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
            "That’s a little outside what I’m built for right now, but I can still help with emotional support, coping ideas, and MindBridge navigation.",
            "I may not have the best answer for that yet. I’m better at helping with mood support, stress, anxiety, appointments, and resources.",
            "I’m still learning that area, but I can help with mental health support, calming strategies, and check-in style conversations.",
            "That topic is outside my current scope, but I can help you find MindBridge features like Book Session, Mood Tracker, Resources, or Profile.",
            "I don’t have a strong answer for that right now, though I can help with supportive conversations around emotions and wellness.",
            "I’m not the best fit for that question, but I can help with stress relief ideas, grounding exercises, and general emotional support.",
            "I’m mainly here for MindBridge support and wellness guidance. Try asking about appointments, mood tracking, resources, or reminders.",
            "I can’t really help with that topic, but I can help you use MindBridge or talk through how you’re feeling.",
            "That’s outside my role as the MindBridge assistant. I can help with navigation, sessions, mood logs, and wellness support.",
        ]

        greet = [
            "Hi, welcome to MindBridge. I can help you navigate the site, manage appointments, and find reminder features.",
            "Hello! I’m the MindBridge assistant. I can help with website navigation, appointments, reminders, and general platform support.",
            "Hey there! I’m here to help you use MindBridge, whether you need help finding features, booking appointments, or managing reminders.",
            "Hi! I can guide you through MindBridge features like appointments, reminders, and navigating the platform.",
            "Welcome! I’m here to help with MindBridge support, including finding pages, setting up appointments, and using reminders.",
            "Hi there. You can ask me about MindBridge features like Book Session, Mood Tracker, Resources, Community, or Profile.",
            "Hello, I’m here to help you use MindBridge and find the right patient tools.",
            "Hey! I can help with navigation, mood tracking, appointments, reminders, resources, and basic wellness support.",
            "Welcome back. Tell me what you are trying to do in MindBridge and I’ll point you in the right direction.",
            "Hi! I can help you understand what each MindBridge page does and where to find it.",
        ]

        gratitude = [
            "You’re welcome. I’m here if you need help finding anything else.",
            "No problem. I’m glad I could help.",
            "Anytime. You can ask me about appointments, mood tracking, resources, or your profile.",
            "You’re welcome. I can also help you find Book Session, Mood Tracker, Resources, Community, or Profile.",
            "Glad I could help. Let me know what you want to find next.",
            "Of course. I’m here to help you navigate MindBridge.",
            "Happy to help. You can ask me about sessions, mood logs, reminders, or resources.",
            "No worries. I’m here if you need more support.",
            "You got it. I can help with anything on the MindBridge site.",
            "Absolutely. I’m here whenever you need help using the platform.",
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
                text="I can help with MindBridge navigation, appointments, mood tracking, resources, reminders, community, profile, and basic wellness support."
            )

        return []