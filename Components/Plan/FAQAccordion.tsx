import React, { useState } from "react";
import { View, Text as RNText, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import fonts from '../../assets/fonts/fonts.js';

export default function FAQAccordion() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const data = [
    {
      question: "How do you access the yard?",
      answer:
        "You can let us know the best way to access your yard, or schedule an initial visit with you (and your dog!) to work it out together. This visit helps us plan safe access, and it’s a great chance to meet your lovely dog(s) and say hello!",
    },
    {
      question: "Do I need to be home during service?",
      answer:
        "Nope! You don’t need to be home. We’ll knock on the door and say hi if you are, but if not, that’s no problem at all. As long as we have your instructions for accessing the yard, we’ll get straight to work and tidy things up.",
    },
    /*
    {
      question: "How do you repair lawn on initial visit?",
      answer:
        "We remove dead grass, take a soil tests to check pH & N levels, improve soil with lime and gypsum, add fresh topsoil, apply seed and starter fertiliser, and water with safe-for-pet products — plus we supply a hose timer for the first 2 weeks to ensure strong grass growth.",
    },
    */
    {
      question: "How often do you treat the lawn?",
      answer:
        "We apply a soil neutraliser as required, usualy every 4 - 6 weeks. This is complemented by weekly or twice-weekly deodorising treatments to maintain a lush, healthy, and fresh-smelling lawn.",
    },
    /*
    {
      question: "Will soil neutraliser prevent burn?",
      answer:
        "Yes — our mix of lime, soil neutraliser, and gypsum helps balance your soil and reduce urine damage. But the secret to a spot-free lawn is watering! Giving the grass a quick rinse before and after your dog wees helps wash away salts and protect your lawn. We’ll give you a simple set up for an auto-sprinkler system to make it easy to keep your grass green and healthy.",
    },
    */
    {
      question: "Is what you use safe for kids/pets?",
      answer:
        "Absolutely! All our deodorising sprays and soil treatments are pet-and-child-safe, so you can enjoy a clean lawn worry-free. We use 'Simple Green' Outdoor Odor Eliminator which is specifically designed for use around pets. And for the soil nueatriliser we use 'Daltons' Gypsum Clay Breaker And Soil Conditioner -improves soil structure, helps neutralize salts from dog urine, and is safe for pets when applied as directed",
    },
    {
      question: "How many dogs can an owner have?",
      answer:
        "It depends on the breed and yard size, but we love all dogs — big or small. Sign up and we’ll chat through the details to make sure the plan suits your household.",
    },
    {
      question: "What happens if my dog is outside?",
      answer:
        "That’s up to you — some dogs are totally fine with us around, others prefer space. We can sort that out during the initial visit and always prioritise your dog’s safety and comfort.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Absolutely. You can cancel anytime through the app — no long-term commitments.",
    },
    {
      question: "What if weather is bad?",
      answer:
        "Rain or shine, we do our best to stick to schedule. If conditions are extreme and we can’t complete the service, we’ll notify you and reschedule. If it’s a rainy day when your soil neutraliser is scheduled, we’ll still come for the cleanup and odour spray, and reschedule the soil treatment for our next visit.",
    },
    {
      question: "Is the service hygienic?",
      answer:
        "Totally. We use clean tools for each yard and follow strict hygiene practices — your yard (and your dog) are safe with us.",
    },
    {
      question: "What happens on a public holiday?",
      answer: "If your regular pickup/odour spray is on a Friday public holiday, we’ll come on Thursday instead. If it’s on a Monday public holiday, we’ll be there on Tuesday. For a Wednesday public holiday, we’ll let you know at least 48 hours in advance whether your pickup will be on Tuesday or Thursday.",
    },
    {
      question: "What if my Doozy is away?",
      answer: "On the rare occasion your Doozy is sick or unavailable, don’t worry — you’ll be fully refunded for that pickup.",
    },
    {
      question: "Can I cancel a scheduled service?",
      answer: "Sure! You can cancel anytime through the app — just make sure it’s at least 48 hours before your scheduled pickup. You will get a full refund if we are notified 48 hours before the service.",
    },
  ];

  return (
    <View className="p-4 bg-white" style={{ paddingBottom: 60 }}>
      <View style={{ paddingTop: 0, paddingBottom: 40 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
          Frequently Asked Questions
        </RNText>
      </View>

      {data.map((item, index) => (
        <View key={index}>
          <Pressable
            onPress={() => toggleAccordion(index)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#eeeeee",
              borderRadius: 5,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 4,
            }}
          >
            <RNText
              style={{
                fontFamily: fonts.bold,
                fontSize: 16,
                color: "#777777",
                flex: 1,
                marginRight: 8,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.question}
            </RNText>

            <MaterialIcons
              name={expandedIndex === index ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#195E4B"
            />
          </Pressable>

          {expandedIndex === index && (
            <View className="bg-gray-100 rounded-lg px-4 py-3 mb-4">
              <RNText
                style={{
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  color: "#777777",
                  lineHeight: 20,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
              >
                {item.answer}
              </RNText>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
