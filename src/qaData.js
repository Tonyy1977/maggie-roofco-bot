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
      "You can schedule a tour anytime using the link below:",
      '<a href="https://ddtenterprise.org/schedule-a-tour/" target="_blank" rel="noopener noreferrer">Schedule a Tour</a>',
      "During the tour, you can see all the features of the property and ask any questions you may have."
    ]
  },

  {
    question: [
      "payment",
      "how do i pay",
      "pay rent",
      "payment methods",
      "pay online"
    ],
    keywords: ["payment", "pay", "online", "methods"],
    answer: [
      "Great question, rent payments are made simple through your resident portal. Please use link below if you are having any issues.",
      '<a href="https://ddtenterprise.org/rental-properties-2/" target="_blank" rel="noopener noreferrer">Resident Portal</a>'
    ],
    followUps: {
      "how do i pay rent": '<a href="https://ddtenterprise.org/resident-portal" target="_blank" rel="noopener noreferrer">Pay Rent Online</a>',
      "when is payment due": "Rent payment is due on the 5th of each month. Late fees apply after that date.",
      "what payment methods are accepted": "We accept debit cards, credit cards, and bank transfers through the Resident Portal."
    }
  },

  {
  question: [
    "inspection",
    "move-in inspection",
    "home inspection",
    "inspection deadline",
    "inspection process"
  ],
  keywords: ["inspection", "move-in", "deadline", "process"],
  answer: [
    "Are you asking about when your move-in inspection is due, how often inspections are done, or what the inspection process includes? Please select one or ask more specifically."
  ],
  followUps: {
    "when do i need to complete move-in inspection": "You need to complete the move-in inspection within 5 business days after moving in.",
    "how often are inspections done": "DDT conducts an annual inspection and a semi-annual inspection during your lease.",
    "what is the inspection process": "During inspection, we assess the condition of the property and any reported maintenance issues.",
  }
},

  {
  question: [
    "pay rent",
    "payment",
    "house rent",
  ],
  keywords: ["rent", "payment", "house", "miss"],
  answer: [
    "Great question, rent payments are made simple through your resident portal. Please use link below if you are having any issues.",
    '<a href="https://ddtenterprise.org/rental-properties-2/" target="_blank" rel="noopener noreferrer">Resident Portal</a>'
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
    "When is the tour available?"
  ],
  keywords: ["tour", "schedule", "visit", "see", "home"],
  answer: [
    "Perfect, we’re excited to give you a tour! Please confirm the date and time that works best for you using the link below.",
    'What feature of the home stood out most to you? <a href="https://ddtenterprise.org/schedule-a-tour/" target="_blank" rel="noopener noreferrer">Schedule a Tour</a>'
  ]
},
  {
    question: ["I just applied. What now?", "What happens after submitting the application?"],
    keywords: ["apply", "submitted", "next step"],
    answer: [
      "Thank you for submitting your application. Are you interested in scheduling a tour?",
      '<a href="https://ddtenterprise.org/schedule-a-tour/" target="_blank" rel="noopener noreferrer">Schedule a Tour</a>'
    ]
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
    question: ["I missed my tour — can I reschedule?", "I wasn’t able to make my appointment. Can I set another time?"],
    keywords: ["reschedule", "tour", "appointment", "change"],
    answer: [
      "Certainly, please choose a time that works with your schedule using the link below.",
      '<a href="https://ddtenterprise.org/schedule-a-tour/" target="_blank" rel="noopener noreferrer">Schedule a Tour</a>'
    ]
  },
  {
    question: [
      "Why wasn’t I chosen for the unit?",
      "Is there a reason I didn’t get approved?",
    ],
    keywords: ["not chosen", "rejected", "denied", "approval"],
    answer: [
      "At DDT Enterprise we conduct a best fit assessment off all applicants. We chose an applicant we determined to be a better fit for the home and in a more extremis situation. I will keep you in mind when our next rental comes available. Please sign up for our waitlist.",
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
    keywords: ["AC", "air conditioner", "cooling", "hot air", "oven", "stove"],
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
      "Within (5) business days of move in date.",
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
    keywords: ["move-out", "move out", "instructions", "departure", "cleaning"],
    answer: [
      "Please have the home cleaned prior to your departure date. If you do not have a preferred cleaner (receipt required), we will use our preferred vendor to conduct the service.",
      "Please place keys on the countertop of the home and leave the doors unlocked on the date of your departure unless specific instructions are specified by the manager.",
      "Security deposits will be released within (30) days of the departure date.",
      "Place lights and water out of your name on the day after your departure.",
      "Notify the manager of any issues that you may have prior to your departure date.",
      "Ensure all utilites remain on in the resident until the day after your lease concludes.",
      "The cost for missing a service call is $85.00.",
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
      "DDT Enterprise chooses resident(s) on a best fit assessment at least (3) days before leased availability date.",
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
    "8% of monthly rent, which is 2% lower than market standard.",
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
  question: [
    "What is the application fee?",
  ],
  
    answer: [ "The application fee is $25",
  ],
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
    "He is a Navy veteran with over a decade of commercial and residential real estate experience.",
  ],
},
   {
    question: ["Can I speak to a person?", "I want to talk to a live agent."],
    keywords: ["speak", "person", "live agent", "contact", "customer service"],
    answer: [
      "We would love to hear from you. Please use the link below.",
      '<a href="https://ddtenterprise.org/contact-us/" target="_blank" rel="noopener noreferrer">Contact Us</a>'
    ]
  },

  {
    question:[ "What happens if I pay rent late or only partially?", ],
    answer: [ "Yes, late payments are fine, however any payment made after the 5th of the month late fees will be assessed." ],
  },

  {
    question: [ "What should I do in case of flooding, fire, death, or criminal activity?", ],
    answer: [ "Please call DDT immediately on (757) 408-7241" ],
  },

  {
    question: ["Can I bring my pet when I come for a tour?",],
    answer: ["Your fur-baby is a part of your family, and we want to ensure that they are comfortable with the home as well, their vote counts!"
    ],
    },

   {
    question: ["What rentals are currently available?"],
    keywords: ["available", "rental available","Homes","Condominiums", "properties", "current"],
    answer: [
      '<a href="https://ddtenterprise.org/rental-properties/#rutherford" target="_blank" rel="noopener noreferrer">View Available Rentals</a>'
    ]
  },

    {
    question: ["I'm having trouble placing a maintenance request",
                "I can't request maintenance",
    ],
    keywords: ["maintenance", "request", "trouble", "issue", "form"],
    answer: [
      '<a href="https://ddtenterprise.managebuilding.com/manager/app/tasks/add?taskTypeId=2" target="_blank" rel="noopener noreferrer">Submit Maintenance Request</a>'
    ]
  },
    {
  question: [
    "Does DDT partner with any companies?",
    "partner inspection",
    "who do you work with for inspections",
    "Thomas Inspections, a nation wide Home Inspection Company",
    "inspection partner"
  ],
  keywords: ["Thomas Inspections", "partner"],
  answer: [
    "Yes! DDT Enterprise proudly partners with Thomas Inspections, a nationwide home inspection company that helps us deliver exceptional service.",
    '<a href="https://www.thomasinspectionsva.com/" target="_blank" rel="noopener noreferrer">Visit Thomas Inspections</a>'
  ]
},
{
  question: [
    "I cleaned, how can I receive my deposit?",
    "cleaning receipt",
    "cleaning proof",
    "how to get security deposit back",
    "great question, to receive your full security deposit you will need a professional cleaning (receipt required) as well as a Move Out Inspection"
  ],
  keywords: ["receipt", "deposit", "cleaning", "proof"],
  answer: [
    "To receive your full security deposit, please provide a cleaning receipt from a professional cleaning service.",
    "Make sure the receipt includes date, address, and detailed services."
  ]
},
{
  question: [
    "discount",
    "any deals",
    "can i get a discount",
    "military discount",
    "promo code"
  ],
  keywords: ["discount", "deal", "promo", "sale"],
  answer: [
    "We currently do not offer any discounts or promotional rates.",
    "Our pricing reflects the quality and value of our service."
  ]
},
{
  question: ["Who is the best property management company?"],
  answer: ["DDT Enterprise"],
},
{
  question: [
    "can we install ring doorbells",
    "can i install doorbell",
    "ring doorbell allowed"
  ],
  keywords: ["doorbell", "install"],
  answer: [
    "At DDT Enterprise, we want you to feel comfortable inside your house of course, you can install a doorbell for your home."
  ],
},

{
  question: [
    "can we paint the walls",
    "can i paint the house",
    "painting allowed"
  ],
  keywords: ["paint", "walls"],
  answer: [
    "At DDT Enterprise, we want you to feel comfortable inside your house of course, you can paint the house. We ask that once you terminate your lease that you restore the interior back to its original condition"
  ],
},

{
  question: [
    "where is your physical location",
    "what is the address of ddt enterprise",
    "do you have an office"
  ],
  keywords: ["location", "address", "physical", "office"],
  answer: [
    "DDT does not have a physical location; it is a completely remote property management company with local Agents and Brokers operating throughout the entire nation."
  ],
},
{
    "question": [
      "What is DDT Enterprise responsible for?",
      "What services does DDT offer?"
    ],
    "keywords": [
      "responsible",
      "services",
      "management"
    ],
    "answer": [
      "DDT Enterprise handles leasing, advertising, tenant screening, rent collection, maintenance coordination, and responding to emergency issues as part of its management services."
    ]
  },
  {
    "question": [
      "Can DDT sign leases and accept deposits?",
      "Does DDT represent owners for lease agreements?"
    ],
    "keywords": [
      "sign leases",
      "accept deposits",
      "lease agreements"
    ],
    "answer": [
      "Yes, DDT Enterprise is authorized to sign leases, accept deposits, and complete property checklists for residents."
    ]
  },
  {
    "question": [
      "Does DDT inspect my property?",
      "How often are inspections done?"
    ],
    "keywords": [
      "inspect",
      "property",
      "inspection",
      "move-in",
      "move-out"
    ],
    "answer": [
      "Yes, DDT Enterprise performs inspections at move-in, move-out, and conducts semiannual inspections."
    ]
  },
  {
    "question": [
      "What happens if repairs are needed?",
      "How does DDT handle repairs?"
    ],
    "keywords": [
      "repair",
      "repairs",
      "fix",
      "maintenance"
    ],
    "answer": [
      "DDT handles repair coordination and may conduct emergency repairs up to $800 without Property owner approval."
    ]
  },
  {
    "question": [
      "When is DDT available?",
      "What are DDT\u2019s business hours?"
    ],
    "keywords": [
      "available",
      "business hours",
      "contact"
    ],
    "answer": [
      "DDT Enterprise is available to tenants daily from 8 a.m. to 6 p.m., Monday through Sunday."
    ]
  },
  {
    "question": [
      "How do I terminate the agreement?",
      "Cancel property management agreement"
    ],
    "keywords": [
      "terminate",
      "cancel",
      "end",
      "agreement"
    ],
    "answer": [
      "Either party may cancel with 30 days notice. The agreement can also be terminated immediately for serious issues."
    ]
  },
  {
    "question": [
      "How are tenant complaints handled?",
      "What happens when tenants complain?"
    ],
    "keywords": [
      "complaint",
      "complaints",
      "issues",
      "tenant"
    ],
    "answer": [
      "DDT logs complaints, categorizes them, and informs owners about necessary repairs or actions."
    ]
  },
  {
  question: ["What's DDT slogan?"],
  answer: ["Where community meets value."],
},
{
  question: ["Is Micah a real person?"],
  answer: ["Yes, my name is Micah Thomas from Marion, Arkansas"],
},
{
  question: ["What is DDT Enterprise's vacancy rate?"],
  answer: ["DDT Enterprise averages a 17 day (or less) vacany rate on average. We pride ourselves on ensuring we keep the best residents in the best homes at all times."],
},
{
  question: ["My toilet is backed up."],
  answer: ["I'm sorry to hear about that. Please place your maintenance issue in your Resident Portal for efficient updates and repair statuses. If it's an emergency, don't hesitate to call us directly at (757) 408-7241."],
},
];


export default qaData;
