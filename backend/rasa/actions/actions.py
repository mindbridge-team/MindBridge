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
            "I’m glad you said something. If there is any immediate danger, please call emergency services now or reach out to someone nearby who can stay with you. In the U.S., you can call or text 988.",
            "Your safety matters. I can’t handle emergencies, but you should contact a trusted person, emergency services, or 988 in the U.S. if you may hurt yourself or someone else.",
            "This sounds urgent. Please do not stay alone with this. Contact someone you trust right now, or call emergency services if there is immediate danger.",
            "I’m sorry you’re dealing with this. If you might act on these thoughts, call emergency services or contact 988 in the U.S. right now.",
            "I care about your safety. Please pause and reach out to a trusted person or crisis line immediately. In the U.S., call or text 988.",
            "If you feel unsafe, please get immediate help from a trusted person nearby, local emergency services, or 988 in the U.S.",
            "This is more than I can safely support alone. Please contact emergency help or a crisis support line now if there is any chance you may hurt yourself or someone else.",
        ]

        dashboard_responses = [
            "The Dashboard is the main page after you log in. It gives you a quick overview of your mood, upcoming sessions, mood streak, quick links, and featured resources.",
            "Dashboard is your home base in MindBridge. You can use it to quickly log your mood, book a session, and see important information.",
            "You can find Dashboard on the left sidebar. It summarizes your main MindBridge activity in one place.",
            "The Dashboard helps you quickly see what is happening in your account, like mood tracking, sessions, and helpful resources.",
            "Think of the Dashboard as the main control center. It gives you quick access to the most important patient features.",
            "If you are not sure where to start, go to Dashboard first. It usually shows shortcuts to mood tracking, booking, and resources.",
            "Dashboard is useful when you want a quick check of your wellness activity without opening every page separately.",
            "The Dashboard can show your current wellness overview, including recent mood activity and session-related information.",
            "To get to Dashboard, use the left sidebar and click Dashboard. That page is meant to be your starting point.",
            "Dashboard is the first page I would recommend checking because it connects you to the main patient tools.",
        ]

        appointment_responses = [
            "Appointments are handled through **Book Session** on the left sidebar. That is where you go to schedule or view session options.",
            "To find appointments, click **Book Session** in the left menu. Your upcoming sessions may also appear on the Dashboard.",
            "If you want to book or manage a counseling session, go to **Book Session** from the sidebar.",
            "For sessions, click **Book Session** on the left side of the page. After booking, your upcoming session should show on the Dashboard.",
            "The appointment feature is mainly for scheduling counseling sessions. In MindBridge, that is usually under **Book Session**.",
            "Book Session is where patients can start the appointment process with a counselor or available provider.",
            "If you are asking where appointments are located, look for **Book Session** in the sidebar.",
            "If you are trying to schedule help, use **Book Session**. That page is for choosing or managing session times.",
            "Appointments are not usually under Profile or Resources. The correct place is **Book Session**.",
            "Use **Book Session** whenever you want to set up a meeting, check scheduling options, or prepare for a counseling session.",
        ]

        mood_responses = [
            "Mood Tracker is where you can record how you are feeling. You can find it on the left sidebar under **Mood Tracker**.",
            "The Mood Tracker helps you log your mood over time so you can notice patterns in stress, anxiety, sadness, or overall wellness.",
            "To log your mood, click **Mood Tracker** from the sidebar. That page lets you record daily check-ins.",
            "Mood tracking is useful because it helps you and your counselor understand how your emotions change over time.",
            "If you want to check in or record how you feel, go to **Mood Tracker**.",
            "The Mood Tracker is for daily or regular emotional check-ins. It can help you build a history of how you have been doing.",
            "You can use Mood Tracker when you want to quickly save your current mood and reflect on changes later.",
            "Mood Tracker is one of the main patient tools. It helps turn your feelings into a record you can review.",
            "If you are feeling stressed, sad, anxious, or okay, Mood Tracker is where you can log that feeling.",
            "You can access Mood Tracker from the sidebar or sometimes through a Dashboard quick link.",
        ]

        reminder_responses = [
            "Reminders are meant to help you stay consistent with daily check-ins, appointment prep, and wellness routines.",
            "If reminders are enabled, they may help you remember to log your mood, prepare for a session, or complete a check-in.",
            "For reminders, look for reminder or notification settings. They are usually connected to check-ins or wellness habits.",
            "Reminder support can help patients keep up with mood tracking and routine wellness activities.",
            "A reminder is basically a nudge to help you return to the app and complete something important.",
            "If you want help remembering check-ins, reminders are the feature to look for.",
            "Reminders can be useful if you forget to log your mood or want a routine schedule.",
            "MindBridge reminders are meant to support consistency, not replace a counselor or emergency support.",
            "If you are asking where reminders are, check settings, notifications, or any reminder section your team has enabled.",
            "Use reminders for things like mood logs, session preparation, and daily wellness routines.",
        ]

        resource_responses = [
            "Resources are support materials inside MindBridge. You can find them under **Resources** on the left sidebar.",
            "The Resources page can include guides, articles, coping strategies, and other mental health support content.",
            "To find resources, click **Resources** from the sidebar. Featured resources may also appear on your Dashboard.",
            "Resources are helpful when you want support outside of a live counseling session.",
            "The Resources page is where you can look for self-help material, wellness information, or coping tools.",
            "If you want to read or learn about mental health support topics, go to **Resources**.",
            "Resources are not the same as appointments. Resources are usually articles or tools you can use on your own.",
            "Use **Resources** when you want extra support material between sessions.",
            "Resources can help with things like stress management, grounding, coping strategies, and emotional wellness.",
            "If you are unsure what to do next, Resources can be a good place to find helpful mental health information.",
        ]

        profile_responses = [
            "Your Profile is where your account information and personal details should be stored. You can find it on the left sidebar.",
            "To check your account information, click **Profile** from the sidebar.",
            "Profile is the place to review your saved user information and personal details.",
            "The Profile page is mainly for account-related information, not booking or mood tracking.",
            "If you need to check your name, account details, or saved information, go to **Profile**.",
            "Profile helps you manage the personal side of your MindBridge account.",
            "If something about your account looks wrong, Profile is the first place I would check.",
            "You can use Profile to review your information after logging in.",
            "Profile is different from Dashboard. Dashboard is your overview, while Profile is your account details.",
            "If you are asking where your account info is, it should be under **Profile**.",
        ]

        community_responses = [
            "Community is a patient support area for peer or group-based connection features, if your team has enabled them.",
            "The Community page is meant for connection beyond one-on-one sessions. You can find it on the left sidebar.",
            "Community may include shared support spaces, peer interaction, or group-based wellness features depending on what is active in your version.",
            "If you are looking for the Community page, check the left sidebar and click **Community**.",
            "Community is different from Book Session. Book Session is for appointments, while Community is for broader support or connection.",
            "The Community feature is meant to help patients feel less isolated by offering a space for support or shared connection.",
            "If Community is enabled, it can be used for peer support or group-style interaction inside MindBridge.",
            "Community is not emergency support, but it may help users connect with supportive spaces in the platform.",
            "Use Community when you want support beyond resources or individual appointments.",
            "The Community page is one of the main patient sections, along with Dashboard, Book Session, Mood Tracker, Resources, and Profile.",
        ]

        login_responses = [
            "If you are already signed in, you can use the sidebar to navigate. If something looks wrong, try logging out and back in.",
            "For login issues, check that you are signed in. If pages are not loading, logging out and back in may refresh your session.",
            "If your account information is not showing correctly, try signing out and signing in again.",
            "Login is how you access your MindBridge account. After logging in, you should see the patient dashboard and sidebar.",
            "If you cannot access patient features, you may need to log in again.",
            "If login fails, double-check your email, username, or password depending on how the app is set up.",
            "If you recently registered, try signing in with the same account information you used during registration.",
            "If the site looks stuck after login, refresh the page or sign out and back in.",
            "Authentication issues are usually related to expired sessions, wrong credentials, or the backend not responding.",
            "Once you are logged in, you should be able to access Dashboard, Book Session, Mood Tracker, Resources, Community, and Profile.",
        ]

        navigation_responses = [
            "You can use the left sidebar to move around MindBridge. The main pages are Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile.",
            "The left menu is your main navigation. Dashboard is your overview, Book Session is for appointments, Mood Tracker is for mood logs, Resources has support content, and Profile has account info.",
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
            dispatcher.utter_message(text=random.choice(appointment_responses))

        elif intent in ["ask_mood_help", "ask_mood", "mood_help"] or any(
            x in user_text for x in [
                "mood", "moods", "mood tracker", "feeling", "feelings",
                "tracker", "log mood", "log my mood", "check in",
                "check-in", "streak"
            ]
        ):
            dispatcher.utter_message(text=random.choice(mood_responses))

        elif intent in ["ask_resources_help", "ask_resources", "resource_help"] or any(
            x in user_text for x in [
                "resource", "resources", "article", "articles", "guide",
                "guides", "material", "materials", "coping", "self help",
                "self-help"
            ]
        ):
            dispatcher.utter_message(text=random.choice(resource_responses))

        elif intent in ["ask_profile_help", "ask_profile", "profile_help"] or any(
            x in user_text for x in [
                "profile", "account", "settings", "personal info",
                "personal information", "my info"
            ]
        ):
            dispatcher.utter_message(text=random.choice(profile_responses))

        elif intent in ["ask_community_help", "ask_community", "community_help"] or any(
            x in user_text for x in [
                "community", "group", "peer", "support group",
                "community page", "what is community"
            ]
        ):
            dispatcher.utter_message(text=random.choice(community_responses))

        elif intent in ["ask_dashboard_help", "ask_dashboard", "dashboard_help"] or any(
            x in user_text for x in [
                "dashboard", "home page", "homepage", "main page", "overview"
            ]
        ):
            dispatcher.utter_message(text=random.choice(dashboard_responses))

        elif intent in ["ask_reminder_help", "ask_reminder", "reminder_help"] or any(
            x in user_text for x in [
                "reminder", "reminders", "remind", "notification",
                "notifications", "daily check"
            ]
        ):
            dispatcher.utter_message(text=random.choice(reminder_responses))

        elif intent in ["ask_login_help", "ask_login", "login_help"] or any(
            x in user_text for x in [
                "login", "log in", "logout", "log out", "sign in",
                "sign out", "signed in", "password"
            ]
        ):
            dispatcher.utter_message(text=random.choice(login_responses))

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