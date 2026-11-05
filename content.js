/* All site copy. Edit text here; nothing else needs to change. */
var DATA = {
    project1: {
      kind: "project",
      fullPage: true,
      flowImage: {
        src: "assets/filespace-flow.webp",
        alt: "Diagram of the workflow consolidation: the separate Workspace Main and Raw Data screens, with their problems, merge into one unified workspace covering search, filter and sort, results, double-click to view content, and preserve or export. About 60% fewer clicks in the core search to export journey.",
      },
      eyebrow: "WORKFLOW CONSOLIDATION",
      title: "FileSpace — Unified Workspace, Raw Data & Export UI",
      timeframe: "2026",
      overview:
        "A unified FileSpace workspace for an enterprise analytics platform, merging previously separate Workspace Main and Raw Data screens into one search → preview → export journey with backend-driven configurable exports.",
      problem:
        "Search, filtering, raw-data browsing, file/mail preview and export lived on disconnected screens, forcing users to navigate away and lose search context. Export columns were hardcoded, so users couldn't control what a raw-data export contained.",
      solution:
        "Restructured the information architecture in Figma first, then built the consolidated experience in React/TypeScript: a unified search-preview toolbar, contextual filters, file/mail detail cards, and a virtualized Material React Table with server-side search, sort, filter and pagination. Export fields are now fetched from the API, searchable, and selectable per export.",
      contribution:
        "Designed the consolidated workflow in Figma and implemented it end to end — the configurable export-fields feature (dynamic field discovery, searchable checkbox selection, localized labels, file vs mail and JSON/Parquet handling), the FileDetailsOnlyCard / MailDetailsOnlyCard preview flows with sanitized HTML rendering, and the state architecture split across Redux, Formik, React Hook Form, React Query and local state. Kept every existing consumer, permission and feature flag working while integrating with legacy JavaScript/AJAX infrastructure.",
      tech: [
        "React",
        "TypeScript",
        "JavaScript",
        "Redux",
        "TanStack Query",
        "Formik",
        "Yup",
        "React Hook Form",
        "Material UI",
        "Material React Table",
        "REST APIs",
        "AJAX",
        "CSS Modules",
        "Figma",
      ],
      outcome:
        "Reduced clicks in the core search-to-export path by ~60% by consolidating search, filtering, preview and export into a single screen, and cut refresh time by removing the full-page reloads the old multi-screen flow required. Exports became user-configurable instead of fixed-column, with the consolidated experience validated through integration and regression testing across search, filtering, preview, selection, export and export-history flows.",
      links: [],
    },

    project2: {
      kind: "project",
      fullPage: true,
      flowShots: {
        title: "Find it.",
        titleRest: "Get it fast. Follow the order.",
        intro:
          "From a search to a doorstep: every screen shows how fast a book can arrive, and the community feeds straight back into buying.",
        rows: [
          {
            label: "Discover & choose",
            shots: [
              {
                src: "assets/bookrush/home.webp",
                label: "Home",
                note: "Instant-delivery banner, categories and books in stock near you.",
              },
              {
                src: "assets/bookrush/discover.webp",
                label: "Discover",
                note: "Search, quick filters, recent and trending searches.",
              },
              {
                src: "assets/bookrush/book-detail.webp",
                label: "Book details",
                note: "Buy or rent, with the delivery ETA shown up front.",
              },
              {
                src: "assets/bookrush/cart.webp",
                label: "Cart",
                note: "Grouped by delivery speed, with buy/rent switching.",
              },
            ],
          },
          {
            label: "Order, track & connect",
            shots: [
              {
                src: "assets/bookrush/checkout.webp",
                label: "Checkout",
                note: "Address, delivery option and payment in one screen.",
              },
              {
                src: "assets/bookrush/tracking.webp",
                label: "Order tracking",
                note: "Live six-stage timeline with a running ETA.",
              },
              {
                src: "assets/bookrush/community.webp",
                label: "Community",
                note: "For You, Following and Trending feeds, plus book clubs.",
              },
              {
                src: "assets/bookrush/profile.webp",
                label: "Profile",
                note: "Followers, saved books, reviews, posts and clubs.",
              },
            ],
          },
        ],
        band: {
          statValue: "66",
          statTitle: "Tests, green CI",
          statText: "lint · typecheck · tests · iOS bundle",
          points: [
            {
              title: "Delivery-aware",
              text: "Instant, standard or unavailable on every book.",
            },
            {
              title: "Buy or rent",
              text: "30-day rentals, set per title.",
            },
            {
              title: "Smart cart",
              text: "Split by delivery speed; instant only if every item qualifies.",
            },
            {
              title: "Live tracking",
              text: "A six-stage order timeline that keeps moving.",
            },
          ],
        },
      },
      eyebrow: "MOBILE APP",
      title: "BookRush - Quick-Commerce Book Discovery & Delivery App",
      timeframe: "2026 · Personal project",
      overview:
        "BookRush is a quick-commerce app for books, built with React Native, Expo and TypeScript. Find a book, see whether a store near you has it, buy it or rent it for 30 days, and get it delivered - instantly if it is stocked nearby, or on standard shipping if it is not.\n\nA reader community of posts, likes, comments and book clubs sits alongside the shopping flow. Posts reference books that link straight into the same detail screen search would reach, so the community feeds the core buying loop.",
      problem:
        "Delivery speed is what makes quick commerce work, yet it is often only clear at checkout. I wanted BookRush to answer one question from the first search result: can I have this book now, and how fast?\n\nThat meant making delivery availability part of every book on every screen, letting one basket mix instant and standard items without confusing the buyer, and supporting buy-or-rent - all without a backend, while keeping loading, empty and error states real and reachable.",
      solution: {
        intro:
          "Built the app as layered, testable frontend code, with an API-shaped mock service layer standing in for a backend.",
        bullets: [
          "Modelled delivery as a tagged union (INSTANT with an ETA, STANDARD, UNAVAILABLE) on every book, so one DeliveryAvailability component renders the same badge on cards, search results, book details and the cart - and the unavailable case cannot be forgotten.",
          "Built buy-or-rent into the cart line and grouped the cart by delivery speed: checkout offers instant delivery only when every item qualifies, quoted from the slowest item plus a picking buffer.",
          "Split state by who owns it: Zustand for the cart, session and likes (persisted with AsyncStorage), TanStack Query for anything server-shaped (books, feed, orders), and local state for UI-only concerns.",
          "Simulated order tracking as a six-stage state machine (CONFIRMED to DELIVERED) inside the order service, so progress continues while you are on another screen; the tracking screen polls every 2.5 seconds, the way it would against a real endpoint.",
          "Made the mock service layer behave like a network - latency, typed errors, and a Settings switch that forces failures - and routed every data-driven section through one AsyncBoundary, so loading, empty and error states are all reachable.",
          "Created a design-token UI kit (Text, Button, BottomSheet, Chip, Skeleton and more), a custom animated tab bar, and Reanimated micro-interactions that run on the UI thread.",
        ],
      },
      contribution:
        "Designed and built the app end to end: the product flows, the design tokens and UI kit, every screen (home, discover, book details, cart, checkout, order tracking, community, clubs and profile), the state architecture and the mock service layer.\n\nWrote the frontend system-design document covering layering, state ownership, data flow and trade-offs, along with 66 tests focused on logic that is easy to get wrong and expensive to notice - pricing, delivery eligibility, stock limits and the order state machine - plus the flows a user would actually hit.",
      contributionWide: true,
      tech: [
        "React Native",
        "Expo",
        "Expo Router",
        "TypeScript",
        "Zustand",
        "TanStack Query",
        "React Native Reanimated",
        "React Hook Form",
        "Zod",
        "AsyncStorage",
        "Jest",
        "React Native Testing Library",
        "GitHub Actions",
      ],
      outcome:
        "A complete, runnable app covering the whole loop: browse and search, delivery-aware book details, buy or rent, a mixed-speed cart, checkout, live order tracking, order history with one-tap reorder, and a reader community with book clubs - running on iOS, Android and the web through Expo.\n\nBacked by 66 tests across pricing, delivery eligibility, the cart store, services and the order clock, plus key components and flows, and a CI pipeline that runs lint, typecheck, tests and an iOS bundle on every push and pull request.",
      links: [
        {
          label: "Demo Video",
          url: "https://drive.google.com/file/d/1su515UAKEqHjjVXR-JU-542hb5B55prm/view?usp=sharing",
        },
      ],
    },

    project3: {
      kind: "project",
      fullPage: true,
      flowPanels: {
        title: "One agent at a time.",
        titleRest: "Then: three lanes, flat memory.",
        intro:
          "The sync held up for small tenants and crawled at six figures. Same pipeline, reordered so runtime stops being the sum of its parts and memory stops tracking tenant size.",
        panels: [
          {
            tone: "problem",
            label: "Before",
            heading: "Sequential sync",
            viz: "sequence",
            bars: ["Agent 1", "Agent 2", "Agent 3"],
            axis: "runtime = every agent, added up",
            notes: [
              {
                title: "One agent at a time",
                text: "Mail server agents were processed strictly in sequence, so total runtime was the sum of every agent's runtime.",
              },
              {
                title: "Whole tenant in memory",
                text: "The fetch returned a fully materialized List<User>, so every user object was held before processing began and memory grew with tenant size.",
              },
              {
                title: "100 per page, logged per user",
                text: "Directory pages came back at the API default of 100, while a full attribute map was written for every single user at production log level.",
              },
            ],
          },
          {
            tone: "fix",
            label: "After",
            heading: "Bounded parallelism",
            viz: "parallel",
            bars: ["Agent 1", "Agent 2", "Agent 3"],
            axis: "3-thread pool - runtime = the slowest lane",
            notes: [
              {
                title: "Three lanes, deliberately",
                text: "Agent tasks run through a thread pool capped at 3. Each task is a remote call plus database work, so the limit is the DB and the network, not CPU - a larger pool would move the bottleneck onto shared infrastructure.",
              },
              {
                title: "Batched, then released",
                text: "Users are pulled and processed in fixed-size batches, so peak memory is bounded by batch size instead of tenant size. An iterator-based API keeps any future caller from reintroducing the full-list load.",
              },
              {
                title: "999 per page, dumps at DEBUG",
                text: "Roughly an order of magnitude fewer round trips for a 100k-user tenant, and per-user output stops costing I/O on every sync.",
              },
              {
                title: "Retries that end",
                text: "A retry counter persisted per item lets the scheduler reprocess transient failures, and mark an item permanently failed once it passes the threshold.",
              },
            ],
          },
        ],
        band: {
          statValue: "~50%",
          statTitle: "Fewer sync bottlenecks",
          statText: "logging changes alone: 10-15%",
          points: [
            {
              title: "Parallel, capped",
              text: "Three agent lanes, sized to the DB and network.",
            },
            {
              title: "Flat memory",
              text: "Peak follows batch size, not tenant size.",
            },
            {
              title: "~10x fewer calls",
              text: "Directory page size raised from 100 to 999.",
            },
            {
              title: "Self-healing",
              text: "Transient faults retry; permanent ones stop.",
            },
          ],
        },
      },
      eyebrow: "BACKEND · PERFORMANCE",
      title: "User Sync — Scaling Enterprise Directory Sync to 100k+ Users",
      timeframe: "2024–2025 · ZL Technologies",
      overview:
        "A backend service that syncs enterprise users from external directory providers - Microsoft 365 and Google Directory - into an enterprise data management platform. Discovery data is written to a temporary index, compared against the existing index, and the resulting changes are written to the database.\n\nI worked on making it hold up for customers with six-figure user counts.",
      problem: {
        intro:
          "The sync worked fine for small tenants and slowed to a crawl at enterprise scale. For customers with 100k+ users, three things were working against it:",
        bullets: [
          "Mail server agents were processed strictly one at a time, so total runtime was the sum of every agent's runtime.",
          "The fetch method returned a fully materialized List<User>. Every user object for the entire tenant was held in memory before processing began, so memory grew with tenant size instead of staying flat.",
          "Directory pages came back 100 users at a time (the API default), and per-user debug output - including a full attribute map printed for every single user - was being written at production log level.",
        ],
      },
      solution: {
        intro:
          "Traced the sync end to end, then fixed the bottlenecks in the order they had to land.",
        bullets: [
          "Parallel agent processing. Wrapped each mail server agent task in a Runnable, collected them into a task list, and executed them through a thread pool manager rather than sequentially.",
          "The trade-off: the pool is capped at 3 threads, not scaled up. Each task does both a remote directory call and database work, so the limiting resource is the DB and the network, not CPU. A larger pool would have shifted the bottleneck onto shared infrastructure that other tenants depend on, trading a faster sync for a less stable platform. Three gave a meaningful speedup with predictable load.",
          "Lazy, batched processing instead of global accumulation. The full-list fetch was survivable while the sync ran sequentially, but parallelising made it acute: three concurrent agents each accumulating a tenant's worth of users exhausted the heap, and I hit an OutOfMemoryError in testing. So the memory fix had to land before the speedup could ship.",
          "The real fix wasn't the iterator - it was removing the accumulation. Users are now pulled and processed in fixed-size batches and released, so peak memory is bounded by batch size instead of tenant size. An iterator-based design enforces that laziness at the API level, so no future caller can accidentally reintroduce the full-list load.",
          "Fewer network round trips. Raised the directory page size from the default 100 to 999, cutting round trips for a 100k-user tenant by roughly an order of magnitude.",
          "Cheaper logging. Moved per-user attribute dumps and per-call trace lines down to DEBUG. The information is still there when someone needs to turn it on; it just stops costing I/O on every user of every sync.",
          "Bounded retries. Transient failures - network timeouts, dropped DB connections, staging errors - no longer kill an item permanently. Each item carries a retry counter persisted in the database; the scheduler reprocesses anything below the threshold and marks items permanently failed once they exceed it. Automatic recovery from transient faults, with no infinite retry loop.",
        ],
      },
      contribution:
        "Owned the performance and reliability work end to end: traced the existing sync through its logs and code to find where time and memory were actually going, then designed and implemented the parallel execution path, the batched fetch redesign, pagination tuning, and the retry mechanism.\n\nMost of the work was reading legacy code - following how a single button click in the UI fans out into a multi-stage backend process, and understanding the design patterns the codebase already used so the changes fit the existing architecture rather than fighting it.",
      tech: [
        "Java",
        "Multithreading",
        "Thread Pools",
        "Microsoft Graph API",
        "Google Directory",
        "Batch Processing",
        "Retry & Scheduling",
        "SQL",
      ],
      outcome:
        "Synchronization bottlenecks reduced by roughly 50%, with the logging changes alone accounting for 10-15%.\n\nPeak memory is now a function of batch size rather than tenant size, so the sync scales to large tenants without heap pressure. Transient failures recover on their own instead of permanently failing an item.",
      noLinksNote:
        "Internal enterprise project — source code and demo are confidential.",
      links: [],
    },

    skills: {
      kind: "skills",
      groups: [
        {
          title: "Languages",
          items: ["Java", "Python", "C++", "JavaScript", "TypeScript"],
        },
        {
          title: "Frontend",
          items: [
            "React",
            "HTML5",
            "CSS3",
            "Flexbox",
            "CSS Grid",
            "Ext JS",
            "Bootstrap",
            "Tailwind",
            "Accessibility (WCAG 2.1, ARIA)",
          ],
        },
        {
          title: "State & UI",
          items: ["Redux", "Context API", "jsTree", "DataTables"],
        },
        {
          title: "Backend & Data",
          items: [
            "Node.js",
            "SQL (PostgreSQL/MySQL)",
            "Database Management Systems",
          ],
        },
        {
          title: "Tools & Workflow",
          items: [
            "VS Code",
            "IntelliJ IDEA",
            "Maven",
            "NPM",
            "Yarn",
            "Jira",
            "Postman",
          ],
        },
        {
          title: "Core CS",
          items: [
            "Data Structures & Algorithms",
            "OOP",
            "System Design",
            "Pattern Recognition",
          ],
        },
        {
          title: "Design / Creative",
          items: [
            "Figma",
            "Adobe Photoshop",
            "User Research",
            "Wireframing",
            "Prototyping",
          ],
        },
      ],
    },

    experience: {
      kind: "experience",
      roles: [
        {
          role: "Software Engineer",
          org: "ZL Technologies",
          dates: "September 2024 – Present",
          bullets: [
            "Own end-to-end delivery of scoped UI features for an enterprise data management platform using JavaScript (ES6), HTML5, CSS3, Ext JS, and React-based patterns, meeting sprint deadlines independently.",
            "Modernized legacy UI for accessibility by refactoring ES6 and Ext JS components to WCAG 2.1 standards; added ARIA roles/labels and resolved 400+ WAVE issues, improving accessibility compliance by 80%.",
            "Built and maintained schema-driven UI frameworks enabling dynamic form generation, validation, and configuration for large enterprise customers (e.g., JPMorgan Chase).",
            "Developed data-intensive UI components (tables, filters, modals, dashboards) using DataTables, Bootstrap, and modular JS, optimizing rendering and interaction for large datasets.",
            "Managed a 4-member team and collaborated closely with UX, backend, and QA teams on API integration, i18n (English–Japanese), debugging, and code reviews, contributing to releases and a 22% reduction in regression defects.",
          ],
        },
      ],
      education: [
        {
          degree: "B.Tech, Electrical and Electronics Engineering",
          org: "Indian Institute of Technology (IIT) Patna",
          dates: "July 2020 – May 2024",
        },
      ],
      achievements: [
        "1st Position, E-Summit UI/UX Hackathon, IIT Patna (100+ participants)",
        "Java Certification - Udemy, 2024",
      ],
    },

    sidequests: {
      kind: "sidequests",
      uxCaseStudies: [
        {
          title: "I'm Beside You - Website UX Optimization",
          blurb:
            "Redesigned a corporate website to make its vision and product easier to understand, based on usability research with real testers. Owned research, wireframing, interface design, and development.",
          link: "https://medhascollege.wixsite.com/website/i-m-beside-you?rc=test-site",
        },
        {
          title: "Messin - Reducing Food Wastage at IIT Patna",
          blurb:
            "A conceptual mobile app tackling mess food wastage on campus - from empathy research with mess staff and students through to wireframes, visual design, and a working prototype.",
          link: "https://medhascollege.wixsite.com/website/messin?rc=test-site",
        },
      ],
      artReveriez: {
        desc: "Co-founded Art Reveriez, specializing in hand-painted customized polaroids, bookmarks, and clothing. Led creative direction of the brand identity and graphics, and ran stall operations - 55+ orders, 500+ customers engaged, ₹13K+ revenue in 3 days.",
        instagram: "https://www.instagram.com/art.reveriez?igshid=MTRncGd3dHFvN25tOA==",
      },
      yearbook: {
        desc: "Lead Designer for the IIT Patna yearbook - directed a Netflix-inspired design with a 5-member team, covering flex banners, the photo booth, and table pieces, from concept through to print production. Worked directly with printing agencies to keep everything on schedule.",
        drive: "https://drive.google.com/drive/folders/1BWawbjtp0XvqIHyzzJ3xlI9t2hsLLUaq?usp=sharing",
      },
      ducks: {
        desc: "A daily ritual since January 6, 2026: I visit and photograph the same 4 ducks at a nearby pond. One of them had 5 ducklings - I've documented their whole journey. Only 2 made it to their gawky teenage phase alongside the original 4. The local caretaker (who I can't fully understand - he speaks Telugu) says the rest were lost to overheating, a snake, and - reportedly - a rabbit, which still doesn't seem physically possible.",
        drive: null /* TODO: add Google Drive link to duck photos/clips */,
      },
    },
  };
