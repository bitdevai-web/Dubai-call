export const eventData = {
  name: "Dubai Fintech Summit",
  edition: 4,
  dates: "May 11-12, 2026",
  location: "Madinat Jumeirah, Dubai",
  ticketPrice: "USD 999",
  attendees: "10,000+",
  scale: {
    investors: 1000,
    govReps: 2000,
    banking: 1500,
    speakers: 300,
    governors: 20,
    ministers: 10
  },
  topics: [
    "Future-Proofing finance and building resilient systems",
    "Digital Assets and tokenisation",
    "Payments, cross-border corridors, and embedded finance",
    "AI, Data and intelligent decision-making",
    "Insurance, risk, and protection innovation",
    "Private capital, and next generation wealth strategies"
  ]
};

export const pitch = `Good morning, [NAME]... uh... this is [AGENT] calling from the Dubai Fintech Summit team.

Just wanted to quickly connect... not sure if I caught you at a good time?

So, I will keep this very quick.

We are hosting the 4th edition of the Dubai Fintech Summit, happening on May 11th and 12th, 2026, at Madinat Jumeirah, Dubai.

And the reason I am calling you specifically is you have been shortlisted for a complimentary delegate pass.

Normally it is around USD 999, but based on your role as [ROLE] at [COMPANY], you are on our curated list.

Just to give you a quick sense of scale, we are expecting 10,000+ attendees, including around 1,000 investors, 2,000 government representatives, 1,500 banking leaders, plus ministers, governors, and about 300 global speakers from 120+ countries.

So just checking, does something like this sound relevant or interesting for you?`;

export const objections = [
  {
    id: "OBJ_001",
    trigger: ["not interested", "don't think so"],
    response: `Totally understand. Just quickly, the only reason I would say this might still be worth a look is this is not a typical event. It is designed specifically for decision-makers handling real transformation work. If you are open, I can give you a 30 to 40 second summary tailored to you.`
  },
  {
    id: "OBJ_002",
    trigger: ["send email", "email me"],
    response: `Yeah, fair. We usually avoid sending generic emails, that is why I reached out directly. What I can do instead is quickly understand your priorities and then send you something very crisp and relevant. Would that work better?`
  },
  {
    id: "OBJ_003",
    trigger: ["not available", "busy", "can't make it"],
    response: `Totally get it, I will be quick. The only reason I called is this is one of the few events focused on actual ROI for senior leaders. Can I ask one quick question to see if it is even relevant?`
  },
  {
    id: "OBJ_004",
    trigger: ["need a week", "can't decide now"],
    response: `That is completely fair. Just one thing to mention, these complimentary passes are limited and time-bound. We usually hold them for about 48 hours, and then they get released. What I can do is put a soft hold for you while you check internally. Would that help?`
  }
];

export const qualifyingQuestions = [
  {
    id: "Q_001",
    text: "What would typically stop you from attending something like this?",
    scoreIfPositive: 20
  },
  {
    id: "Q_002",
    text: "Internally, would you need anyone else involved to say yes?",
    scoreIfPositive: 15
  },
  {
    id: "Q_003",
    text: "Are you available around May 11th and 12th?",
    scoreIfPositive: 20
  },
  {
    id: "Q_004",
    text: "If everything makes sense, would you be able to decide in the next 24 to 48 hours?",
    scoreIfPositive: 15
  }
];