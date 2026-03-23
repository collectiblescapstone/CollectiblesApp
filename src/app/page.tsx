'use client'

// React
import React, { useEffect, useState } from 'react'
import {
    LuHandshake,
    LuScanEye,
    LuSearch,
    LuLinkedin,
    LuGithub
} from 'react-icons/lu'

// Next.js
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Chakra UI
import {
    Button,
    Heading,
    Text,
    Tabs,
    HStack,
    VStack,
    Spinner
} from '@chakra-ui/react'

// Child Components
import { Logo } from '@/components/logo/Logo'
import TeamMember from '@/components/landing/TeamMember'
import { useAuth } from '@/context/AuthProvider'
import { Capacitor } from '@capacitor/core'
import TitleLogo from '@/components/auth/TitleLogo'

const Landing: React.FC = () => {
    const { session } = useAuth()
    const { replace } = useRouter()

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const href = e.currentTarget.getAttribute('href') || ''
        if (href.startsWith('#')) {
            e.preventDefault()
            const id = href.slice(1)
            const el = document.getElementById(id)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                ;(el as HTMLElement).focus({ preventScroll: true })
            }
        }
    }

    const [launch, setLaunch] = useState(false)
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        const target = new Date(2026, 3, 7, 10, 0, 0) // april 7th, 10:00am

        const interval = setInterval(() => {
            const now = new Date()
            const difference = target.getTime() - now.getTime()

            const d = Math.floor(difference / (1000 * 60 * 60 * 24))
            setDays(d)

            const h = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            )
            setHours(h)

            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            setMinutes(m)

            const s = Math.floor((difference % (1000 * 60)) / 1000)
            setSeconds(s)

            if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
                setLaunch(true)
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // team members list
    const teamMembers = [
        {
            name: 'Tânia Da Silva',
            role: 'Front-end Lead',
            links: [
                {
                    href: 'https://github.com/taniadasilva17',
                    icon: <LuGithub />
                },
                {
                    href: 'https://www.linkedin.com/in/tania-da-silva823',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Architected the front-end framework and developed the
                    application&apos;s page structures, ensuring a UI layout
                    prepared for full-stack integration.
                </p>
            )
        },
        {
            name: 'Norman Liang',
            role: 'Data Lead',
            links: [
                { href: 'https://github.com/Norman-Liang', icon: <LuGithub /> },
                {
                    href: 'https://www.linkedin.com/in/norman-liang-03261122a',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Architected the database framework and proper API routing,
                    integrating the dynamic data with front end functionalities.
                </p>
            )
        },
        {
            name: 'Elite Lu',
            role: 'Design Lead',
            links: [
                { href: 'https://github.com/honkita', icon: <LuGithub /> },
                {
                    href: 'https://www.linkedin.com/in/elitelu',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Directed the end-to-end UX design and facilitated full-stack
                    connectivity while managing dataset accuracy and
                    co-facilitated the weekly Scrum meetings.
                </p>
            )
        },
        {
            name: 'Ishpreet Nagi',
            role: 'Back-end Lead',
            links: [
                { href: 'https://github.com/IshpreetNagi', icon: <LuGithub /> },
                {
                    href: 'https://www.linkedin.com/in/ishpreetnagi',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Developed the core trade-matching algorithm and integrated
                    the front-end with back-end services to transform static
                    pages into a functional, data-driven application.
                </p>
            )
        },
        {
            name: 'James Nickoli',
            role: 'Vision Model Lead',
            links: [
                { href: 'https://github.com/rsninja722', icon: <LuGithub /> },
                {
                    href: 'https://www.linkedin.com/in/james-nickoli',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Developed the Computer Vision model responsible for
                    real-time card identification and recognition from camera
                    input.
                </p>
            )
        },
        {
            name: 'Kenneth Ong',
            role: 'QA Lead',
            links: [
                { href: 'https://github.com/kennethkvs', icon: <LuGithub /> },
                {
                    href: 'https://www.linkedin.com/in/kennethkvs',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Developed the user authentication flows and testing
                    framework while co-managing project milestones and weekly
                    Scrum meetings.
                </p>
            )
        },
        {
            name: 'Geon Youn',
            role: 'ML Lead',
            links: [
                { href: 'https://github.com/geon-youn', icon: <LuGithub /> },
                {
                    href: 'https://www.linkedin.com/in/geon-youn',
                    icon: <LuLinkedin />
                }
            ],
            description: (
                <p>
                    Engineered the NLP search features and semantic matching
                    engine while assisting with the development of the camera
                    vision system.
                </p>
            )
        }
    ]

    useEffect(() => {
        if (session) {
            replace('/home')
        } else if (Capacitor.isNativePlatform()) {
            replace('/sign-in')
        }
    }, [session, replace])

    return Capacitor.isNativePlatform() ? (
        <VStack
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
        >
            <TitleLogo />
            <Spinner size="xl" />
        </VStack>
    ) : (
        <>
            <style>
                {`
          html, body, #__next, main {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
            scroll-behavior: smooth; /* enable smooth anchor scrolling */
          }

          .kollec-body {
            background-color: #f2f2f2;
            min-height: 100vh;
          }

          .container {
            width: 95%;
            max-width: 1024px;
            margin: 20px auto;
            padding: 10px;
            background: linear-gradient(0deg, rgba(242, 199, 92, 0.7) 0%, #F2C75C 100%);
            border: 3px solid #003b49;
            border-radius: 15px;
            box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2);
            position: relative;
          }


          .main-content {
            display: flex;
            flex-direction: column; 
            gap: 15px;
          }

          .content {
            width: 100%; 
            background: url('/Assets/img/LandingPage/stars.webp');
            border-radius: 10px;
            padding: 20px;
            border: 3px inset #003b49;
            box-sizing: border-box;
          }

          .navigation {
            width: 100%; 
            background-color: #f2f2f2;
            border-radius: 10px;
            padding: 10px 20px;
            border: 2px inset #003b49;
            box-sizing: border-box;
            height: 8rem;
          }

          .nav-actions {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            width: 80%;
            min-width: 80%;
          }

          /* keep nav title and actions aligned */
          .navigation h2 {
            font-size: 1.9em;
            margin-top: 0;
            color: #003b49;
          }

          /* Ensure anchor wrappers and buttons align consistently */
          .nav-actions a {
            display: inline-flex;
            align-items: center;
            text-decoration: none;
            height: 36px; 
          }

          .nav-actions button {
            margin: 0; /* remove any button-specific top margins */
            padding: 6px 12px;
            height: 36px; /* fixed height for consistent alignment */
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
          }

          /* Make sure anchor wrappers also size to the button so everything lines up */
          .nav-actions a { height: 36px; display: inline-flex; align-items: center; }

          .navigation ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 25px; /* Space between links */
          }

          .navigation li {
            margin-bottom: 9px;
            margin-left: 22px;
          }

          .card {
            background-color: #f2f2f2;
            padding: 15px;
            margin-top: 15px;
            border-radius: 10px;
            border: 3px inset #003b49;
            position: relative;
            outline: none;
          }

          /* ensure anchored sections are visible under any sticky header */
          .card { scroll-margin-top: 90px; }
          
          .timer-card {
            text-align: center;
          }

          .card:focus {
            box-shadow: 0 0 0 3px rgba(0,59,73,0.15);
          }

          .card h1, .card h2 {
            font-size: 1.9em;
            margin-bottom: 21px;
            color: #003b49;
          }

          .card p {
            font-size: 1.0em;
            line-height: 1.3em;
            margin-bottom: 21px;
            color: #000000;
          }

          .card li {
            list-style-image: url('/Assets/img/LandingPage/pikachu.webp');
            font-size: 1.3em;
            color: #003b49;
          }
          
          .card li p {
            font-size: 0.8em;
            color: #000000;
            margin-left: 8px; /* space between bullet and text */
          }

          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 1.9em;
            color: #003b49;
          }
        `}
            </style>

            <div className="kollec-body">
                <div className="container">
                    {/* Main content */}
                    <div className="main-content">
                        {/* Navigation Section */}
                        <nav
                            className="navigation"
                            aria-label="Kollec main navigation"
                        >
                            <HStack
                                height="100%"
                                width="100%"
                                align="center"
                                pt={1}
                                pb={1}
                            >
                                <VStack height="100%">
                                    <Logo
                                        data-testid="logo"
                                        style={{
                                            color: '#F2C75C',
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    />

                                    <Text
                                        fontSize="md"
                                        fontWeight="bold"
                                        color="brand.turtoise"
                                    >
                                        Kollec
                                    </Text>
                                </VStack>

                                <div className="nav-actions">
                                    <a
                                        href="#about"
                                        onClick={handleAnchorClick}
                                        style={{ textDecoration: 'none' }}
                                        aria-label="Scroll to About section"
                                    >
                                        <Button
                                            variant="ghost"
                                            color="brand.turtoise"
                                        >
                                            About
                                        </Button>
                                    </a>
                                    <a
                                        href="#features"
                                        onClick={handleAnchorClick}
                                        style={{ textDecoration: 'none' }}
                                        aria-label="Scroll to Features section"
                                    >
                                        <Button
                                            variant="ghost"
                                            color="brand.turtoise"
                                        >
                                            Features
                                        </Button>
                                    </a>
                                    <Link
                                        href={{
                                            pathname: '/sign-up',
                                            query: {}
                                        }}
                                        style={{ textDecoration: 'none' }}
                                        aria-label="Go to Sign Up page"
                                    >
                                        <Button
                                            variant="ghost"
                                            color="brand.turtoise"
                                        >
                                            Sign Up
                                        </Button>
                                    </Link>
                                    <Link
                                        href={{
                                            pathname: '/sign-in',
                                            query: {}
                                        }}
                                        style={{ textDecoration: 'none' }}
                                        aria-label="Go to Login page"
                                    >
                                        <Button
                                            variant="ghost"
                                            color="brand.turtoise"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            </HStack>
                        </nav>

                        {/* Content Section */}
                        <div className="content">
                            {launch ? (
                                <div className="card timer-card">
                                    <h1>
                                        Come see our demo at the capstone expo!
                                    </h1>
                                </div>
                            ) : (
                                <div className="card timer-card">
                                    <h1>
                                        {days}:{String(hours).padStart(2, '0')}:
                                        {String(minutes).padStart(2, '0')}:
                                        {String(seconds).padStart(2, '0')}
                                    </h1>
                                    <p>Time until launch!</p>
                                </div>
                            )}

                            <div className="card" id="about" tabIndex={-1}>
                                <h1>About Us</h1>
                                <p>
                                    Kollec is a collection management platform
                                    developed as a final year Computer Science
                                    capstone project at McMaster University. Our
                                    mission is to bridge the gap between
                                    physical collectibles and digital
                                    organization using Computer Vision and
                                    Natural Language Processing.
                                </p>
                                <p>
                                    Beyond organization, Kollec actively
                                    facilitates community engagement by
                                    intelligently matching users who possess
                                    viable, mutually beneficial trades.
                                </p>
                                <ul>
                                    {teamMembers.map((m) => (
                                        <li key={m.name}>
                                            <TeamMember
                                                name={m.name}
                                                role={m.role}
                                                links={m.links}
                                                description={m.description}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="card" id="features" tabIndex={-1}>
                                <h2>Features</h2>
                                <Tabs.Root
                                    defaultValue="Identification"
                                    variant="line"
                                >
                                    <Tabs.List>
                                        <Tabs.Trigger value="Identification">
                                            <LuScanEye />
                                            Identification
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="Search">
                                            <LuSearch />
                                            Search
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="Trading">
                                            <LuHandshake />
                                            Trading
                                        </Tabs.Trigger>
                                        <Tabs.Indicator />
                                    </Tabs.List>
                                    <Tabs.Content value="Identification">
                                        <Heading as="h3">
                                            Card Identification
                                        </Heading>
                                        <Text>
                                            Using advanced machine learning
                                            techniques, Kollec can rapidly
                                            identify collectibles in real time
                                            using just your phone&apos;s camera.
                                            No more manual entry or searching
                                            through endless lists!
                                        </Text>
                                        <Heading as="h4">
                                            The Technology
                                        </Heading>
                                        <Text>
                                            Kollec first uses a custom trained
                                            YOLO segmentation machine learning
                                            model to locate any cards in view of
                                            your device&apos;s camera. We then
                                            use perceptual hashing to match the
                                            found cards against our database of
                                            known cards. Once a match is found,
                                            it is shown to you so you can
                                            quickly add the card to your digital
                                            collection.
                                        </Text>
                                    </Tabs.Content>
                                    <Tabs.Content value="Search">
                                        <Heading as="h3">Card Search</Heading>
                                        <Text>
                                            Kollec allows you to search your
                                            Pokémon collection using natural
                                            language. Whether you remember the
                                            exact name of the card or just a
                                            description of the Pokémon, our
                                            intelligent search understands the
                                            visual context of your cards to
                                            bring you the right results
                                            instantly.
                                        </Text>
                                        <Heading as="h4">
                                            The Technology
                                        </Heading>
                                        <Text>
                                            We utilize a CLIP (Contrastive
                                            Language-Image Pre-training) model
                                            to generate mathematical embeddings
                                            for every card image, which are
                                            stored and loaded at startup. When
                                            you enter a query, a quantized
                                            version of the model runs locally on
                                            your device to turn your text into a
                                            vector and compare it against our
                                            database. By calculating the
                                            shortest distance between these
                                            embeddings, the app identifies and
                                            displays the most relevant cards.
                                        </Text>
                                    </Tabs.Content>
                                    <Tabs.Content value="Trading">
                                        <Heading as="h3">
                                            Trading Algorithm
                                        </Heading>
                                        <Text>
                                            Connect with local collectors to
                                            complete your set through our
                                            intelligent TradePost matching
                                            system. By syncing your location and
                                            wishlist, Kollec automatically pairs
                                            you with nearby trainers who have
                                            the specific cards you need and are
                                            looking for the ones you have.
                                        </Text>
                                        <Heading as="h4">
                                            The Technology
                                        </Heading>
                                        <Text>
                                            TradePost utilizes a location-based
                                            algorithm that converts user
                                            addresses into precise longitude and
                                            latitude coordinates to calculate
                                            real-time distances between
                                            collectors. The system filters the
                                            database for users with active
                                            &quot;forTrade&quot; flags and
                                            cross-references them against your
                                            specific WishlistEntry table to find
                                            mutual matches. By applying a
                                            customizable distance radius the
                                            algorithm ensures you only see
                                            relevant trade opportunities within
                                            a reachable proximity for safe,
                                            in-person exchanges.
                                        </Text>
                                    </Tabs.Content>
                                </Tabs.Root>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="footer">
                    <p>&copy; 2026 TSH B129</p>
                </footer>
            </div>
        </>
    )
}

export default Landing
