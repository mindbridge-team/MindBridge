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



out_of_scope =[
            "I’m not fully sure how to help with that yet, but I can support you with stress, anxiety, mood, and general wellness check-ins.",
            "That’s a little outside what I’m built for right now, but I can still help with emotional support, coping ideas, and mental wellness topics.",
            "I may not have the best answer for that yet. I’m better at helping with mood support, stress, anxiety, and simple wellness guidance.",
            "I’m still learning that area, but I can help with mental health support, calming strategies, and check-in style conversations.",
            "That topic is a bit beyond my current scope, but I can help you talk through stress, anxious feelings, sadness, or coping techniques.",
            "I don’t have a strong answer for that right now, though I can help with supportive conversations around emotions and wellness.",
            "I’m not the best fit for that question yet, but I can help with stress relief ideas, grounding exercises, and general emotional support."
]

class ActionChatCompletion(Action):

     def name(self) -> Text:
         return "action_chat_completion"

     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
         intent: Optional[str] = tracker.latest_message.get("intent", {}).get("name")

         if intent == "out_of_scope":
             chosen_response = random.choice(out_of_scope)
             dispatcher.utter_message(text=chosen_response)
        

         return []
