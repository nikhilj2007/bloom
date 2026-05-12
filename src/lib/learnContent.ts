export type MultipleChoiceQuiz = {
  id: string;
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type SurveyQuiz = {
  id: string;
  type: "survey";
  question: string;
  options: string[];
};

export type DragDropItem = {
  id: string;
  content: string;
  correctCategory: string;
};

export type DragDropActivity = {
  id: string;
  type: "drag-and-drop";
  title: string;
  instructions: string;
  categories: string[];
  items: DragDropItem[];
};

export type InteractiveActivity = MultipleChoiceQuiz | SurveyQuiz | DragDropActivity;

export interface Module {
  id: string;
  title: string;
  slug: string;
  readingTime: string;
  objectives: string[];
  content: string;
  takeaways: string[];
  actionStep: string;
  youtubeUrl?: string;
  activity?: InteractiveActivity;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconName: string;
  modules: Module[];
}

export const learnCategories: Category[] = [
  {
    id: "daily-spending",
    title: "Daily Spending",
    slug: "daily-spending",
    description: "Master your day-to-day money decisions, track subscriptions, and build a stress-free budget.",
    iconName: "CreditCard",
    modules: [
      {
        id: "budgeting-basics",
        title: "Budgeting Basics",
        slug: "budgeting-basics",
        readingTime: "5 min",
        objectives: ["Understand the 50/30/20 rule", "Learn to track daily expenses", "Create your first realistic budget"],
        content: `Budgeting doesn't mean you can't have fun. It means you're planning *how* to have fun without stressing about money later. 

As a college student, you might be balancing a part-time job, internships, or financial aid. Your income might be irregular. That's totally normal. Start by tracking what you spend in a typical week. You might be surprised to see how fast $5 lattes or late-night takeout add up.

A great starting point is the 50/30/20 rule: 50% for needs (rent, groceries), 30% for wants (dining out, entertainment), and 20% for savings or debt repayment. Even if your percentages look different right now, having a framework gives you control.`,
        takeaways: [
          "A budget is a plan for your money, not a restriction.",
          "The 50/30/20 rule is a great starting framework.",
          "Tracking your spending is the first step to financial awareness."
        ],
        actionStep: "Look at your bank transactions from the last 7 days. Categorize them into Needs, Wants, and Savings. Does anything surprise you?",
        youtubeUrl: "https://www.youtube.com/embed/b9iwISYBI-g",
        activity: {
          id: "budget-quiz-1",
          type: "multiple-choice",
          question: "Under the 50/30/20 rule, what does the 20% represent?",
          options: [
            "Wants like dining out and entertainment",
            "Needs like rent and groceries",
            "Savings and debt repayment",
            "Taxes and miscellaneous fees"
          ],
          correctAnswer: "Savings and debt repayment",
          explanation: "The 20% bucket is specifically set aside for your future self—building emergency savings, investing, or paying off student loans."
        }
      },
      {
        id: "wants-vs-needs",
        title: "Wants vs. Needs",
        slug: "wants-vs-needs",
        readingTime: "4 min",
        objectives: ["Identify true necessities", "Understand lifestyle creep", "Make guilt-free purchases"],
        content: `It's easy to blur the lines between a want and a need, especially when targeted ads and social media make everything feel urgent. 

A "need" is essential for your survival, health, and basic work/school functioning. This includes rent, basic groceries, utilities, and medications. 

A "want" is everything else: dining out, upgrading your phone when your old one works fine, streaming services, and concert tickets. Wants are completely fine! But they should only come out of your designated 'Wants' budget (the 30% bucket). When you categorize correctly, you give yourself permission to spend guilt-free.`,
        takeaways: [
          "Needs are survival and basic functioning; wants are lifestyle choices.",
          "It's okay to spend on wants as long as they fit your budget.",
          "Be honest with yourself about whether a purchase is truly a need."
        ],
        actionStep: "Review your active subscriptions (Spotify, Netflix, gym). Are they all providing value worth the cost?",
        activity: {
          id: "wants-needs-dnd",
          type: "drag-and-drop",
          title: "Categorize Your Expenses",
          instructions: "Drag each item into the correct category based on the standard 50/30/20 framework.",
          categories: ["Need", "Want"],
          items: [
            { id: "i1", content: "Monthly Rent", correctCategory: "Need" },
            { id: "i2", content: "Netflix Subscription", correctCategory: "Want" },
            { id: "i3", content: "Basic Groceries", correctCategory: "Need" },
            { id: "i4", content: "Uber to a Party", correctCategory: "Want" },
            { id: "i5", content: "Health Insurance", correctCategory: "Need" },
          ]
        }
      },
      {
        id: "tracking-subscriptions",
        title: "Tracking Subscriptions",
        slug: "tracking-subscriptions",
        readingTime: "3 min",
        objectives: ["Audit recurring costs", "Cancel phantom subscriptions", "Understand subscription models"],
        content: `In the modern economy, almost everything is a subscription. From software and streaming to gym memberships and even meal kits, recurring charges drain your bank account invisibly.

Companies bank on you forgetting to cancel. These "phantom subscriptions" might only be $5 or $10 a month, but multiplied over several services and years, they add up to thousands of dollars.

Make it a habit to do a "Subscription Audit" every few months. Comb through your credit card and checking account statements specifically looking for recurring charges. Be ruthless about canceling things you haven't used in the past 30 days. You can always sign up again if you miss them.`,
        takeaways: [
          "Phantom subscriptions are unused services that quietly drain your money.",
          "Conduct a subscription audit at least twice a year.",
          "Cancel anything you haven't actively used in the last month."
        ],
        actionStep: "Check the settings in your phone's app store for active subscriptions, and cancel at least one you don't use.",
        activity: {
          id: "subscription-survey",
          type: "survey",
          question: "How many active streaming subscriptions do you currently pay for?",
          options: [
            "None, I use free tiers or share with family.",
            "1-2 essential services.",
            "3-4 different platforms.",
            "5 or more! I lose track."
          ]
        }
      },
      {
        id: "avoiding-impulse-purchases",
        title: "Avoiding Impulse Purchases",
        slug: "avoiding-impulse-purchases",
        readingTime: "4 min",
        objectives: ["Understand the psychology of sales", "Implement the 24-hour rule", "Reduce buyer's remorse"],
        content: `Online shopping is designed to be frictionless. With one-click checkout, targeted ads, and limited-time 'sales', your brain is hardwired to buy on impulse for the quick dopamine hit.

The most effective strategy against this is adding friction back into the process. The "24-Hour Rule" is a classic: if you see a non-essential item you want to buy, force yourself to wait 24 hours before checking out. Often, the urge to buy completely disappears by the next day.

Another tactic is calculating the cost of an item in hours worked. If you make $15/hour after taxes, a $60 sweater doesn't just cost $60—it costs 4 hours of your life. Ask yourself: is this sweater worth 4 hours of my labor?`,
        takeaways: [
          "Online stores use urgency and friction-less checkout to encourage impulse buying.",
          "The 24-Hour Rule is a powerful circuit breaker for impulse purchases.",
          "Calculating costs in 'hours worked' puts the true price into perspective."
        ],
        actionStep: "Remove saved credit card information from your favorite online shopping sites to force yourself to type it in manually next time.",
        activity: {
          id: "impulse-mc",
          type: "multiple-choice",
          question: "What is the primary purpose of the '24-Hour Rule'?",
          options: [
            "To wait for the item to go on sale.",
            "To ensure you have enough money in your checking account.",
            "To let the initial emotional urge to buy subside before making a logical decision.",
            "To give the store time to restock."
          ],
          correctAnswer: "To let the initial emotional urge to buy subside before making a logical decision.",
          explanation: "Impulse buying is driven by emotion and dopamine. Waiting 24 hours lets the logical part of your brain step back in to evaluate if you truly want or need the item."
        }
      },
      {
        id: "eating-out-on-a-budget",
        title: "Eating Out on a Budget",
        slug: "eating-out-on-a-budget",
        readingTime: "5 min",
        objectives: ["Balance social dining with budgeting", "Identify hidden dining costs", "Learn the 'pre-eat' strategy"],
        content: `Food is consistently one of the highest variable expenses for college students. Socializing often revolves around eating out, making it hard to cut back without feeling isolated.

You don't have to stop eating out entirely, but you do need a strategy. One tactic is the "pre-eat"—having a small snack before going to a restaurant so you aren't starving and tempted to order expensive appetizers or multiple courses.

Also, be aware of the "delivery trap". Apps like UberEats and DoorDash add delivery fees, service fees, and tips that can increase the cost of a meal by 30-50%. If you want takeout, try to pick it up yourself. Finally, don't be afraid to suggest budget-friendly social alternatives like a potluck or getting coffee instead of a full dinner.`,
        takeaways: [
          "You can socialize without breaking the bank by suggesting alternative activities.",
          "Delivery apps drastically inflate the cost of your food.",
          "Eating a snack before going to a restaurant helps you make more rational menu choices."
        ],
        actionStep: "Next time friends suggest going out, suggest a cheaper alternative like a campus event, a coffee walk, or making dinner together.",
        activity: {
          id: "dining-dnd",
          type: "drag-and-drop",
          title: "Budget-Friendly vs Budget-Busting",
          instructions: "Categorize these dining choices as either Budget-Friendly or Budget-Busting.",
          categories: ["Budget-Friendly", "Budget-Busting"],
          items: [
            { id: "d1", content: "Getting coffee instead of a full sit-down dinner", correctCategory: "Budget-Friendly" },
            { id: "d2", content: "Ordering food delivery when the restaurant is 3 blocks away", correctCategory: "Budget-Busting" },
            { id: "d3", content: "Splitting an appetizer and skipping the main course", correctCategory: "Budget-Friendly" },
            { id: "d4", content: "Buying lunch on campus every single day", correctCategory: "Budget-Busting" },
            { id: "d5", content: "Hosting a potluck dinner with roommates", correctCategory: "Budget-Friendly" }
          ]
        }
      }
    ]
  },
  {
    id: "credit-debt",
    title: "Credit & Debt",
    slug: "credit-debt",
    description: "Understand credit scores, manage student loans, and use credit cards responsibly to build your future.",
    iconName: "TrendingDown",
    modules: [
      {
        id: "how-credit-scores-work",
        title: "How Credit Scores Work",
        slug: "how-credit-scores-work",
        readingTime: "6 min",
        objectives: ["Learn what makes up a credit score", "Understand why credit matters for renting and jobs", "Discover safe ways to build credit"],
        content: `Your credit score is like a financial GPA. It tells lenders, landlords, and sometimes even employers how reliably you manage borrowed money.

Scores typically range from 300 to 850. A score above 700 is considered good. The two biggest factors in your score are your payment history (paying on time) and your credit utilization (how much of your available credit you are using).

To build credit safely as a student, consider a student credit card or a secured credit card. Use it for one small recurring purchase—like a Spotify subscription—and set up autopay to pay the balance in full every month. Never carry a balance if you can help it!`,
        takeaways: [
          "Payment history is the biggest factor in your credit score.",
          "Aim to keep your credit utilization below 30%.",
          "Paying your balance in full every month avoids interest and builds good credit."
        ],
        actionStep: "Check if your bank offers a free way to view your FICO credit score. If you don't have a score yet, research 'secured credit cards'.",
        youtubeUrl: "https://www.youtube.com/embed/PjEwDqA481s",
        activity: {
          id: "credit-survey-1",
          type: "survey",
          question: "Do you currently know your credit score?",
          options: [
            "Yes, I check it regularly.",
            "I checked it once a while ago.",
            "No, I have no idea.",
            "I don't think I have a credit score yet."
          ]
        }
      },
      {
        id: "credit-cards-101",
        title: "Credit Cards 101",
        slug: "credit-cards-101",
        readingTime: "7 min",
        objectives: ["Understand how interest works", "Learn the difference between debit and credit", "Avoid common credit traps"],
        content: `Credit cards are powerful tools, but they are incredibly dangerous if misused. When you swipe a debit card, the money comes instantly from your checking account. When you swipe a credit card, the bank pays the merchant, and you promise to pay the bank back later.

If you pay your full statement balance by the due date every month, you pay $0 in interest. You get all the benefits of the card (cash back, fraud protection, credit building) for free. 

However, if you carry a balance, credit cards charge extremely high interest rates (often 20-30% APR). This is how young people fall into crippling debt. The golden rule: treat your credit card exactly like a debit card. Don't spend money you don't already have in your bank account.`,
        takeaways: [
          "Treat your credit card like a debit card.",
          "Always pay your statement balance in full every month.",
          "Never spend money on a credit card that you don't currently have in the bank."
        ],
        actionStep: "If you have a credit card, log into your account and ensure 'Autopay Full Statement Balance' is turned on.",
        activity: {
          id: "cc-quiz-1",
          type: "multiple-choice",
          question: "If you only pay the 'Minimum Payment' on your credit card statement each month...",
          options: [
            "You are doing a great job managing your debt.",
            "You will be charged high interest on the remaining balance.",
            "Your credit score will immediately drop to 300.",
            "You avoid all fees and interest."
          ],
          correctAnswer: "You will be charged high interest on the remaining balance.",
          explanation: "Paying the minimum keeps you out of default, but the bank will charge you massive interest on the remaining balance, keeping you trapped in debt longer."
        }
      },
      {
        id: "understanding-student-loans",
        title: "Understanding Student Loans",
        slug: "understanding-student-loans",
        readingTime: "6 min",
        objectives: ["Differentiate Federal vs Private loans", "Understand Subsidized vs Unsubsidized", "Learn about grace periods"],
        content: `Student loans are often the first major debt you'll encounter. It's crucial to understand exactly what you are borrowing and how it accumulates interest.

The biggest distinction is Federal vs. Private loans. Federal loans (from the government) offer flexible repayment plans, fixed interest rates, and options for forgiveness. Private loans (from banks) often require a cosigner, have higher or variable rates, and offer little flexibility. Always exhaust Federal options before looking at Private loans!

Within Federal loans, you have Subsidized and Unsubsidized. Subsidized means the government pays the interest while you are in school. Unsubsidized means the interest starts accumulating the day the loan is disbursed to you.`,
        takeaways: [
          "Federal loans are generally much safer and more flexible than Private loans.",
          "Subsidized loans do not accrue interest while you are actively enrolled in school.",
          "Always understand your loan's grace period (usually 6 months after graduation) before payments start."
        ],
        actionStep: "Log into StudentAid.gov to view the complete breakdown of your federal student loans and their interest rates.",
        activity: {
          id: "loans-dnd",
          type: "drag-and-drop",
          title: "Federal vs Private Loans",
          instructions: "Match the characteristics to the correct type of student loan.",
          categories: ["Federal Loans", "Private Loans"],
          items: [
            { id: "l1", content: "Offers Income-Driven Repayment plans", correctCategory: "Federal Loans" },
            { id: "l2", content: "Often requires a credit check and a cosigner", correctCategory: "Private Loans" },
            { id: "l3", content: "May be eligible for Public Service Loan Forgiveness", correctCategory: "Federal Loans" },
            { id: "l4", content: "Interest rates are set by the government and fixed", correctCategory: "Federal Loans" },
            { id: "l5", content: "Interest rates can be variable and high", correctCategory: "Private Loans" }
          ]
        }
      },
      {
        id: "paying-debt-strategically",
        title: "Paying Debt Strategically",
        slug: "paying-debt-strategically",
        readingTime: "5 min",
        objectives: ["Learn the Debt Snowball method", "Learn the Debt Avalanche method", "Decide which strategy fits your psychology"],
        content: `If you have multiple sources of debt (e.g., student loans, a credit card balance, a car loan), paying them off can feel overwhelming. There are two primary mathematical and psychological strategies to tackle them.

1. The Debt Avalanche: You pay the minimums on all debts, but put all extra money toward the debt with the *highest interest rate*. Mathematically, this saves you the most money in interest over time.
2. The Debt Snowball: You pay the minimums on all debts, but put all extra money toward the debt with the *smallest balance*. When you pay it off quickly, you get a huge psychological 'win' and momentum to tackle the next one.

While Avalanche is mathematically superior, Snowball is often practically superior because human beings are emotional creatures who thrive on quick victories.`,
        takeaways: [
          "Always pay at least the minimum on every debt to protect your credit score.",
          "The Avalanche method saves the most money.",
          "The Snowball method builds the most psychological momentum."
        ],
        actionStep: "List all your current debts, their total balances, and their interest rates. Which method appeals to you more?",
        activity: {
          id: "debt-mc",
          type: "multiple-choice",
          question: "Which debt payoff strategy focuses on paying off the debt with the highest interest rate first?",
          options: [
            "The Debt Snowball",
            "The Debt Avalanche",
            "The Credit Freeze",
            "The Minimum Payment Method"
          ],
          correctAnswer: "The Debt Avalanche",
          explanation: "The Debt Avalanche targets the highest interest rate first, which minimizes the total amount of interest you'll pay over the life of your loans."
        }
      },
      {
        id: "credit-score-myths",
        title: "Credit Score Myths",
        slug: "credit-score-myths",
        readingTime: "4 min",
        objectives: ["Debunk common credit misconceptions", "Understand soft vs hard pulls", "Learn how checking your own score works"],
        content: `There's a lot of terrible advice about credit scores floating around. Let's bust some myths.

Myth 1: 'Checking your credit score lowers it.' False! Checking your own score is a 'soft pull' and has zero impact. Applying for a new credit card is a 'hard pull' and drops it slightly for a short time.

Myth 2: 'You should carry a small balance to build credit.' Absolutely false! Carrying a balance only charges you interest. Paying your balance in full every month is the best way to build your score.

Myth 3: 'Closing an old card is good for your score.' Usually false. Closing an old card lowers your total available credit and decreases your average age of accounts, both of which can drop your score.`,
        takeaways: [
          "Checking your own credit score will never hurt it.",
          "Never pay interest just to 'build credit'. Pay in full.",
          "Keep your oldest credit card open, even if you rarely use it, to maintain a long credit history."
        ],
        actionStep: "Sign up for a free credit monitoring service like Credit Karma or use your bank's app to check your score safely.",
        activity: {
          id: "myths-dnd",
          type: "drag-and-drop",
          title: "Fact or Myth?",
          instructions: "Categorize these statements as either a Fact or a Myth.",
          categories: ["Fact", "Myth"],
          items: [
            { id: "cm1", content: "You must carry a small balance to build credit.", correctCategory: "Myth" },
            { id: "cm2", content: "Payment history is the most important factor in your score.", correctCategory: "Fact" },
            { id: "cm3", content: "Checking your own score drops it by a few points.", correctCategory: "Myth" },
            { id: "cm4", content: "Closing your oldest credit card can lower your score.", correctCategory: "Fact" }
          ]
        }
      }
    ]
  },
  {
    id: "saving-emergency",
    title: "Saving & Emergency Funds",
    slug: "saving-emergency",
    description: "Build a financial safety net, set exciting savings goals, and make your money work for you in high-yield accounts.",
    iconName: "PiggyBank",
    modules: [
      {
        id: "emergency-fund-basics",
        title: "Emergency Fund Basics",
        slug: "emergency-fund-basics",
        readingTime: "4 min",
        objectives: ["Define what an emergency fund is", "Calculate your target emergency fund amount", "Learn where to keep your emergency savings"],
        content: `An emergency fund is money set aside specifically for unexpected expenses—like a broken laptop, a sudden medical bill, or car repairs. It's the buffer between a minor inconvenience and a financial crisis.

For college students, a great initial goal is $500 to $1,000. Once you graduate and have steady living expenses, you should aim for 3 to 6 months of essential living expenses.

Keep this money in a High-Yield Savings Account (HYSA). These accounts pay you significantly more interest than a standard bank account, but the money is still easy to access when you need it.`,
        takeaways: [
          "Start with a small goal: aim for a $500 emergency fund first.",
          "Keep your emergency fund separate from your checking account.",
          "A High-Yield Savings Account (HYSA) is the best place for this money."
        ],
        actionStep: "Open a High-Yield Savings Account if you don't have one, and set up an automatic transfer of $10 or $20 a week.",
        youtubeUrl: "https://www.youtube.com/embed/5bHkXw6Mh-s",
        activity: {
          id: "efund-quiz-1",
          type: "multiple-choice",
          question: "Which of the following is an appropriate use of your emergency fund?",
          options: [
            "A last-minute spring break trip with friends.",
            "Upgrading your perfectly working iPhone to the newest model.",
            "Paying for an unexpected $400 car repair so you can get to work.",
            "Buying a designer bag that went on a huge sale."
          ],
          correctAnswer: "Paying for an unexpected $400 car repair so you can get to work.",
          explanation: "Emergency funds are for true emergencies that threaten your health, safety, or ability to work—not for wants or deals!"
        }
      },
      {
        id: "automation-magic",
        title: "The Magic of Automation",
        slug: "automation-magic",
        readingTime: "5 min",
        objectives: ["Remove emotion from saving", "Learn to 'pay yourself first'", "Set up automatic transfers"],
        content: `Willpower is a finite resource. If you wait until the end of the month to save whatever is "left over," you will likely find there is nothing left. 

The secret to building wealth easily is automation. This concept is called "paying yourself first." As soon as your paycheck hits your checking account, an automatic transfer should immediately move your savings portion (e.g., 20%) into your savings or investment accounts.

By making saving the very first thing that happens, you force yourself to live on the remaining 80%. You'll adjust to it quickly, and your savings will grow in the background without you having to make a conscious choice every time.`,
        takeaways: [
          "Rely on systems, not willpower.",
          "Pay yourself first before paying your bills or buying wants.",
          "Set up automatic transfers to happen the day after you get paid."
        ],
        actionStep: "Log into your banking app right now and schedule a $25 recurring monthly transfer from checking to savings.",
        activity: {
          id: "automation-dnd",
          type: "drag-and-drop",
          title: "Build Your Money Flow",
          instructions: "Drag the steps into the ideal order for automating your finances on Payday.",
          categories: ["Step 1", "Step 2", "Step 3"],
          items: [
            { id: "a1", content: "Paycheck arrives in Checking", correctCategory: "Step 1" },
            { id: "a2", content: "Auto-transfer 20% to Savings", correctCategory: "Step 2" },
            { id: "a3", content: "Spend the rest on Rent/Wants guilt-free", correctCategory: "Step 3" }
          ]
        }
      },
      {
        id: "high-yield-savings-accounts",
        title: "High-Yield Savings Accounts",
        slug: "high-yield-savings-accounts",
        readingTime: "4 min",
        objectives: ["Understand APY", "Learn the difference between traditional banks and online banks", "Find the best place for your savings"],
        content: `Traditional brick-and-mortar banks (like Chase or Bank of America) usually offer an Annual Percentage Yield (APY) of around 0.01% on their savings accounts. That means if you keep $1,000 there for a year, you earn a single dime in interest.

Online banks don't have the overhead costs of physical branches, so they pass those savings on to you via High-Yield Savings Accounts (HYSAs). An HYSA might offer an APY of 4% to 5%. That same $1,000 would earn $40 to $50 a year—just for sitting there!

HYSAs are completely safe as long as the bank is FDIC insured. This is the absolute best place to park your emergency fund and short-term savings goals.`,
        takeaways: [
          "Traditional bank savings accounts pay practically zero interest.",
          "HYSAs pay significantly more interest and are just as safe.",
          "Always ensure your bank is FDIC insured to protect your money."
        ],
        actionStep: "Look at your current savings account statement. What is the APY? If it's below 3%, start researching HYSAs like Ally, Marcus, or Discover.",
        activity: {
          id: "hysa-mc",
          type: "multiple-choice",
          question: "Why can online HYSAs offer so much more interest than traditional banks?",
          options: [
            "They are taking extreme risks with your money in the stock market.",
            "They are not legally regulated or insured.",
            "They don't have to pay for physical branch buildings, so they pass the savings to you.",
            "It's a scam to steal your personal information."
          ],
          correctAnswer: "They don't have to pay for physical branch buildings, so they pass the savings to you.",
          explanation: "Online banks save massive amounts of money on real estate and branch staffing, allowing them to offer highly competitive interest rates to attract customers."
        }
      },
      {
        id: "setting-smart-goals",
        title: "Setting S.M.A.R.T. Goals",
        slug: "setting-smart-goals",
        readingTime: "5 min",
        objectives: ["Define what S.M.A.R.T. means", "Turn vague wishes into actionable plans", "Track progress visually"],
        content: `Saying 'I want to save money' is a vague wish. It's almost impossible to achieve because you don't know what success looks like. To actually save money, you need a S.M.A.R.T. goal.

S.M.A.R.T. stands for Specific, Measurable, Achievable, Relevant, and Time-bound.

Instead of 'I want to travel,' a SMART goal is: 'I will save $1,200 for a trip to Costa Rica by putting aside $100 a month for the next 12 months.' This goal tells you exactly what to do, how to track it, and gives you a deadline. Visualizing the progress (like filling in a thermometer chart) can significantly boost your motivation.`,
        takeaways: [
          "Vague goals rarely get accomplished.",
          "A SMART goal gives you a clear target and a timeline.",
          "Breaking a large savings goal into small, monthly chunks makes it achievable."
        ],
        actionStep: "Write down one financial goal you have right now. Rewrite it to fit the SMART framework.",
        activity: {
          id: "smart-dnd",
          type: "drag-and-drop",
          title: "Vague vs SMART Goals",
          instructions: "Categorize the statements as either Vague Wishes or SMART Goals.",
          categories: ["Vague Wish", "SMART Goal"],
          items: [
            { id: "sg1", content: "I want to buy a car soon.", correctCategory: "Vague Wish" },
            { id: "sg2", content: "I will save $5,000 for a down payment by transferring $200/month for 25 months.", correctCategory: "SMART Goal" },
            { id: "sg3", content: "I need to pay off my credit card.", correctCategory: "Vague Wish" },
            { id: "sg4", content: "I will build a $1,000 emergency fund by December 31st by saving $25 a week.", correctCategory: "SMART Goal" }
          ]
        }
      },
      {
        id: "saving-on-college-income",
        title: "Saving on a College Income",
        slug: "saving-on-college-income",
        readingTime: "4 min",
        objectives: ["Acknowledge the difficulty of saving in college", "Learn the value of the 'habit' of saving", "Identify small ways to cut costs"],
        content: `Let's be realistic: saving money while in college is incredibly hard. Your income from a part-time job or campus work-study is likely low, and expenses like textbooks and rent are high.

If you can only save $10 a month, *do it anyway*. The amount doesn't matter right now; the *habit* matters. Building the mental muscle of paying yourself first while you are broke means that when you graduate and get a higher-paying job, saving will already be second nature.

Look for campus-specific ways to save: use the campus gym instead of a private one, attend club meetings that offer free food, buy used textbooks, and always ask if places offer a student discount.`,
        takeaways: [
          "Building the habit of saving is more important than the amount while in college.",
          "Even $5 or $10 a month is a victory.",
          "Leverage your student status for discounts everywhere you go."
        ],
        actionStep: "Next time you are at a checkout counter (movies, retail, software), ask 'Do you offer a student discount?'",
        activity: {
          id: "college-saving-survey",
          type: "survey",
          question: "What is your biggest obstacle to saving right now?",
          options: [
            "My income is just too low to have anything left over.",
            "Textbooks and school fees eat up all my money.",
            "Socializing and dining out are my weakness.",
            "I forget to transfer the money into savings."
          ]
        }
      }
    ]
  },
  {
    id: "investing-basics",
    title: "Investing Basics",
    slug: "investing-basics",
    description: "Learn about compound growth, index funds, and how starting small today can create massive wealth tomorrow.",
    iconName: "LineChart",
    modules: [
      {
        id: "compound-interest",
        title: "Compound Interest Explained",
        slug: "compound-interest",
        readingTime: "5 min",
        objectives: ["Understand the magic of compounding", "See how time is your biggest asset", "Learn how to start investing with small amounts"],
        content: `Compound interest is the snowball effect of your money. It's the interest you earn on your original money, plus the interest you earn on your interest. 

Because of compounding, *when* you start investing is often more important than *how much* you invest. Even $50 a month starting in your early twenties can grow into hundreds of thousands of dollars by retirement.

Don't wait until you are 'rich' to start investing. You can open a Roth IRA (an individual retirement account) and start buying broad-market index funds with whatever you can afford.`,
        takeaways: [
          "Compound interest makes your money grow exponentially over time.",
          "Starting early is your biggest advantage as a young person.",
          "A Roth IRA is a powerful tax-advantaged account for college students with earned income."
        ],
        actionStep: "Use a compound interest calculator online. See what happens if you invest $50 a month for 40 years at a 7% return.",
        youtubeUrl: "https://www.youtube.com/embed/O-L2d6sP4Qc",
        activity: {
          id: "compound-survey-1",
          type: "survey",
          question: "What is your biggest fear when it comes to investing?",
          options: [
            "I'm afraid I'll lose all my money.",
            "It seems too complicated to learn.",
            "I don't think I have enough money to start.",
            "I'm already investing and feel confident!"
          ]
        }
      },
      {
        id: "index-funds",
        title: "Index Funds & ETFs",
        slug: "index-funds",
        readingTime: "6 min",
        objectives: ["Understand what a stock is", "Learn why picking individual stocks is risky", "Discover the power of index funds"],
        content: `When you buy a stock, you're buying a tiny slice of ownership in a company. If the company does well, your stock goes up. If it does poorly, your stock goes down. 

Trying to pick the 'next big company' (like Apple or Tesla) is extremely risky and statistically, even professional Wall Street traders fail to beat the market long-term.

Enter the Index Fund (or ETF). An index fund allows you to buy a tiny slice of *hundreds* of companies all at once. For example, an S&P 500 index fund buys you a piece of the 500 largest companies in the US. If one company goes bankrupt, your portfolio is barely affected. It's the ultimate 'don't put all your eggs in one basket' strategy.`,
        takeaways: [
          "Picking individual stocks is a form of gambling.",
          "Index funds spread your risk across hundreds of companies instantly.",
          "The stock market historically returns about 7-10% per year on average over long periods."
        ],
        actionStep: "Research what 'VOO' or 'FXAIX' are. Hint: They are popular index funds!",
        activity: {
          id: "index-quiz-1",
          type: "multiple-choice",
          question: "Which of the following investments is generally considered the safest and most reliable for long-term growth?",
          options: [
            "Putting all your money into a hot tech startup's stock.",
            "Buying a broad-market S&P 500 Index Fund.",
            "Keeping cash hidden under your mattress.",
            "Day trading cryptocurrency."
          ],
          correctAnswer: "Buying a broad-market S&P 500 Index Fund.",
          explanation: "An S&P 500 index fund instantly diversifies your money across 500 of the strongest companies, providing steady, reliable growth over decades."
        }
      },
      {
        id: "retirement-accounts",
        title: "Retirement Accounts (401k vs IRA)",
        slug: "retirement-accounts",
        readingTime: "6 min",
        objectives: ["Learn the difference between a 401(k) and an IRA", "Understand Traditional vs Roth tax treatments", "Know where to put your first investing dollars"],
        content: `A 401(k) and an IRA (Individual Retirement Account) are not investments themselves. They are just 'buckets' that hold your investments (like index funds) and give you massive tax advantages.

A 401(k) is provided by your employer. They take money directly out of your paycheck before you even see it. An IRA is an account you open yourself at a brokerage like Vanguard or Fidelity.

Then there is the tax treatment: Traditional vs. Roth. With 'Traditional', you don't pay taxes on the money now, but you will pay taxes when you withdraw it in retirement. With 'Roth', you pay taxes now, but the money grows completely tax-free forever. For college students in a low tax bracket, a Roth IRA is usually the best choice!`,
        takeaways: [
          "A 401(k) is through your employer; an IRA is opened by you.",
          "These accounts are just 'buckets'; you still have to buy investments inside them.",
          "Roth accounts are incredible for young people because decades of growth become tax-free."
        ],
        actionStep: "Open a Roth IRA at Fidelity, Vanguard, or Charles Schwab. It takes 10 minutes and is completely free.",
        activity: {
          id: "retirement-dnd",
          type: "drag-and-drop",
          title: "Account Types Matchup",
          instructions: "Match the description to the correct retirement account type.",
          categories: ["401(k)", "Roth IRA"],
          items: [
            { id: "r1", content: "Provided by your employer", correctCategory: "401(k)" },
            { id: "r2", content: "You open this yourself at a brokerage", correctCategory: "Roth IRA" },
            { id: "r3", content: "Money grows completely tax-free forever", correctCategory: "Roth IRA" },
            { id: "r4", content: "Often comes with an employer 'match'", correctCategory: "401(k)" }
          ]
        }
      },
      {
        id: "risk-and-diversification",
        title: "Risk and Diversification",
        slug: "risk-and-diversification",
        readingTime: "5 min",
        objectives: ["Define asset allocation", "Understand the relationship between risk and reward", "Learn why diversification protects you"],
        content: `In investing, risk and reward are forever linked. A savings account is zero risk, but the reward (interest) is low. Stocks are high risk, but historically offer high rewards.

Diversification is the practice of spreading your investments around so that your exposure to any one type of asset is limited. "Don't put all your eggs in one basket." If you invest 100% of your money in a single airline company, and another pandemic hits, you lose everything. If you invest in 500 companies across tech, healthcare, retail, and energy, a drop in one sector won't destroy your portfolio.

Your "Asset Allocation" is the mix of stocks, bonds, and cash you hold. When you are young, you can afford to hold mostly stocks because you have decades to recover from market crashes.`,
        takeaways: [
          "Risk and potential reward are always correlated.",
          "Diversification protects you from catastrophic losses.",
          "Young investors should generally be heavily invested in stocks via index funds."
        ],
        actionStep: "Look at your current or planned investments. Are they diversified, or concentrated in just a few things?",
        activity: {
          id: "risk-mc",
          type: "multiple-choice",
          question: "Which portfolio is the most diversified?",
          options: [
            "Holding 100% of your money in Apple stock.",
            "Holding stock in 5 different tech companies.",
            "Holding an S&P 500 Index Fund.",
            "Holding Bitcoin and Dogecoin."
          ],
          correctAnswer: "Holding an S&P 500 Index Fund.",
          explanation: "The S&P 500 index fund gives you exposure to 500 massive companies across many different industries, providing the best diversification."
        }
      },
      {
        id: "investing-vs-saving",
        title: "Investing vs. Saving",
        slug: "investing-vs-saving",
        readingTime: "4 min",
        objectives: ["Know when to save vs when to invest", "Understand time horizons", "Avoid investing money you need soon"],
        content: `A common mistake beginners make is investing money they will need next year. The stock market is volatile in the short term. It might drop 20% in a given year.

The rule of thumb relies on your 'Time Horizon'. 
If you need the money in less than 3-5 years (e.g., for tuition, an emergency fund, or a car down payment), it should be SAVED in a High-Yield Savings Account. It won't grow fast, but it will be there when you need it.

If you don't need the money for 5, 10, or 40 years (e.g., retirement, building long-term wealth), it should be INVESTED. The stock market's short-term drops don't matter when you are holding for decades.`,
        takeaways: [
          "Save money you need in the short term (under 5 years).",
          "Invest money you don't need for the long term (5+ years).",
          "Never invest your emergency fund in the stock market."
        ],
        actionStep: "Categorize your financial goals into short-term (saving) and long-term (investing).",
        activity: {
          id: "invest-save-dnd",
          type: "drag-and-drop",
          title: "Save or Invest?",
          instructions: "Determine whether the money for these goals should be put in a Savings Account or Invested.",
          categories: ["Save (HYSA)", "Invest (Stock Market)"],
          items: [
            { id: "is1", content: "Emergency Fund", correctCategory: "Save (HYSA)" },
            { id: "is2", content: "Retirement in 40 years", correctCategory: "Invest (Stock Market)" },
            { id: "is3", content: "Down payment for a car next year", correctCategory: "Save (HYSA)" },
            { id: "is4", content: "Wealth building for your 40s", correctCategory: "Invest (Stock Market)" },
            { id: "is5", content: "Next semester's tuition", correctCategory: "Save (HYSA)" }
          ]
        }
      }
    ]
  },
  {
    id: "career-income",
    title: "Career & Income",
    slug: "career-income",
    description: "Navigate your first job offers, negotiate your salary like a pro, and understand your total compensation.",
    iconName: "Briefcase",
    modules: [
      {
        id: "salary-negotiation",
        title: "Salary Negotiation Tips",
        slug: "salary-negotiation",
        readingTime: "6 min",
        objectives: ["Overcome the fear of negotiating", "Learn how to research market rates", "Practice a script for asking for more"],
        content: `Many young women hesitate to negotiate their first job or internship offer out of fear they'll seem 'ungrateful' or lose the offer. But the truth is, most employers *expect* you to negotiate.

Not negotiating your first salary can cost you hundreds of thousands of dollars over your career, because every future raise is based on that initial number. 

Do your research using sites like Glassdoor or Levels.fyi. When you receive an offer, thank them, express your excitement, and ask for a day to review it. Then, come back with a data-backed counteroffer. (Hint: Try our 'Worth It' AI Coach to practice!)`,
        takeaways: [
          "Employers expect you to negotiate; you won't lose the offer for asking professionally.",
          "Always base your counteroffer on market data and your unique value.",
          "Take time to review the offer—never accept on the spot."
        ],
        actionStep: "Go to the 'Worth It' tab in this app and try a practice negotiation session with the AI Coach.",
        youtubeUrl: "https://www.youtube.com/embed/XY5TeBvT7EA",
        activity: {
          id: "negotiation-dnd",
          type: "drag-and-drop",
          title: "Negotiation Tactics: Good vs Bad",
          instructions: "Sort these statements into Good Negotiation Tactics and Bad Negotiation Tactics.",
          categories: ["Good Tactic", "Bad Tactic"],
          items: [
            { id: "n1", content: "Basing your counteroffer on market research", correctCategory: "Good Tactic" },
            { id: "n2", content: "Accepting the offer immediately on the phone", correctCategory: "Bad Tactic" },
            { id: "n3", content: "Expressing gratitude and asking for 24 hours to review", correctCategory: "Good Tactic" },
            { id: "n4", content: "Telling the recruiter 'I need more money to pay rent'", correctCategory: "Bad Tactic" },
            { id: "n5", content: "Highlighting unique skills you bring to the role", correctCategory: "Good Tactic" }
          ]
        }
      },
      {
        id: "understanding-benefits",
        title: "Understanding Job Benefits",
        slug: "understanding-benefits",
        readingTime: "5 min",
        objectives: ["Define total compensation", "Understand 401(k) matching", "Evaluate health insurance basics"],
        content: `Your salary is only one part of your compensation package. 'Total Compensation' (or Total Comp) includes your salary, bonuses, stock options, health insurance, and retirement contributions.

One of the most important benefits to look for is a 401(k) match. A 401(k) is an employer-sponsored retirement account. Many companies offer a 'match'—for example, if you contribute 5% of your salary to the account, they will also contribute 5%. This is literally free money. Always contribute at least enough to get the full employer match!

You also need to review health insurance options. A plan with a lower monthly premium might have a high deductible (the amount you pay before insurance kicks in). Evaluate based on your expected medical needs.`,
        takeaways: [
          "Salary is not the only number that matters; look at total compensation.",
          "Always contribute enough to your 401(k) to get the full employer match. It's free money.",
          "Compare health insurance plans based on both premiums and deductibles."
        ],
        actionStep: "If you have a job offer or are currently employed, look up your company's 401(k) match policy.",
        activity: {
          id: "benefits-quiz-1",
          type: "multiple-choice",
          question: "Your company offers a 100% 401(k) match up to 4% of your salary. How much should you contribute?",
          options: [
            "0%, retirement is too far away.",
            "2%, just to start small.",
            "At least 4%, to get all the free money the company is offering.",
            "100% of your salary."
          ],
          correctAnswer: "At least 4%, to get all the free money the company is offering.",
          explanation: "Never leave free money on the table! Always meet the minimum required to get the maximum employer match."
        }
      },
      {
        id: "internship-money-decisions",
        title: "Internship Money Decisions",
        slug: "internship-money-decisions",
        readingTime: "4 min",
        objectives: ["Evaluate paid vs unpaid internships", "Factor in relocation and living costs", "Ask the right questions during the interview"],
        content: `Internships are stepping stones, but they can also be financial burdens. Unpaid internships, while sometimes offering good experience, should be approached with extreme caution. Your time and labor have value.

If an internship is paid but requires you to move to a high-cost city (like NYC or San Francisco), you must do the math. Does the hourly wage actually cover subletting, food, and commuting? Sometimes, companies offer a relocation stipend—but you have to ask for it.

When evaluating an internship offer, consider the long-term ROI (Return on Investment). Will this specific experience guarantee a massive bump in your starting salary upon graduation? If yes, a break-even summer might be worth it. If no, look for better-paying local options.`,
        takeaways: [
          "Always prioritize paid internships; your labor is valuable.",
          "Factor in the true cost of living if you must relocate for the summer.",
          "It's entirely acceptable to ask recruiters if they offer relocation assistance."
        ],
        actionStep: "If you are applying for internships, draft a realistic summer budget for the city the job is located in.",
        activity: {
          id: "internship-survey",
          type: "survey",
          question: "Have you ever taken an unpaid internship for the experience?",
          options: [
            "Yes, and it was worth it for my career.",
            "Yes, but I regret doing free labor.",
            "No, I only accept paid roles.",
            "I haven't had an internship yet."
          ]
        }
      },
      {
        id: "side-hustles-taxes",
        title: "Side Hustles & Taxes",
        slug: "side-hustles-taxes",
        readingTime: "5 min",
        objectives: ["Understand the difference between W-2 and 1099", "Learn to set aside money for taxes", "Track your side hustle expenses"],
        content: `If you babysit, drive for Uber, freelance, or sell things online, you have a side hustle. This means you are legally an independent contractor (a 1099 worker), not an employee (a W-2 worker).

When you are a W-2 employee, your employer automatically takes taxes out of your paycheck. When you are a 1099 contractor, NO taxes are taken out. You get the full amount upfront. 

This is dangerous if you aren't prepared! When tax season comes, the IRS will want their cut. A general rule of thumb is to set aside 25% to 30% of every side-hustle dollar you earn into a separate savings account just for taxes. However, you can also deduct business expenses (like mileage or software) to lower your tax bill.`,
        takeaways: [
          "If you earn money outside of a standard paycheck, you owe taxes on it.",
          "Save 25-30% of your side hustle income specifically for tax season.",
          "Keep meticulous records of any expenses related to your side hustle."
        ],
        actionStep: "Open a separate checking or savings account specifically to hold the tax money from your side hustle.",
        activity: {
          id: "taxes-mc",
          type: "multiple-choice",
          question: "If you earn $1,000 freelancing (1099), roughly how much should you set aside for taxes?",
          options: [
            "$0, freelancing is tax-free.",
            "$50 to $100",
            "$250 to $300",
            "$500"
          ],
          correctAnswer: "$250 to $300",
          explanation: "As an independent contractor, you must pay both income tax and self-employment tax. Setting aside 25-30% ensures you aren't caught off guard at tax time."
        }
      },
      {
        id: "reading-your-paycheck",
        title: "Reading Your First Paycheck",
        slug: "reading-your-paycheck",
        readingTime: "5 min",
        objectives: ["Understand Gross vs Net Pay", "Identify common paycheck deductions", "Check your paystub for errors"],
        content: `You negotiated a $60,000 salary, which is $5,000 a month. But when your first paycheck arrives, it's only for $3,800. What happened? Welcome to paycheck deductions.

Gross Pay is what you earn before anything is taken out. Net Pay (or 'take-home pay') is what actually hits your bank account.

The difference goes to several places:
1. Federal and State Income Taxes
2. FICA (Social Security and Medicare taxes)
3. Your benefits (Health insurance premiums, 401k contributions)

Always review your paystub to ensure your HR department is withholding the correct amounts and that your benefits are properly enrolled.`,
        takeaways: [
          "Gross Pay is the big number; Net Pay is what you actually get to spend.",
          "Taxes and benefits will reduce your take-home pay significantly.",
          "Always budget based on your Net Pay, not your Gross Pay."
        ],
        actionStep: "Look at your most recent paystub (or look up an example online) and identify exactly where the deductions are going.",
        activity: {
          id: "paycheck-dnd",
          type: "drag-and-drop",
          title: "Gross vs Net Pay",
          instructions: "Match the terms to their correct definitions.",
          categories: ["Gross Pay", "Net Pay", "Deductions"],
          items: [
            { id: "p1", content: "The total salary amount you accepted in your offer letter", correctCategory: "Gross Pay" },
            { id: "p2", content: "The actual amount deposited into your checking account", correctCategory: "Net Pay" },
            { id: "p3", content: "Federal Taxes and Health Insurance premiums", correctCategory: "Deductions" },
            { id: "p4", content: "The number you should base your monthly budget on", correctCategory: "Net Pay" }
          ]
        }
      }
    ]
  },
  {
    id: "financial-independence",
    title: "Financial Independence",
    slug: "financial-independence",
    description: "Plan for post-grad life, moving out, and building the confidence to live life on your own terms.",
    iconName: "Map",
    modules: [
      {
        id: "post-grad-budgeting",
        title: "Preparing for Post-Grad Life",
        slug: "post-grad-budgeting",
        readingTime: "5 min",
        objectives: ["Understand the true costs of moving", "Learn to balance rent and student loans", "Build a 'grown-up' budget"],
        content: `Graduating is exciting, but the transition to financial independence can be jarring. You'll suddenly be responsible for rent, utilities, health insurance, and groceries, all at once.

A general rule of thumb is that your rent should not exceed 30% of your gross monthly income. However, in many high-cost-of-living cities, this is challenging. You may need to compromise by getting roommates or living further from the city center.

Before you graduate, try doing a 'mock budget' based on the average entry-level salary for your major and the average rent in the city you want to live in.`,
        takeaways: [
          "Aim to keep rent at or below 30% of your gross income.",
          "Factor in hidden costs of moving, like security deposits and buying furniture.",
          "Creating a mock budget reduces the shock of post-grad financial reality."
        ],
        actionStep: "Research the average starting salary for your desired career and the average rent in your dream city. Do the numbers work?",
        youtubeUrl: "https://www.youtube.com/embed/L1m1g6U_I9E",
        activity: {
          id: "postgrad-survey-1",
          type: "survey",
          question: "What's your biggest financial worry about graduating?",
          options: [
            "Paying back my student loans.",
            "Affording rent in the city I want to live in.",
            "Negotiating my first real salary.",
            "Budgeting without relying on parents or aid."
          ]
        }
      },
      {
        id: "moving-costs",
        title: "The Hidden Costs of Moving",
        slug: "moving-costs",
        readingTime: "5 min",
        objectives: ["Anticipate upfront lease costs", "Budget for furnishing an apartment", "Understand utility setup fees"],
        content: `When calculating if you can afford to move to a new apartment, the monthly rent is only half the story. The upfront costs of moving can easily reach several thousands of dollars.

Landlords typically require the first month's rent and a security deposit (often equal to one month's rent) upfront. If you use a broker, they may charge a fee of up to 15% of the annual rent. 

Then there's the cost of physically moving, buying furniture (a mattress alone can be hundreds of dollars), and paying setup fees for Wi-Fi and electricity. Always have a dedicated 'Moving Fund' saved before signing a lease!`,
        takeaways: [
          "Upfront moving costs can be 3x to 4x your monthly rent.",
          "Don't forget to budget for 'boring' things like a vacuum, trash cans, and cleaning supplies.",
          "Build a dedicated moving savings fund months before you plan to move."
        ],
        actionStep: "Look up a realistic starter apartment online. Calculate the first month's rent + security deposit to see what you need saved immediately.",
        activity: {
          id: "moving-dnd",
          type: "drag-and-drop",
          title: "Upfront vs Monthly Costs",
          instructions: "Categorize these expenses as either 'Upfront Moving Costs' or 'Recurring Monthly Costs'.",
          categories: ["Upfront Cost", "Monthly Cost"],
          items: [
            { id: "m1", content: "Security Deposit", correctCategory: "Upfront Cost" },
            { id: "m2", content: "Wi-Fi Bill", correctCategory: "Monthly Cost" },
            { id: "m3", content: "Buying a Mattress", correctCategory: "Upfront Cost" },
            { id: "m4", content: "Renter's Insurance", correctCategory: "Monthly Cost" },
            { id: "m5", content: "U-Haul Rental", correctCategory: "Upfront Cost" }
          ]
        }
      },
      {
        id: "splitting-costs-roommates",
        title: "Splitting Costs with Roommates",
        slug: "splitting-costs-roommates",
        readingTime: "4 min",
        objectives: ["Avoid roommate money drama", "Use apps to track shared expenses", "Determine fair rent splits"],
        content: `Living with roommates is the best way to save money in your twenties, but money disputes are the fastest way to ruin a friendship. Communication and systems are key.

Don't rely on 'I'll get this one, you get the next one.' That leads to resentment. Use apps like Splitwise to meticulously track shared expenses (like utilities, toilet paper, and cleaning supplies) and settle up once a month.

When picking rooms, rent shouldn't always be split equally. If one person has a much larger room, an en-suite bathroom, or a balcony, they should pay a slightly higher percentage of the total rent. Discuss and agree on this *before* signing the lease.`,
        takeaways: [
          "Use apps like Splitwise to remove emotion from tracking shared expenses.",
          "Establish ground rules for shared groceries vs individual groceries on day one.",
          "Adjust rent splits based on room size and amenities."
        ],
        actionStep: "Download Splitwise or a similar expense-sharing app and familiarize yourself with how it works.",
        activity: {
          id: "roommate-mc",
          type: "multiple-choice",
          question: "Your roommate buys a $200 TV for the shared living room without asking. How should it be split?",
          options: [
            "You are obligated to pay half since it's in the shared space.",
            "You shouldn't pay anything; major purchases need prior agreement.",
            "You should pay $50 as a goodwill gesture.",
            "You should buy a couch of equal value to make it fair."
          ],
          correctAnswer: "You shouldn't pay anything; major purchases need prior agreement.",
          explanation: "Shared expenses must be agreed upon *before* purchase. If a roommate buys something unilaterally, it is their property and their expense."
        }
      },
      {
        id: "long-term-planning",
        title: "Long-Term Planning & FIRE",
        slug: "long-term-planning",
        readingTime: "5 min",
        objectives: ["Understand the FIRE movement", "Learn the 4% rule", "Design your ideal financial future"],
        content: `You may have heard of FIRE: Financial Independence, Retire Early. It's a movement of people who aggressively save and invest so they don't have to work until they are 65.

The math behind FIRE is based on the '4% Rule'. This rule states that if you invest your money in broad index funds, you can safely withdraw 4% of your total portfolio every year forever without running out of money. 

To find your 'FIRE Number' (the amount you need to retire), take your annual expenses and multiply by 25. If you need $40,000 a year to live happily, your FIRE number is $1,000,000. While retiring at 30 might be extreme for some, understanding this math empowers you to realize that work can eventually become optional.`,
        takeaways: [
          "Financial Independence means having enough passive income to cover your living expenses.",
          "The 4% Rule helps you determine how much you can safely withdraw from investments.",
          "Your FIRE number is roughly 25 times your annual expenses."
        ],
        actionStep: "Estimate your ideal annual living expenses. Multiply that number by 25. That's your ultimate long-term wealth goal!",
        activity: {
          id: "fire-dnd",
          type: "drag-and-drop",
          title: "The Math of Financial Independence",
          instructions: "Match the concept to the correct multiplier or percentage.",
          categories: ["4%", "25x", "50/30/20"],
          items: [
            { id: "f1", content: "The safe yearly withdrawal rate for retirement portfolios", correctCategory: "4%" },
            { id: "f2", content: "The multiplier to find your total retirement number", correctCategory: "25x" },
            { id: "f3", content: "A basic framework for budgeting your monthly income", correctCategory: "50/30/20" }
          ]
        }
      },
      {
        id: "building-money-confidence",
        title: "Building Confidence with Money",
        slug: "building-money-confidence",
        readingTime: "4 min",
        objectives: ["Acknowledge money anxiety", "Shift from scarcity to abundance mindset", "Celebrate small financial wins"],
        content: `Money is deeply emotional. For many women, it carries feelings of anxiety, guilt, or impostor syndrome. Society often tells women they are 'bad at math' or 'shopaholics', which is simply not true.

Building money confidence starts with education and action. Every time you track your budget, invest $50, or check your credit score, you are proving to yourself that you are capable.

Shift from a 'scarcity mindset' (fear of running out, hoarding money, feeling guilty for spending) to an 'abundance mindset' (knowing you can earn more, investing for growth, spending joyfully on what matters). You deserve to be wealthy, and you have the tools to make it happen.`,
        takeaways: [
          "Money anxiety is normal, but education is the antidote.",
          "Celebrate the small wins—every dollar saved or invested is progress.",
          "You are fully capable of understanding and mastering your finances."
        ],
        actionStep: "Write down one positive financial action you took this week. Be proud of it!",
        activity: {
          id: "confidence-survey",
          type: "survey",
          question: "How do you feel after completing these learning modules?",
          options: [
            "Empowered and ready to take action!",
            "Still a bit overwhelmed, but I know where to start.",
            "I need to review a few more things.",
            "I'm opening a High-Yield Savings Account right now."
          ]
        }
      }
    ]
  }
];
