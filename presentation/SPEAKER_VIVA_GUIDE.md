# Website Doctor — College Presentation & Viva Guide
**Project:** Website Doctor – AI-Powered Real-Time Website Monitoring & Health Analysis Platform  
**Presenter:** Piyush Raj  
**Role:** Lead Developer & Presenter  
**Live Application:** [https://website-doctor-bmka.vercel.app](https://website-doctor-bmka.vercel.app)  
**GitHub Repository:** [https://github.com/pixelpiyushh/-website-doctor](https://github.com/pixelpiyushh/-website-doctor)

---

## 🎯 Presentation Files Available
1. **PowerPoint Presentation (.pptx):**
   - Path: `Website_Doctor_College_Presentation.pptx`
   - Format: Standard 16:9 Widescreen (Microsoft PowerPoint, Google Slides, LibreOffice Impress).
2. **Interactive Web Presentation Deck (.html):**
   - Path: `presentation/index.html`
   - Open directly in any web browser (Chrome, Edge, Firefox).
   - Press **`F`** for Fullscreen mode.
   - Press **`→`** or **`Space`** for Next Slide, **`←`** for Previous Slide.
   - Press **`S`** to toggle live **Speaker Notes** drawer.
   - Press **`Ctrl + P`** to export an ultra-crisp, high-definition **PDF presentation deck**.

---

## 🗣️ Slide-by-Slide Viva Script (What to say verbally)

### Slide 1 — Title Slide
- **English:** "Good morning respected professors and evaluators. My name is Piyush Raj. Today I am presenting my mini-project titled **Website Doctor – AI-Powered Real-Time Website Monitoring & Health Analysis Platform**. In today's digital era, if a business website goes down, sales stop and user trust is lost. Website Doctor serves as a digital doctor for websites, diagnosing performance, uptime, and security health in real time."
- **Hindi/Hinglish:** "Respected sir/ma'am, mera naam Piyush Raj hai. Aaj main apna mini project present kar raha hu jiska naam hai 'Website Doctor'. Jaise hum insaan regularly checkup ke liye doctor ke paas jaate hain, waise hi modern websites ko bhi downtime, slow speed aur SSL expiry se bachane ke liye ek continuous diagnostic system ki zaroorat hoti hai. Website Doctor wahi kaam real time me karta hai."

### Slide 2 — Introduction
- **What to highlight:**
  - Websites face sudden outages, sluggish server response, and expired SSL certificates.
  - Non-technical owners and busy developers don't have hours to configure complex enterprise monitoring.
  - Point to the visual: **Target Website → Automated Health Check → Smart Diagnosis → Unified Health Report**.
- **Key point:** Website Doctor acts as a single pane of glass for website vitals.

### Slide 3 — Problem Statement
- **What to highlight:**
  - **Silent Downtime:** Websites crash without warning; owners often learn about it only when customers complain.
  - **Sluggish Latency:** Even a 2-second delay drops conversions and hurts Google SEO rankings.
  - **Silent SSL Expirations:** Users see terrifying "Your connection is not private" browser warnings.
  - **Tool Fragmentation:** Checking uptime, ping, SSL, and HTTP headers usually requires 4 different websites or command-line tools.

### Slide 4 — Proposed Solution
- **What to highlight:**
  - Explain the streamlined flow: The user types a URL → Backend runs an automated probe → Calculates response metrics → Displays clear diagnostics on the dashboard.
  - Emphasize that anyone, even someone with zero server knowledge, can understand if their website is healthy.

### Slide 5 — Project Objectives
- **Run through the 6 goals clearly:**
  1. Real-time availability tracking (Online / Slow / Down).
  2. Latency measurement (Time to First Byte in milliseconds).
  3. HTTP/HTTPS status code auditing (200 OK, redirects, 404, 500).
  4. SSL/TLS certificate inspection (validity, expiration days, issuer).
  5. Computation of a weighted 0–100 Health Score.
  6. Live push updates via Server-Sent Events (SSE).

### Slide 6 — Key Features
- **Highlight:** Real-Time Monitoring is the **flagship feature**.
- Mention that the system doesn't just do a one-time check; it continues monitoring in the background and pushes state changes live to the screen without page reloads.

### Slide 7 — How It Works (Workflow)
- Walk through the 9-step flowchart smoothly:
  - User URL Input → Backend Validation → HTTP/HEAD Probe → Timer Latency Capture → TLS Certificate Inspection → Health Score Calculation → Dashboard Render → Worker Heartbeat → Real-time SSE Stream.

### Slide 8 — System Architecture
- **Faculty love architecture slides!**
  - **Presentation Layer:** React 18 + Vite (Responsive, modern dark UI).
  - **API Layer:** Node.js + Express (Handles REST requests and SSE event stream).
  - **Diagnostic Worker:** Asynchronous background worker inspecting external targets.
  - **Data Layer:** PGlite / PostgreSQL-compatible relational storage for check logs.

### Slide 9 — Technologies Used
- **Be honest and confident:**
  - Frontend: React 18, Vite, Vanilla CSS.
  - Backend: Node.js, Express, TypeScript.
  - Storage: PGlite / PostgreSQL.
  - Deployment: Vercel (Frontend), Render (Backend), GitHub.
  - Protocol: HTTP/HTTPS, TLS socket, Server-Sent Events (SSE).

### Slide 10 — Dashboard / UI Mockup
- Walk the evaluators through the UI components:
  - Header: Target URL and real-time status pill (ONLINE).
  - Score: Overall Health Score (e.g., 87/100).
  - KPI Cards: Response Time (214 ms), HTTP Status (200 OK), SSL Certificate (Valid, 78 days left).
  - Bottom Panels: Plain-English diagnosis tips + live timestamped event feed.

### Slide 11 — Real-Time Monitoring in Action
- Walk through the timeline:
  - 10:00 AM 🟢 Online (180ms)
  - 10:05 AM 🟢 Online (195ms)
  - 10:10 AM 🟡 Slow Response (1450ms)
  - 10:15 AM 🔴 Outage (502 Bad Gateway)
  - 10:20 AM 🔴 Outage (Timeout)
  - 10:25 AM 🟢 Recovered & Back Online (210ms)
- **Key point:** Explain that SSE updates this live on the screen without needing the user to press refresh.

### Slide 12 — Target Users & Use Cases
- Briefly mention who benefits:
  - **Developers:** Validate new cloud deploys.
  - **Store Owners:** Prevent lost sales during micro-downtimes.
  - **Startups:** Zero-cost API health tracking.
  - **Students:** Real-world demonstration of full-stack networking.

### Slide 13 — Advantages & Future Scope
- **Advantages:** Zero setup, instant 0-100 score, centralized tools, modern UX.
- **Future Scope:** AI root-cause analysis (LLM integration), WhatsApp/Email alert webhooks, multi-region global pings.

### Slide 14 — Conclusion & Q&A
- Read the concluding quote with confidence:
  - *"Website Doctor provides a simple, unified way to monitor and understand website health in real time."*
- End with: *"Thank you, professors. I would be pleased to answer any questions."*

---

## 💡 Top 8 Viva Questions & Recommended Answers

#### Q1: "How do you calculate the Overall Health Score (0–100)?"
> **Answer:** "Our scoring algorithm evaluates three weighted components:
> 1. **Availability (50% weight):** If the site is down or returns a 5xx server error, the availability score drops to 0.
> 2. **Performance/Latency (30% weight):** Full points for sub-300ms response times. Penalties scale up as latency crosses 800ms and 1500ms.
> 3. **SSL Security (20% weight):** Full points for valid TLS certificates with more than 30 days until expiry; deducted if SSL is expired or missing.
> The weighted sum produces a single 0–100 score."

#### Q2: "Why did you use Server-Sent Events (SSE) instead of WebSockets?"
> **Answer:** "For website monitoring, data flow is primarily **unidirectional**—the server pushes status updates to the client whenever a website's health state changes. SSE runs over standard HTTP/HTTPS, supports automatic browser reconnection natively, has lower overhead than WebSockets, and is simpler to proxy across firewalls and CDNs."

#### Q3: "How does the backend inspect SSL certificates?"
> **Answer:** "In Node.js, we initiate a TLS socket handshake using the built-in `tls` module. Once connected, we call `socket.getPeerCertificate()`, which returns the certificate's issuer, subject, validFrom, and validTo dates. We calculate the difference between validTo and the current timestamp to determine the remaining days until expiration."

#### Q4: "How do you measure response time accurately?"
> **Answer:** "We use Node.js high-resolution timers (`process.hrtime()` or `performance.now()`). We record the start time right before the HTTP request is initiated, and record the end time when the first response byte and headers arrive (TTFB - Time to First Byte)."

#### Q5: "What happens if a target website blocks your monitoring pings?"
> **Answer:** "Some websites use aggressive WAFs (like Cloudflare Captchas). To minimize blocking, our backend worker sends standard browser `User-Agent` headers and uses lightweight HTTP `HEAD` or `GET` requests without heavy crawling. In future scope, we plan to add user-configurable custom headers and proxy rotation."

#### Q6: "Where is the project deployed right now?"
> **Answer:** "The frontend is deployed globally on **Vercel** with edge caching. The backend is deployed on **Render** as a cloud web service. Both communicate over secure HTTPS."

#### Q7: "What database did you use and why?"
> **Answer:** "We used **PGlite / PostgreSQL-compatible storage**. It provides full SQL querying capabilities for time-series monitoring logs and site records, with zero heavy external database cluster overhead."

#### Q8: "Is this real or simulated?"
> **Answer:** "It is a 100% real, fully functional, deployed web application! Anyone can open our live URL, enter any active website domain (like google.com or github.com), and see live diagnostics generated in real time."
