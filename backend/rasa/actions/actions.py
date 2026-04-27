# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

import os
import re
import random
import requests
from typing import Any, Text, Dict, List, Optional
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, EventType

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
        intent = tracker.latest_message.get("intent", {}).get("name")

        navigation_responses = [
            "I can help you navigate the site. You can check your dashboard, profile, mood logs, appointments, and support features from the main menu.",
            "I’m here to help with the website. If you’re trying to find something like appointments, reminders, or mood tracking, I can point you in the right direction.",
            "I can help you use MindBridge. Common areas include your dashboard, appointment section, reminders, and wellness tracking tools.",
            "If you need help finding a page or feature, I can help guide you through the website step by step.",
            "I can help you navigate the platform. Let me know whether you’re trying to find appointments, reminders, your profile, or mood tracking.",
            "You can use the left sidebar to move around MindBridge. Dashboard shows your overview, Book Session is for appointments, Mood Tracker is for mood logs, Resources has support material, and Profile has your account details.",
            "The main navigation is on the left. Use Dashboard for your summary, Book Session for scheduling, Mood Tracker for check-ins, Resources for helpful content, and Profile for account info.",
            "The sidebar has Dashboard, Book Session, Mood Tracker, Community, Resources, and Profile. Tell me what you are trying to find and I’ll point you there."
        ]

        dashboard_responses = [
            "The Dashboard is your main overview page. It shows things like today’s mood, upcoming sessions, mood streak, quick links, and featured resources.",
            "Use the Dashboard when you want a quick summary of your MindBridge activity, including mood tracking and upcoming sessions.",
            "The Dashboard is the home base. From there, you can quickly log your mood, book a session, or view resources."
        ]

        mood_responses = [
            "To log your mood, go to Mood Tracker or use the quick link on the dashboard. That section should let you record how you’re feeling and track patterns over time.",
            "For mood check-ins, open Mood Tracker from the sidebar. Logging regularly can help you notice trends in stress, anxiety, or overall mood.",
            "You can start with the Mood Tracker page. It is meant for daily check-ins and seeing your mood history.",
            "Mood Tracker is where you can enter how you feel and build a mood history over time.",
            "If you want to track how you’ve been doing, use Mood Tracker from the sidebar or the dashboard quick link."
        ]

        appointment_responses = [
            "I can help with appointments. You should be able to schedule, view, or manage appointments from the appointments section of the site.",
            "If you’re trying to set up an appointment, check the appointments page where booking and management options should be available.",
            "I can help point you to appointment features like booking, viewing upcoming sessions, or checking your schedule.",
            "For appointment support, look for the appointments area in the platform. That is usually where you can create or manage sessions.",
            "I can help with scheduling guidance on the site, such as where to book or review your appointments.",
            "To book a session, choose Book Session from the sidebar or use the dashboard quick link.",
            "Appointments are handled through Book Session. Your dashboard should show upcoming sessions after one is booked."
        ]

        reminder_responses = [
            "I can help with reminders and daily check-ins. You may be able to manage them from your reminders or settings section.",
            "If you want daily reminders, check whether your account settings or reminder area lets you turn them on and customize them.",
            "I can help guide you to reminder features, including daily check-ins and routine notifications.",
            "For reminder support, look for a reminders or settings section where notification preferences can be managed.",
            "I can help with wellness reminders, check-ins, and notification setup through the site’s reminder tools.",
            "Reminders are useful for daily mood check-ins, appointment prep, or building a wellness routine."
        ]

        resource_responses = [
            "Resources is where you can find helpful mental health material, coping strategies, and support information.",
            "Try the Resources section if you want guides, articles, or support tools outside of a live session.",
            "The Resources page is a good place to look for self-help material and wellness support.",
            "Use Resources when you want articles, exercises, or support information that you can review on your own.",
            "Featured resources may also appear on the Dashboard, but the full list should be under Resources."
        ]

        profile_responses = [
            "Profile is where you can check your account information and personal details.",
            "For account-related settings, go to Profile from the sidebar.",
            "Your Profile page should contain your user information and account details.",
            "If you need to review your personal information, start with the Profile page.",
            "Profile is the best place to check your saved account details."
        ]

        community_responses = [
            "The Community section is meant for peer or group-based support features if your team has enabled them.",
            "Use Community if you’re looking for shared support spaces or connection features within MindBridge.",
            "Community should be the place for support beyond one-on-one sessions, depending on what features are currently active."
        ]

        login_responses = [
            "If you’re already signed in, you can use the sidebar to move around the app. If something looks wrong, logging out and back in can sometimes refresh your session.",
            "For account access issues, try checking whether you are logged in, then use the logout button and sign in again if needed.",
            "If a page is not loading your information, your session may need to refresh. Logging out and back in can help."
        ]

        support_responses = [
            "I’m here with you. Try taking one slow breath in, holding briefly, and breathing out slowly. What is the main thing bothering you right now?",
            "That sounds difficult. A good first step is naming what you’re feeling: stressed, anxious, sad, overwhelmed, or something else.",
            "I can help you slow things down. What happened, and what feeling is strongest right now?",
            "You don’t have to figure everything out at once. Let’s focus on one thing you’re dealing with right now.",
            "I can listen and help you organize what you’re feeling. What has been weighing on you the most today?",
            "Let’s take it one step at a time. Is this more about stress, anxiety, sadness, relationships, school, or something else?",
            "I’m not a replacement for a counselor, but I can help you reflect, calm down, and decide what next step might help."
        ]

        if intent in ["ask_navigation", "website_help"] or any(x in user_text for x in ["where", "navigate", "find", "page", "sidebar", "menu", "how do i use"]):
            dispatcher.utter_message(text=random.choice(navigation_responses))

        elif intent == "crisis":
            responses = [
                "I’m really sorry you’re feeling this way. I can’t provide emergency support, but you should contact a trusted person right now or call emergency services if you might hurt yourself or someone else. If you are in the U.S., you can call or text 988 for immediate crisis support.",
                "This sounds serious, and you deserve immediate help. Please reach out to someone you trust now, or call emergency services if there is any immediate danger. In the U.S., call or text 988 for the Suicide & Crisis Lifeline.",
                "I’m concerned about your safety. Please do not handle this alone. Contact a trusted person, local emergency services, or call/text 988 in the U.S. for crisis support."
            ]
            dispatcher.utter_message(text=random.choice(responses))
            return []

        elif intent in ["ask_dashboard", "dashboard_help"] or "dashboard" in user_text:
            dispatcher.utter_message(text=random.choice(dashboard_responses))

        elif intent in ["ask_mood", "mood_help"] or any(x in user_text for x in ["mood", "feeling", "tracker", "log my mood", "check in", "check-in"]):
            dispatcher.utter_message(text=random.choice(mood_responses))

        elif intent in ["ask_appointment", "appointment_help"] or any(x in user_text for x in ["appointment", "book", "session", "schedule", "counselor", "counsellor"]):
            dispatcher.utter_message(text=random.choice(appointment_responses))

        elif intent in ["ask_reminder", "reminder_help"] or any(x in user_text for x in ["reminder", "remind", "notification", "daily check"]):
            dispatcher.utter_message(text=random.choice(reminder_responses))

        elif intent in ["ask_resources", "resource_help"] or any(x in user_text for x in ["resource", "resources", "article", "guide", "helpful material"]):
            dispatcher.utter_message(text=random.choice(resource_responses))

        elif intent in ["ask_profile", "profile_help"] or any(x in user_text for x in ["profile", "account", "settings", "personal info"]):
            dispatcher.utter_message(text=random.choice(profile_responses))

        elif intent in ["ask_community", "community_help"] or any(x in user_text for x in ["community", "group", "peer"]):
            dispatcher.utter_message(text=random.choice(community_responses))

        elif intent in ["ask_login", "login_help"] or any(x in user_text for x in ["login", "log in", "logout", "log out", "sign in", "signed in"]):
            dispatcher.utter_message(text=random.choice(login_responses))

        else:
            dispatcher.utter_message(text=random.choice(support_responses))

        return []

class ActionChatCompletion(Action):

     def name(self) -> Text:
         return "action_chat_completion"

     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
         intent: Optional[str] = tracker.latest_message.get("intent", {}).get("name")

         out_of_scope =[
            "I’m not fully sure how to help with that yet, but I can support you with stress, anxiety, mood, and general wellness check-ins.",
            "That’s a little outside what I’m built for right now, but I can still help with emotional support, coping ideas, and mental wellness topics.",
            "I may not have the best answer for that yet. I’m better at helping with mood support, stress, anxiety, and simple wellness guidance.",
            "I’m still learning that area, but I can help with mental health support, calming strategies, and check-in style conversations.",
            "That topic is a bit beyond my current scope, but I can help you talk through stress, anxious feelings, sadness, or coping techniques.",
            "I don’t have a strong answer for that right now, though I can help with supportive conversations around emotions and wellness.",
            "I’m not the best fit for that question yet, but I can help with stress relief ideas, grounding exercises, and general emotional support."]
         greet = [
            "Hi, welcome to MindBridge. I can help you navigate the site, manage appointments, and find reminder features.",
            "Hello! I’m the MindBridge assistant. I can help with website navigation, appointments, reminders, and general platform support.",
            "Hey there! I’m here to help you use MindBridge, whether you need help finding features, booking appointments, or managing reminders.",
            "Hi! I can guide you through MindBridge features like appointments, reminders, and navigating the platform.",
            "Welcome! I’m here to help with MindBridge support, including finding pages, setting up appointments, and using reminders."
         ]
         

        # Handles out of scope where chatbot doesn't know or is confused
         if intent == "out_of_scope":
             chosen_response = random.choice(out_of_scope)
             dispatcher.utter_message(text=chosen_response)

        # Saying goodbye to user
         elif intent == "goodbye":
             dispatcher.utter_message(text="Goodbye! I hope you have a good rest of your day")
        
        # Greeting the user
         elif intent == "greet":
             chosen_response = random.choice(greet)
             dispatcher.utter_message(text=chosen_response) 
         return []
