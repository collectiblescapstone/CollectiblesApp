'use client';
import { Button } from '@chakra-ui/react';

import React, { useEffect, useState } from 'react';

const Landing: React.FC = () => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        (el as HTMLElement).focus({ preventScroll: true });
      }
    }
  };

  const [launch, setLaunch] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {

    const target = new Date(2026, 3, 7, 10, 0, 0); // april 7th, 10:00am

    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      setDays(d);

      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      setHours(h);

      const m = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      setMinutes(m);

      const s = Math.floor(
        (difference % (1000 * 60)) / (1000)
      );
      setSeconds(s);

      if (d <= 0 && h <= 0 && m <= 0 && s <= 0){
        setLaunch(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
            <nav className="navigation" aria-label="Kollec main navigation">
              <h2>Kollec</h2>
              <div className="nav-actions" style={{ marginBottom: '8px' }}>
                <a
                  href="#about"
                  onClick={handleAnchorClick}
                  style={{ textDecoration: 'none' }}
                  aria-label="Scroll to About section"
                >
                  <Button variant="ghost" color="brand.turtoise">About</Button>
                </a>
                <a
                  href="#features"
                  onClick={handleAnchorClick}
                  style={{ textDecoration: 'none' }}
                  aria-label="Scroll to Features section"
                >
                  <Button variant="ghost" color="brand.turtoise">Features</Button>
                </a>
                <a
                  href="#faq"
                  onClick={handleAnchorClick}
                  style={{ textDecoration: 'none' }}
                  aria-label="Scroll to FAQ section"
                >
                  <Button variant="ghost" color="brand.turtoise">FAQ</Button>
                </a>
                <a
                  href="/sign-up"
                  style={{ textDecoration: 'none' }}
                  aria-label="Go to Sign Up page"
                >
                  <Button variant="ghost" color="brand.turtoise">Sign Up</Button>
                </a>
                <a
                  href="/sign-in"
                  style={{ textDecoration: 'none' }}
                  aria-label="Go to Login page"
                >
                  <Button variant="ghost" color="brand.turtoise">Login</Button>
                </a>
              </div>
            </nav>

            {/* Content Section */}
            <div className="content">
              {launch ? (
                <div className='card timer-card'>
                  <h1>Come see our demo at the capstone expo!</h1>
                </div>
              ): (
              <div className='card timer-card'>
                <h1>
                  {days}:
                  {String(hours).padStart(2, '0')}:
                  {String(minutes).padStart(2, '0')}:
                  {String(seconds).padStart(2, '0')}
                </h1>
                <p>Time until launch!</p>
              </div>
              )}

              <div className="card" id="about" tabIndex={-1}>
                 <h1>About Us</h1>
                 <p>
                   Kollec is a final year computer science capstone project created by Tania Da Silva, Norman Liang, Elite Lu, Ishpreet Nagi, James Nickoli, Kenneth Ong, and Geon Youn.
                 </p>
                 <ul>
                   <li>hi</li>
                 </ul>
               </div>

              <div className="card" id="features" tabIndex={-1}>
                 <h2>Features</h2>
                 <p>
                   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Metus nunc
                   ullamcorper ipsum enim natoque orci dignissim consequat nascetur.
                   Molestie inceptos phasellus purus sapien; nam ligula adipiscing.
                 </p>
               </div>

              <div className="card" id="faq" tabIndex={-1}>
                 <h2>FAQ</h2>
                 <p>
                   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Metus nunc
                   ullamcorper ipsum enim natoque orci dignissim consequat nascetur.
                   Molestie inceptos phasellus purus sapien; nam ligula adipiscing.
                 </p>
               </div>
             </div>


           </div>
         </div>

         <footer className="footer">
           <p>&copy; 2026 TSH B129</p>
         </footer>
       </div>
     </>
   );
 };

 export default Landing;