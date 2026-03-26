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



class ActionWebsiteHelp(Action):
    def name(self) -> Text:
        return "action_website_help"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any],) -> List[Dict[Text, Any]]:

        responses = [
            "I can help you navigate the site. You can check your dashboard, profile, mood logs, appointments, and support features from the main menu.",
            "I’m here to help with the website. If you’re trying to find something like appointments, reminders, or mood tracking, I can point you in the right direction.",
            "I can help you use MindBridge. Common areas include your dashboard, appointment section, reminders, and wellness tracking tools.",
            "If you need help finding a page or feature, I can help guide you through the website step by step.",
            "I can help you navigate the platform. Let me know whether you’re trying to find appointments, reminders, your profile, or mood tracking."
        ]

        dispatcher.utter_message(text=random.choice(responses))
        return []


class ActionAppointmentHelp(Action):
    def name(self) -> Text:
        return "action_appointment_help"

    def run(self,dispatcher: CollectingDispatcher,tracker: Tracker, domain: Dict[Text, Any],) -> List[Dict[Text, Any]]:

        responses = [
            "I can help with appointments. You should be able to schedule, view, or manage appointments from the appointments section of the site.",
            "If you’re trying to set up an appointment, check the appointments page where booking and management options should be available.",
            "I can help point you to appointment features like booking, viewing upcoming sessions, or checking your schedule.",
            "For appointment support, look for the appointments area in the platform. That is usually where you can create or manage sessions.",
            "I can help with scheduling guidance on the site, such as where to book or review your appointments."
        ]

        dispatcher.utter_message(text=random.choice(responses))
        return []


class ActionReminderHelp(Action):
    def name(self) -> Text:
        return "action_reminder_help"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any],) -> List[Dict[Text, Any]]:

        responses = [
            "I can help with reminders and daily check-ins. You may be able to manage them from your reminders or settings section.",
            "If you want daily reminders, check whether your account settings or reminder area lets you turn them on and customize them.",
            "I can help guide you to reminder features, including daily check-ins and routine notifications.",
            "For reminder support, look for a reminders or settings section where notification preferences can be managed.",
            "I can help with wellness reminders, check-ins, and notification setup through the site’s reminder tools."
        ]

        dispatcher.utter_message(text=random.choice(responses))
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
