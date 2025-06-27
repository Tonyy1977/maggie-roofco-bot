const qaData = [
  {
  question: [
    "tour",
    "schedule a tour",
    "when can i tour",
    "home tour",
    "how do i schedule a tour"
  ],
  keywords: ["tour", "schedule", "visit", "home"],
  answer: [
    "Are you asking about when you can tour the property, how to schedule, or what to expect during the tour? Please pick one or ask more specifically.",
  ],
  followUps: {
    "when can i tour": "You can schedule a tour anytime using the link below.",
    "how do i schedule a tour": "Please use this link to schedule your tour: <a href=\"https://ddtenterprise.org/schedule-a-tour/\" target=\"_blank\">Schedule a Tour</a>",
    "what to expect during tour": "During the tour, you can see all the features of the property and ask any questions you may have.",
  },
},

  {
  question: [
    "payment",
    "how do i pay",
    "pay rent",
    "payment methods",
    "pay online",
  ],
  keywords: ["payment", "pay", "online", "methods"],
  answer: [
    "Are you asking about how to pay rent, payment deadlines, or payment issues? Please select one or ask more specifically.",
  ],
  followUps: {
    "how do i pay rent": "You can pay rent online through the Resident Portal using debit or credit card.",
    "when is payment due": "Rent payment is due on the 5th of each month. Late fees apply after that date.",
    "what payment methods are accepted": "We accept debit cards, credit cards, and bank transfers through the Resident Portal.",
  },
},

{
  question: [
    "inspection",
    "move-in inspection",
    "home inspection",
    "inspection deadline",
    "inspection process",
  ],
  keywords: ["inspection", "move-in", "deadline", "process"],
  answer: [
    "Are you asking about move-in inspection deadlines, process, or scheduling? Please select one or ask more specifically.",
  ],
  followUps: {
    "when do i need to complete move-in inspection": "You need to complete the move-in inspection within 5 business days after moving in.",
    "how often are inspections done": "DDT conducts an annual inspection and a semi-annual inspection during your lease.",
    "what is the inspection process": "During inspection, we assess the condition of the property and any reported maintenance issues.",
  },
},

  {
  question: [
    "rent",
    "payment",
    "house rent",
    "miss rent",
  ],
  keywords: ["rent", "payment", "house", "miss"],
  answer: [
    "Are you asking about when rent is due, how to pay rent, or what happens if you miss rent? Please select one or ask more specifically.",
  ],
  followUps: {
    "when is rent due": [
      "Rent is due on the 5th of each month. Late fees apply after that.",
      "The late fee of $10 per day rent is late.",
    ],
    "how do i pay rent": [
      "You can pay rent online through the Resident Portal.",
    ],
    "what happens if i miss rent": [
      "If you miss rent, you will be issued a 21 day eviction notice.",
      " In your lease, it states if a problem is not rectified within 21 days, that the home can be re-leased to a paying tenant.",
    ],
  },
},

  {
    question: [
      "What are your rental requirements?",
      "What do I need to qualify?",
      "Can I tour the Norfolk unit? What do you look for in a tenant?",
      "What’s needed to rent?",
    ],
    keywords: ["rental", "requirements", "qualify", "tenant", "tour", "rent"],
    answer: [
      "We conduct a best fit assessment based off all applicants. The requirements are:\n625 minimum credit score, Monthly income is 2.5 x rent, Background check, No previous evictions.",
    ],
  },
  {
    question: [
      "When can I tour the property?",
      "How do I schedule a tour?",
      "I wanna come see the house — when works?",
      "When is the tour available?",
    ],
    keywords: ["tour", "schedule", "visit", "see", "home"],
    answer: [
      "Perfect, we are excited about conducting your tour. Please confirm the date and time that works best for you with the link provided below.",
      "Please state what feature of the home stood out most to you?<a href=\"https://ddtenterprise.org/schedule-a-tour/\" target=\"_blank\">Schedule a Tour</a>",
    ],
  },
  {
    question: [
      "I just applied. What now?",
      "I finished my application — what’s next?",
      "What happens after submitting the application?",
    ],
    keywords: ["apply", "submitted", "next step"],
    answer: [
      "Thank you for submitting your application. Are you interested in scheduling a tour of the home to determine if it's a great fit for you? If so, please select a date and time that works best using the link below.",
      "<a href=\"https://ddtenterprise.org/schedule-a-tour/\" target=\"_blank\">Schedule a Tour</a>",
    ],
  },
  {
    question: [
      "I paid the deposit — what now?",
      "What happens after I send the deposit?",
    ],
    keywords: ["deposit paid", "payment", "security paid", "paid"],
    answer: [
      "I will place the home off the market now that the security deposit is paid. From there I will send you an email explaining follow-on instructions which will include a welcome letter, Move-in Inspection Document, and utilities transfer document.",
    ],
  },
  {
    question: [
      "When do I get my deposit back?",
      "How long to return deposit?",
      "Will I get my deposit back?",
    ],
    keywords: ["deposit return", "refund", "return", "security return"],
    answer: [
      "At DDT Enterprise we state that security deposits will be returned no later than (30) days after your move out date. An inspection and neccesary repairs needs to be conducted prior to supporting the return of your deposit.",
    ],
  },
  {
    question: [
      "When will I find out if I’m selected for the home?",
      "How do I know if I got the rental?",
    ],
    keywords: ["selected", "rental", "application status", "approval"],
    answer: [
      "DDT will decide based on a best fit assessment along with the prerequisite requirements.",
    ],
  },
  {
    question: [
      "When will I get the keys?",
      "How do I access the house on move-in day?",
    ],
    keywords: ["keys", "key", "access", "entry"],
    answer: [
      "All homes managed by DDT Enterprise are encrypted with padded Electrical Locks. Once the pro-rated/1st month’s rent is paid, 4 hours prior to your move-in time (4:00 pm), you will receive the code to allot for your move-in.",
    ],
  },
  {
    question: [
      "I missed my tour — can I reschedule?",
      "I wasn’t able to make my appointment. Can I set another time?",
    ],
    keywords: ["reschedule", "tour", "appointment", "change"],
    answer: [
      "Certainly, please choose a time that works with your schedule using the link below.",
      "<a href=\"https://ddtenterprise.org/schedule-a-tour/\" target=\"_blank\">Schedule a Tour</a>",
    ],
  },
  {
    question: [
      "Why wasn’t I chosen for the unit?",
      "Is there a reason I didn’t get approved?",
    ],
    keywords: ["not chosen", "rejected", "denied", "approval"],
    answer: [
      "At DDT Enterprise we conduct a best fit assessment based off all applicants. We chose an applicant we felt suited the home in a more extremis situation. I will keep you in mind when our next rental comes available. Please sign up for our waitlist.",
    ],
  },
  {
    question: [
      "After the tour, when can I move in?",
      "When would I start the lease if approved?",
    ],
    keywords: ["move in", "lease start", "after tour"],
    answer: [
      "It was great conducting a tour with you today, what would be your projected move-in date in the event you were selected?",
    ],
  },
  {
    question: [
      "There’s a leak, and my stuff is damaged. What should I do?",
      "Water damage ruined my items, who’s responsible?",
    ],
    keywords: ["leak", "water damage", "reimbursement", "responsible"],
    answer: [
      "I am sorry to hear about this issue, rest assured we are working diligently to mitigate this issue. Regarding your potential reimbursement, please contact your renter’s insurance. Additionally, please place your maintenance issue in your Resident portal for more efficient updates and repair statuses.",
    ],
  },
  {
    question: [
      "My AC is only blowing hot air, what do I do?",
      "The air conditioner isn't cooling — help?",
    ],
    keywords: ["AC", "air conditioner", "cooling", "hot air"],
    answer: [
      "Thank you for the proper communication. Please place your maintenance issue in your Resident portal for more efficient updates and repair statuses.",
    ],
  },
  {
    question: [
      "When do I need to complete the move-in inspection?",
      "Deadline for submitting move-in inspection?",
    ],
    keywords: ["inspection", "move-in", "deadline"],
    answer: [
      "Within (5) business days.",
    ],
  },
  {
    question: [
      "How often does DDT inspect the home?",
      "Will there be regular inspections?",
    ],
    keywords: ["inspection", "home inspection", "regular", "annual", "semi-annual"],
    answer: [
      "DDT Enterprise conducts at least one Annual Inspection per year and a Semi-annual inspection during the 4–6-month mark of your initial lease.",
    ],
  },
  {
    question: [
      "What are the move-out instructions?",
      "What do I need to do before move-out?",
    ],
    keywords: ["move-out", "instructions", "departure", "cleaning"],
    answer: [
      "Please have the home cleaned prior to your departure date. If you do not have a preferred cleaner (receipt required), we will use our preferred vendor to conduct the service.",
      "Please place keys on the countertop of the home and leave the doors unlocked on the date of your departure unless specific instructions are specified by the manager.",
      "Security deposits will be released within (30) days of the departure date.",
      "Place lights and water out of your name on the day after your departure.",
      "Notify the manager of any issues that you may have prior to your departure date.",
    ],
  },
  {
  question: [
    "How long does maintenance take?",
    "When is routine maintenance?"
  ],
  keywords: ["maintenance", "repair"],
  answer: [
    "For routine repairs, we repair on the 25th – 29th every month.",
    "For emergency repairs, they are done within 48 hours of request."
  ],
},
  {
  question: ["Emergency", "Emergency contact"],
  answer: ["Please call us at (757) 408-7241"],
},

  {
    question: [
      "When do I find out if I got selected?",
      "When is the selection finalized?",
    ],
    keywords: ["selection", "approval", "rental", "decision"],
    answer: [
      "My staff and I will decide based on a best fit assessment at least (3) days before leased availability date.",
    ],
  },
  {
    question: [
      "When can I renew my lease?",
      "Can I start my renewal?",
    ],
    keywords: ["renew", "lease renewal", "contract"],
    answer: [
      "If you are selected for renewal your renewal offer will be initiated with you within the (60) days prior to your lease expiring.",
    ],
  },  
  {
  question: [
    "what is the management fee",
    "management fee",
    "how much do you charge to manage a property",
    "management cost",
  ],
  keywords: ["management", "fee", "cost", "charge"],
  answer: [
    "8% of monthly rent – 2% lower than market standard.",
  ],
},
{
  question: [
    "what does ddt operate in its management regions",
    "where does ddt operate",
    "ddt management regions",
    "what areas does ddt cover",
  ],
  keywords: ["ddt", "operate", "management", "regions", "areas", "cover"],
  answer: [
    "DDT operates throughout the entirety of the United States.",
  ],
},
{
  question: [
    "who is the owner of ddt enterprise",
    "who owns ddt",
    "ddt enterprise owner",
  ],
  keywords: ["owner", "ddt", "enterprise", "who"],
  answer: [
    "Demetrice Thomas",
  ],
},
{
  question:
    "What is the application fee?",
    answer: "The application fee is $25",
},
{
  question: [
    "who is demetrice thomas",
    "tell me about demetrice thomas",
    "background of demetrice thomas",
    "who owns ddt",
    "who is he",
    "who are they",
  ],
  keywords: ["demetrice", "thomas", "background"],
  answer: [
    "He is a Navy veteran with over a decade of real estate business in both commercial and residential.",
  ],
},
  {
    question: [
      "Can I speak to a person?",
      "I want to talk to a live agent.",
    ],
    keywords: ["speak", "person", "agent", "contact", "customer service"],
    answer: [
      "We would love to hear from you. Please utilize your “contact us” icon or use the link below.<br/><a href=\"https://ddtenterprise.org/contact-us/\" target=\"_blank\">Contact Us</a>",
    ],
  },
  {
    question: "What happens if I pay rent late or only partially?",
    answer: "Yes, late payments are fine, however any payment made after the 5th of the month late fees will be assessed."
  },

  {
    question: "What should I do in case of flooding, fire, death, or criminal activity?",
    answer: "Please call DDT immediately on (757) 408-7241"
  },

  {
    question: "Can I bring my pet when I come for a tour?",
    answer: "Your fur-baby is a part of your family, and we want to ensure that they are comfortable with the home as well, their vote counts!"
  },

  {
  question: ["What rentals are currently available?"],
  answer: [
    "Please visit: <a href=\"https://ddtenterprise.org/rental-properties/#rutherford\" target=\"_blank\">View Available Rentals</a>"
  ]
},

  {
    question: "How do I report emergency maintenance?",
    answer: "For all personal maintenance calls, please log into your resident portal and place a ticket number."
  },
  {
    question: ["I'm having trouble placing a maintenance request"],
    answer: [
      "Please use this link to place your request: <a href=\"https://ddtenterprise.managebuilding.com/manager/app/tasks/add?taskTypeId=2\" target=\"_blank\">Maintenance Request Form</a>"
    ]
    },
];

export default qaData;
