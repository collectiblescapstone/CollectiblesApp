'use client'
import { Button, Heading, Text, Tabs } from '@chakra-ui/react'
import Link from 'next/link'

import React, { useEffect, useState } from 'react'
import {
    LuHandshake,
    LuScanEye,
    LuSearch,
    LuLinkedin,
    LuGithub
} from 'react-icons/lu'

const Landing: React.FC = () => {
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

    return (
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
            padding: 15px 20px;
            border: 2px inset #003b49;
            box-sizing: border-box;
          }

          .nav-actions {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
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
                            <h2>Kollec</h2>
                            <div
                                className="nav-actions"
                                style={{ marginBottom: '8px' }}
                            >
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
                                    href={{ pathname: '/sign-up', query: {} }}
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
                                    href={{ pathname: '/sign-in', query: {} }}
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
                                    {/*Tania*/}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>Tânia Da Silva</strong> —
                                            Front-end Lead
                                            {/* Icons now sit on the same line */}
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/taniadasilva17"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/tania-da-silva823"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Architected the front-end framework
                                            and developed the application&apos;s
                                            page structures, ensuring a UI
                                            layout prepared for full-stack
                                            integration.
                                        </p>
                                    </li>

                                    {/*Norman*/}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>Norman Liang</strong> — Data
                                            Lead
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/Norman-Liang"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/norman-liang-03261122a"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Architected the database framework
                                            and proper API routing, integrating
                                            the dynamic data with front end
                                            functionalities.
                                        </p>
                                    </li>

                                    {/* Elite */}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>Elite Lu</strong> — Design
                                            Lead
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/honkita"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/elitelu"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Directed the end-to-end UX design
                                            and facilitated full-stack
                                            connectivity while managing dataset
                                            accuracy and co-facilitated the
                                            weekly Scrum meetings.
                                        </p>
                                    </li>

                                    {/* Ishpreet */}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>Ishpreet Nagi</strong> —
                                            Back-end Lead
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/IshpreetNagi"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/ishpreetnagi"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Integrated the front-end with
                                            back-end services to transform
                                            static pages into a functional,
                                            data-driven application.
                                        </p>
                                    </li>

                                    {/* James */}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>James Nickoli</strong> —
                                            Vision Model Lead
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/rsninja722"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/james-nickoli"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Developed the Computer Vision model
                                            responsible for real-time card
                                            identification and recognition from
                                            camera input.
                                        </p>
                                    </li>

                                    {/* kenneth */}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>Kenneth Ong</strong> — QA
                                            Lead
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/kennethkvs"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/kennethkvs"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Developed the user authentication
                                            flows and testing framework while
                                            co-managing project milestones and
                                            weekly Scrum meetings.
                                        </p>
                                    </li>

                                    {/* Geon */}
                                    <li>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <strong>Geon Youn</strong> — ML Lead
                                            <div
                                                className="links"
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <a
                                                    href="https://github.com/geon-youn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuGithub />
                                                </a>
                                                <a
                                                    href="https://www.linkedin.com/in/geon-youn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <LuLinkedin />
                                                </a>
                                            </div>
                                        </div>
                                        <p>
                                            Engineered the NLP search features
                                            and semantic matching engine while
                                            assisting with the development of
                                            the camera vision system.
                                        </p>
                                    </li>
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
                                        <Tabs.Indicator />
                                        <Tabs.Trigger value="Search">
                                            <LuSearch />
                                            Search
                                        </Tabs.Trigger>
                                        <Tabs.Indicator />
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
                                            Using advance machine learning
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
                                            displays the top 15 most relevant
                                            cards within your current context.
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
