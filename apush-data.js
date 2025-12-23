// APUSH Period Data
// Contains all content for Periods 2-9

const APUSH_DATA = {
    periods: {
        2: {
            number: 2,
            name: "Colonial America",
            dates: "1607-1754",
            difficulty: 2,
            studyTime: 120,
            themes: [
                "Colonial Regions",
                "Slavery",
                "Mercantilism",
                "Enlightenment",
                "Religious Diversity",
                "Native American Relations"
            ],
            skills: [
                "Contextualization",
                "Causation",
                "Comparison",
                "Continuity and Change"
            ],
            keyConcepts: [
                "European colonization patterns and regional differences",
                "Transatlantic trade and mercantilism",
                "Slavery and indentured servitude",
                "Enlightenment ideas and religious movements",
                "Colonial self-government and resistance"
            ],
            timeline: [
                {
                    date: "1607",
                    title: "Jamestown Founded",
                    description: "First permanent English settlement in North America"
                },
                {
                    date: "1620",
                    title: "Mayflower Compact",
                    description: "Pilgrims establish self-government in Plymouth"
                },
                {
                    date: "1692",
                    title: "Salem Witch Trials",
                    description: "Mass hysteria and religious extremism in Massachusetts"
                },
                {
                    date: "1730s-1740s",
                    title: "Great Awakening",
                    description: "Religious revival movement across the colonies"
                },
                {
                    date: "1754",
                    title: "French and Indian War Begins",
                    description: "Conflict between British and French in North America"
                }
            ],
            causesEffects: [
                {
                    title: "Mercantilism and Colonial Economy",
                    steps: [
                        {
                            title: "British Navigation Acts",
                            description: "Restricted colonial trade to benefit British economy"
                        },
                        {
                            title: "Colonial Resistance",
                            description: "Smuggling and evasion of trade restrictions"
                        },
                        {
                            title: "Economic Tensions",
                            description: "Growing resentment toward British control"
                        }
                    ]
                },
                {
                    title: "Slavery and Labor Systems",
                    steps: [
                        {
                            title: "Indentured Servitude",
                            description: "Initial labor system in Chesapeake colonies"
                        },
                        {
                            title: "Transition to Slavery",
                            description: "Racial slavery becomes permanent and hereditary"
                        },
                        {
                            title: "Social Hierarchy",
                            description: "Racial distinctions shape colonial society"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "John Winthrop, 'A Model of Christian Charity'",
                    date: "1630",
                    author: "John Winthrop",
                    preview: "We shall be as a city upon a hill. The eyes of all people are upon us..."
                },
                {
                    title: "Benjamin Franklin, 'Poor Richard's Almanack'",
                    date: "1732-1758",
                    author: "Benjamin Franklin",
                    preview: "Early to bed and early to rise, makes a man healthy, wealthy, and wise..."
                }
            ]
        },
        3: {
            number: 3,
            name: "Revolution and Early Republic",
            dates: "1754-1800",
            difficulty: 3,
            studyTime: 150,
            themes: [
                "American Revolution",
                "Constitution",
                "Early Republic",
                "Federalism",
                "Political Parties"
            ],
            skills: [
                "Causation",
                "Comparison",
                "Contextualization",
                "Argumentation"
            ],
            keyConcepts: [
                "French and Indian War and its consequences",
                "Revolutionary War and independence",
                "Articles of Confederation weaknesses",
                "Constitutional Convention and compromises",
                "Federalist vs. Anti-Federalist debates",
                "Washington and Adams administrations"
            ],
            timeline: [
                {
                    date: "1754-1763",
                    title: "French and Indian War",
                    description: "British victory leads to territorial expansion and debt"
                },
                {
                    date: "1765",
                    title: "Stamp Act",
                    description: "First direct tax on colonies, sparks widespread protest"
                },
                {
                    date: "1776",
                    title: "Declaration of Independence",
                    description: "Colonies declare independence from Britain"
                },
                {
                    date: "1787",
                    title: "Constitutional Convention",
                    description: "Delegates draft new framework of government"
                },
                {
                    date: "1789",
                    title: "Constitution Ratified",
                    description: "New government begins under Washington"
                }
            ],
            causesEffects: [
                {
                    title: "Road to Revolution",
                    steps: [
                        {
                            title: "French and Indian War Debt",
                            description: "Britain needs revenue to pay war costs"
                        },
                        {
                            title: "Taxation Without Representation",
                            description: "Stamp Act, Townshend Acts, Tea Act"
                        },
                        {
                            title: "Colonial Resistance",
                            description: "Boycotts, protests, Boston Massacre, Boston Tea Party"
                        },
                        {
                            title: "Intolerable Acts",
                            description: "British crackdown increases colonial unity"
                        },
                        {
                            title: "Revolutionary War",
                            description: "Armed conflict for independence"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "Declaration of Independence",
                    date: "1776",
                    author: "Thomas Jefferson",
                    preview: "We hold these truths to be self-evident, that all men are created equal..."
                },
                {
                    title: "Federalist No. 10",
                    date: "1787",
                    author: "James Madison",
                    preview: "The latent causes of faction are thus sown in the nature of man..."
                }
            ]
        },
        4: {
            number: 4,
            name: "Expansion and Reform",
            dates: "1800-1848",
            difficulty: 3,
            studyTime: 140,
            themes: [
                "Jeffersonian Era",
                "Market Revolution",
                "Jacksonian Democracy",
                "Reform Movements",
                "Manifest Destiny"
            ],
            skills: [
                "Causation",
                "Continuity and Change",
                "Comparison",
                "Contextualization"
            ],
            keyConcepts: [
                "Jefferson's presidency and Louisiana Purchase",
                "War of 1812 and nationalism",
                "Market Revolution and economic changes",
                "Jacksonian Democracy and expansion of suffrage",
                "Reform movements (abolition, women's rights, temperance)",
                "Manifest Destiny and westward expansion"
            ],
            timeline: [
                {
                    date: "1803",
                    title: "Louisiana Purchase",
                    description: "Doubles size of United States"
                },
                {
                    date: "1812-1815",
                    title: "War of 1812",
                    description: "Second war with Britain, strengthens nationalism"
                },
                {
                    date: "1820",
                    title: "Missouri Compromise",
                    description: "Temporary solution to slavery expansion question"
                },
                {
                    date: "1828",
                    title: "Jackson Elected",
                    description: "Expansion of democracy and common man politics"
                },
                {
                    date: "1848",
                    title: "Seneca Falls Convention",
                    description: "Beginning of organized women's rights movement"
                }
            ],
            causesEffects: [
                {
                    title: "Market Revolution",
                    steps: [
                        {
                            title: "Transportation Improvements",
                            description: "Canals, roads, and railroads connect regions"
                        },
                        {
                            title: "Industrialization",
                            description: "Factory system and wage labor emerge"
                        },
                        {
                            title: "Social Changes",
                            description: "New middle class, urbanization, changing gender roles"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "Monroe Doctrine",
                    date: "1823",
                    author: "James Monroe",
                    preview: "The American continents... are henceforth not to be considered as subjects for future colonization..."
                }
            ]
        },
        5: {
            number: 5,
            name: "Civil War and Reconstruction",
            dates: "1844-1877",
            difficulty: 4,
            studyTime: 180,
            themes: [
                "Manifest Destiny",
                "Sectionalism",
                "Civil War",
                "Reconstruction",
                "Slavery"
            ],
            skills: [
                "Causation",
                "Continuity and Change",
                "Comparison",
                "Argumentation"
            ],
            keyConcepts: [
                "Manifest Destiny and territorial expansion",
                "Sectional conflicts over slavery",
                "Compromises and failed solutions",
                "Civil War causes and consequences",
                "Reconstruction policies and their failure",
                "Rise of Jim Crow"
            ],
            timeline: [
                {
                    date: "1846-1848",
                    title: "Mexican-American War",
                    description: "Expansion leads to new territories and slavery debate"
                },
                {
                    date: "1850",
                    title: "Compromise of 1850",
                    description: "Fugitive Slave Act increases tensions"
                },
                {
                    date: "1861-1865",
                    title: "Civil War",
                    description: "Deadliest conflict in American history"
                },
                {
                    date: "1865",
                    title: "13th Amendment",
                    description: "Abolishes slavery"
                },
                {
                    date: "1877",
                    title: "End of Reconstruction",
                    description: "Compromise of 1877 removes federal troops from South"
                }
            ],
            causesEffects: [
                {
                    title: "Road to Civil War",
                    steps: [
                        {
                            title: "Territorial Expansion",
                            description: "New states raise slavery question"
                        },
                        {
                            title: "Failed Compromises",
                            description: "Missouri Compromise, Compromise of 1850, Kansas-Nebraska Act"
                        },
                        {
                            title: "Sectional Divisions",
                            description: "North and South develop distinct economies and cultures"
                        },
                        {
                            title: "Election of 1860",
                            description: "Lincoln's election triggers secession"
                        },
                        {
                            title: "Civil War",
                            description: "Four years of devastating conflict"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "Gettysburg Address",
                    date: "1863",
                    author: "Abraham Lincoln",
                    preview: "Four score and seven years ago our fathers brought forth on this continent..."
                }
            ]
        },
        6: {
            number: 6,
            name: "Gilded Age",
            dates: "1865-1898",
            difficulty: 3,
            studyTime: 160,
            themes: [
                "Industrialization",
                "Immigration",
                "Westward Expansion",
                "Populism",
                "Urbanization"
            ],
            skills: [
                "Causation",
                "Continuity and Change",
                "Comparison",
                "Contextualization"
            ],
            keyConcepts: [
                "Industrial Revolution and big business",
                "Immigration and nativism",
                "Westward expansion and Native American conflicts",
                "Labor movements and strikes",
                "Populist movement",
                "Urban problems and political machines"
            ],
            timeline: [
                {
                    date: "1869",
                    title: "Transcontinental Railroad",
                    description: "Connects East and West coasts"
                },
                {
                    date: "1877",
                    title: "Great Railroad Strike",
                    description: "First major national labor strike"
                },
                {
                    date: "1890",
                    title: "Wounded Knee Massacre",
                    description: "End of Indian Wars"
                },
                {
                    date: "1896",
                    title: "Plessy v. Ferguson",
                    description: "Supreme Court legalizes segregation"
                }
            ],
            causesEffects: [
                {
                    title: "Industrialization",
                    steps: [
                        {
                            title: "Technological Innovation",
                            description: "Steel, oil, electricity transform economy"
                        },
                        {
                            title: "Big Business",
                            description: "Monopolies and trusts dominate industries"
                        },
                        {
                            title: "Labor Response",
                            description: "Unions form to protect workers' rights"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "Gospel of Wealth",
                    date: "1889",
                    author: "Andrew Carnegie",
                    preview: "The problem of our age is the proper administration of wealth..."
                }
            ]
        },
        7: {
            number: 7,
            name: "Progressive Era to World War II",
            dates: "1890-1945",
            difficulty: 4,
            studyTime: 200,
            themes: [
                "Imperialism",
                "Progressive Era",
                "World War I",
                "Roaring Twenties",
                "Great Depression",
                "World War II"
            ],
            skills: [
                "Causation",
                "Continuity and Change",
                "Comparison",
                "Contextualization",
                "Argumentation"
            ],
            keyConcepts: [
                "American imperialism and Spanish-American War",
                "Progressive reforms and muckrakers",
                "World War I and its aftermath",
                "1920s culture and economy",
                "Great Depression and New Deal",
                "World War II and home front"
            ],
            timeline: [
                {
                    date: "1898",
                    title: "Spanish-American War",
                    description: "U.S. becomes imperial power"
                },
                {
                    date: "1917",
                    title: "U.S. Enters WWI",
                    description: "American involvement in European conflict"
                },
                {
                    date: "1929",
                    title: "Stock Market Crash",
                    description: "Beginning of Great Depression"
                },
                {
                    date: "1941",
                    title: "Pearl Harbor",
                    description: "U.S. enters World War II"
                },
                {
                    date: "1945",
                    title: "End of WWII",
                    description: "Atomic bombs and beginning of Cold War era"
                }
            ],
            causesEffects: [
                {
                    title: "Great Depression",
                    steps: [
                        {
                            title: "Stock Market Crash",
                            description: "Over-speculation and economic bubble bursts"
                        },
                        {
                            title: "Bank Failures",
                            description: "Financial system collapses"
                        },
                        {
                            title: "Unemployment",
                            description: "25% unemployment rate devastates families"
                        },
                        {
                            title: "New Deal",
                            description: "Government intervention to restore economy"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "Fourteen Points",
                    date: "1918",
                    author: "Woodrow Wilson",
                    preview: "The program of the world's peace, therefore, is our program..."
                }
            ]
        },
        8: {
            number: 8,
            name: "Cold War Era",
            dates: "1945-1980",
            difficulty: 4,
            studyTime: 190,
            themes: [
                "Cold War",
                "Civil Rights Movement",
                "Vietnam War",
                "Counterculture",
                "Great Society"
            ],
            skills: [
                "Causation",
                "Continuity and Change",
                "Comparison",
                "Contextualization",
                "Argumentation"
            ],
            keyConcepts: [
                "Cold War origins and containment policy",
                "Civil Rights Movement and legislation",
                "Vietnam War and anti-war movement",
                "Counterculture and social changes",
                "Great Society programs",
                "Watergate and political distrust"
            ],
            timeline: [
                {
                    date: "1947",
                    title: "Truman Doctrine",
                    description: "Containment policy begins"
                },
                {
                    date: "1954",
                    title: "Brown v. Board of Education",
                    description: "Supreme Court ends school segregation"
                },
                {
                    date: "1963",
                    title: "March on Washington",
                    description: "MLK delivers 'I Have a Dream' speech"
                },
                {
                    date: "1964",
                    title: "Civil Rights Act",
                    description: "Prohibits discrimination"
                },
                {
                    date: "1973",
                    title: "Roe v. Wade",
                    description: "Supreme Court legalizes abortion"
                }
            ],
            causesEffects: [
                {
                    title: "Civil Rights Movement",
                    steps: [
                        {
                            title: "Brown v. Board",
                            description: "Legal foundation for desegregation"
                        },
                        {
                            title: "Nonviolent Protests",
                            description: "Montgomery Bus Boycott, sit-ins, marches"
                        },
                        {
                            title: "Federal Legislation",
                            description: "Civil Rights Act, Voting Rights Act"
                        },
                        {
                            title: "Social Change",
                            description: "End of legal segregation, but challenges remain"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "I Have a Dream",
                    date: "1963",
                    author: "Martin Luther King Jr.",
                    preview: "I have a dream that one day this nation will rise up..."
                }
            ]
        },
        9: {
            number: 9,
            name: "Modern America",
            dates: "1980-Present",
            difficulty: 3,
            studyTime: 150,
            themes: [
                "Reagan Revolution",
                "End of Cold War",
                "Globalization",
                "Post-9/11 America",
                "Technology Revolution"
            ],
            skills: [
                "Causation",
                "Continuity and Change",
                "Comparison",
                "Contextualization"
            ],
            keyConcepts: [
                "Reaganomics and conservative shift",
                "End of Cold War and fall of Soviet Union",
                "Globalization and economic changes",
                "9/11 and War on Terror",
                "Technology revolution and internet",
                "Contemporary social and political issues"
            ],
            timeline: [
                {
                    date: "1980",
                    title: "Reagan Elected",
                    description: "Conservative revolution begins"
                },
                {
                    date: "1989",
                    title: "Fall of Berlin Wall",
                    description: "Symbolic end of Cold War"
                },
                {
                    date: "2001",
                    title: "9/11 Attacks",
                    description: "Terrorist attacks change American foreign policy"
                },
                {
                    date: "2008",
                    title: "Financial Crisis",
                    description: "Great Recession impacts economy"
                },
                {
                    date: "2020",
                    title: "COVID-19 Pandemic",
                    description: "Global health crisis transforms society"
                }
            ],
            causesEffects: [
                {
                    title: "End of Cold War",
                    steps: [
                        {
                            title: "Soviet Economic Problems",
                            description: "Stagnation and inability to compete"
                        },
                        {
                            title: "Reagan's Policies",
                            description: "Military buildup and pressure on USSR"
                        },
                        {
                            title: "Fall of Communism",
                            description: "Eastern Europe and Soviet Union collapse"
                        },
                        {
                            title: "New World Order",
                            description: "U.S. as sole superpower"
                        }
                    ]
                }
            ],
            primarySources: [
                {
                    title: "Reagan's Berlin Wall Speech",
                    date: "1987",
                    author: "Ronald Reagan",
                    preview: "Mr. Gorbachev, tear down this wall!"
                }
            ]
        }
    },
    
    // AP Exam Skills
    skills: [
        { id: "contextualization", name: "Contextualization" },
        { id: "causation", name: "Causation" },
        { id: "comparison", name: "Comparison" },
        { id: "continuity-change", name: "Continuity and Change" },
        { id: "argumentation", name: "Argumentation" },
        { id: "evidence", name: "Using Evidence" }
    ],
    
    // Practice Questions (sample)
    practiceQuestions: {
        saq: [
            {
                id: "saq-1",
                period: 3,
                question: "Briefly explain ONE cause of the American Revolution.",
                points: 1
            },
            {
                id: "saq-2",
                period: 5,
                question: "Briefly explain ONE way the Civil War changed American society.",
                points: 1
            }
        ],
        dbq: [
            {
                id: "dbq-1",
                period: 7,
                prompt: "Evaluate the extent to which the Progressive movement was successful in achieving its goals.",
                documents: 7,
                points: 7
            }
        ],
        leq: [
            {
                id: "leq-1",
                period: 4,
                prompt: "Evaluate the extent to which the Market Revolution changed the American economy in the period 1800-1848.",
                points: 6
            }
        ]
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.APUSH_DATA = APUSH_DATA;
}
