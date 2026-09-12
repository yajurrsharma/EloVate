// ─────────────────────────────────────────────────────────────────────────────
// Generic avatar helper — returns initials-based colour from name
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  ['from-purple-600 to-indigo-600', '#7C3AED'],
  ['from-emerald-600 to-teal-600', '#059669'],
  ['from-pink-600 to-rose-600', '#DB2777'],
  ['from-amber-600 to-orange-600', '#D97706'],
  ['from-blue-600 to-cyan-600', '#2563EB'],
  ['from-violet-600 to-purple-600', '#7C3AED'],
  ['from-teal-600 to-emerald-600', '#0D9488'],
  ['from-rose-600 to-pink-600', '#E11D48'],
];

export function getAvatarGradient(name) {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx][0];
}

export function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export { UserAvatar } from '../components/UserAvatar';

export const SEED_SKILLS = [
  {
    id: 'skill-frontend',
    name: 'Frontend Engineering',
    category: 'frontend',
    icon: 'Layout',
    color: 'from-blue-500 to-indigo-600',
    description: 'React, component lifecycle, virtual DOM, Tailwind CSS, performance optimization, state management.',
    questionsCount: 15,
    estimatedMinutes: 10,
    tags: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'State'],
    baseElo: 1200
  },
  {
    id: 'skill-backend',
    name: 'Backend Architecture',
    category: 'backend',
    icon: 'Server',
    color: 'from-emerald-500 to-teal-600',
    description: 'REST & GraphQL APIs, Node.js, database schema design, indexing, caching, authentication.',
    questionsCount: 15,
    estimatedMinutes: 10,
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'Auth', 'REST'],
    baseElo: 1200
  },
  {
    id: 'skill-dsa',
    name: 'Data Structures & Algorithms',
    category: 'dsa',
    icon: 'Cpu',
    color: 'from-amber-500 to-orange-600',
    description: 'Algorithmic efficiency, Big-O, tree & graph traversals, dynamic programming, space complexity.',
    questionsCount: 15,
    estimatedMinutes: 10,
    tags: ['Trees', 'Graphs', 'DP', 'Time Complexity', 'Binary Search'],
    baseElo: 1200
  },
  {
    id: 'skill-design',
    name: 'UI/UX & Product Design',
    category: 'design',
    icon: 'Palette',
    color: 'from-pink-500 to-rose-600',
    description: 'Visual hierarchy, accessibility standards (WCAG), wireframing, typography, interaction design.',
    questionsCount: 15,
    estimatedMinutes: 10,
    tags: ['Figma', 'WCAG', 'Design Systems', 'Micro-interactions', 'UX'],
    baseElo: 1200
  }
];

export const SEED_QUESTIONS = {
  'skill-frontend': [
    {
      id: 'fe-1',
      question: 'Which hook should be used to memoize the computed result of an expensive calculation between renders?',
      type: 'mcq',
      options: ['useCallback', 'useMemo', 'useRef', 'useEffect'],
      correctIndex: 1,
      explanation: 'useMemo caches the result of a calculation between renders until its dependencies change.'
    },
    {
      id: 'fe-2',
      question: 'What is the primary purpose of keys in React lists?',
      type: 'mcq',
      options: [
        'To uniquely identify elements for DOM diffing and state preservation',
        'To bind CSS styles dynamically to list rows',
        'To count the number of renders inside the component',
        'To trigger garbage collection on unmounted nodes'
      ],
      correctIndex: 0,
      explanation: 'Keys provide a stable identity to list items so React knows which items changed, added, or removed.'
    },
    {
      id: 'fe-3',
      question: 'Consider this code snippet. What will cause unnecessary re-renders in ChildComponent?\n\n<ChildComponent config={{ theme: "dark" }} />',
      type: 'code_snippet',
      options: [
        'An inline object literal creates a new reference on every render',
        'ChildComponent cannot accept props named config',
        'The theme string must be wrapped in a Symbol',
        'React prohibits passing strings inside object props'
      ],
      correctIndex: 0,
      explanation: 'Object literals in JSX create a new object reference on every render, failing shallow equality checks in memoized children.'
    },
    {
      id: 'fe-4',
      question: 'In Tailwind CSS, how do you apply a style only on screens at or above 768px?',
      type: 'mcq',
      options: ['@screen-768:flex', 'md:flex', 'tablet:flex', 'min-width-md:flex'],
      correctIndex: 1,
      explanation: 'The md: prefix in Tailwind targets the 768px breakpoint by default.'
    },
    {
      id: 'fe-5',
      question: 'What is the consequence of updating a state variable directly without its setter function (e.g., state.count = 5)?',
      type: 'mcq',
      options: [
        'It triggers an immediate synchronous re-render',
        'It mutates internal state without notifying React to schedule a re-render',
        'It throws a runtime SyntaxError in strict mode',
        'It deletes the component from the virtual DOM'
      ],
      correctIndex: 1,
      explanation: 'React state must be treated as immutable. Direct mutation bypasses Reacts re-render scheduler.'
    },
    {
      id: 'fe-6',
      question: 'Which of the following describes the difference between useEffect and useLayoutEffect?',
      type: 'mcq',
      options: [
        'useLayoutEffect runs synchronously immediately after DOM mutations before browser paint',
        'useEffect runs before the DOM is created',
        'useLayoutEffect only works on mobile devices',
        'useEffect can only be used once per component'
      ],
      correctIndex: 0,
      explanation: 'useLayoutEffect fires synchronously after all DOM mutations and blocks visual repaint, useful for reading DOM measurements.'
    },
    {
      id: 'fe-7',
      question: 'How does React 18 Concurrent Rendering handle urgent user inputs vs background transitions?',
      type: 'mcq',
      options: [
        'Via startTransition and useDeferredValue to keep interactions responsive',
        'By spawning Web Workers automatically for all setState calls',
        'By disabling the event loop during heavy computations',
        'By pausing browser tabs until DOM renders finish'
      ],
      correctIndex: 0,
      explanation: 'startTransition marks updates as non-urgent transitions that can be interrupted by immediate user input.'
    },
    {
      id: 'fe-8',
      question: 'What happens when useRef value (ref.current) is modified?',
      type: 'mcq',
      options: [
        'A re-render is immediately scheduled',
        'The component will NOT re-render',
        'The entire parent tree re-renders',
        'A browser warning is logged'
      ],
      correctIndex: 1,
      explanation: 'Mutating ref.current is a synchronous side effect that does not trigger a component re-render.'
    },
    {
      id: 'fe-9',
      question: 'What is a closure stale state issue in React hooks?',
      type: 'mcq',
      options: [
        'An effect or callback captures an outdated value of state/props due to missing dependencies',
        'The browser cache holding old HTML pages',
        'When localStorage reaches maximum capacity',
        'When CSS animations do not finish on time'
      ],
      correctIndex: 0,
      explanation: 'If a callback or effect omits dependencies, it captures lexical variables from its original render scope.'
    },
    {
      id: 'fe-10',
      question: 'Why should CSS classes be preferred over inline styles for performance?',
      type: 'mcq',
      options: [
        'Browser engines optimize CSS rule matching and GPU stylesheets efficiently',
        'Inline styles crash React hydration',
        'Classes consume zero RAM in browsers',
        'Inline styles cannot support hex colors'
      ],
      correctIndex: 0,
      explanation: 'CSS class rules are parsed once by the CSSOM and cached, whereas dynamic inline objects create JS garbage.'
    },
    {
      id: 'fe-11',
      question: 'What does the React StrictMode component help catch during development?',
      type: 'mcq',
      options: [
        'Unexpected side effects by intentionally double-invoking lifecycle methods and effect setups',
        'SQL injection vulnerabilities in frontend forms',
        'Syntax errors in external npm packages',
        'Broken external hyperlinks'
      ],
      correctIndex: 0,
      explanation: 'StrictMode double-renders and double-invokes effects in dev to highlight impurities and missing cleanup functions.'
    },
    {
      id: 'fe-12',
      question: 'In modern Web Vitals, what does LCP stand for?',
      type: 'mcq',
      options: [
        'Largest Contentful Paint',
        'Layout Cumulative Process',
        'Low Cost Pipeline',
        'Local CSS Parser'
      ],
      correctIndex: 0,
      explanation: 'LCP measures perceived loading speed by recording when the main content of a page has likely loaded.'
    },
    {
      id: 'fe-13',
      question: 'What is the purpose of React.lazy() and Suspense?',
      type: 'mcq',
      options: [
        'Code-splitting components so they are downloaded only when rendered',
        'Automating CSS minification on the client',
        'Encrypting frontend API tokens',
        'Enforcing TypeScript types at runtime'
      ],
      correctIndex: 0,
      explanation: 'React.lazy lets you dynamically import components, displaying a Suspense fallback while loading.'
    },
    {
      id: 'fe-14',
      question: 'How do you prevent event bubbling to parent handlers in React?',
      type: 'mcq',
      options: ['e.stopPropagation()', 'e.preventDefault()', 'e.cancelBubble = false', 'return false;'],
      correctIndex: 0,
      explanation: 'e.stopPropagation() stops the synthetic event from bubbling up the component tree.'
    },
    {
      id: 'fe-15',
      question: 'What is the default behavior of React Context when the provider value changes?',
      type: 'mcq',
      options: [
        'All consuming components re-render, even if wrapped in React.memo',
        'Only components that modified the context re-render',
        'Context changes do not cause re-renders',
        'The DOM is destroyed and rebuilt from scratch'
      ],
      correctIndex: 0,
      explanation: 'When a Context Provider value changes, all components calling useContext for that context must re-render.'
    }
  ],
  'skill-backend': [
    { id: 'be-1', question: 'Why should passwords never be stored using fast hash functions like MD5 or SHA-256?', type: 'mcq', options: ['They are susceptible to high-speed hardware brute-force and rainbow table attacks; slow salted hashes like bcrypt or Argon2 should be used', 'MD5 cannot produce strings longer than 10 characters', 'SHA-256 can only be computed on Windows servers', 'PostgreSQL automatically blocks MD5 hashes'], correctIndex: 0, explanation: 'Fast hashes allow billions of guesses per second on modern GPUs. Password hashing requires adaptive work factors (bcrypt/Argon2).' },
    { id: 'be-2', question: 'In SQL, what is the key difference between an INNER JOIN and a LEFT JOIN?', type: 'mcq', options: ['LEFT JOIN returns all rows from the left table even if there is no match in the right table', 'INNER JOIN deletes unmatched records from the database', 'LEFT JOIN can only join tables with identical column names', 'INNER JOIN cannot use indexes'], correctIndex: 0, explanation: 'A LEFT JOIN preserves all records from the left table, filling right-table columns with NULL when no match exists.' },
    { id: 'be-3', question: 'What does ACID stand for in relational database transactions?', type: 'mcq', options: ['Atomicity, Consistency, Isolation, Durability', 'Asynchronous, Concurrent, Indexed, Distributed', 'Authorization, Credentials, Integrity, Decryption', 'Aggregate, Commit, Insert, Delete'], correctIndex: 0, explanation: 'ACID guarantees that database transactions are processed reliably.' },
    { id: 'be-4', question: 'How does connection pooling improve database performance in Node.js backends?', type: 'mcq', options: ['It reuses active database TCP connections instead of opening/closing TLS handshakes on every request', 'It stores the entire database in server RAM', 'It compresses SQL statements into binary formats', 'It disables database locks permanently'], correctIndex: 0, explanation: 'Connection pooling maintains an established pool of connections, eliminating handshake overhead.' },
    { id: 'be-5', question: 'Which HTTP status code should be returned when an authenticated client tries to access a resource they lack permission for?', type: 'mcq', options: ['403 Forbidden', '401 Unauthorized', '404 Not Found', '400 Bad Request'], correctIndex: 0, explanation: '401 means unauthenticated (identity unknown), while 403 means authenticated but forbidden (insufficient privileges).' },
    { id: 'be-6', question: 'What is a SQL injection vulnerability?', type: 'mcq', options: ['Untrusted user input concatenated directly into a query string modifies the SQL command execution', 'A server running out of disk space during an INSERT', 'An index exceeding the B-tree height limit', 'A crash caused by invalid JSON payloads'], correctIndex: 0, explanation: 'SQL injection occurs when untrusted input alters query structure. Parameterized queries/prepared statements prevent this.' },
    { id: 'be-7', question: 'In RESTful API design, which method should be idempotent by specification?', type: 'mcq', options: ['PUT and DELETE', 'POST only', 'PATCH only', 'All methods except GET'], correctIndex: 0, explanation: 'PUT and DELETE are idempotent (calling them multiple times with identical parameters produces the same resulting state).' },
    { id: 'be-8', question: 'What is the primary role of Redis in a high-traffic microservices backend?', type: 'mcq', options: ['In-memory key-value caching, session storage, and pub/sub message queuing', 'Long-term cold archival of multimedia files', 'Compiling JavaScript to native machine code', 'Validating SSL certificates'], correctIndex: 0, explanation: 'Redis is an ultra-fast in-memory data store frequently used for caching, rate limiting, and session state.' },
    { id: 'be-9', question: 'What is the purpose of Row-Level Security (RLS) in PostgreSQL?', type: 'mcq', options: ['Defines security policies that filter which rows a user can select or modify based on their session context', 'Encrypts every row on physical disk with a different AES key', 'Limits table rows to 100,000 to prevent memory overflows', 'Blocks duplicate primary keys'], correctIndex: 0, explanation: 'RLS restricts row visibility directly in the database engine based on the executing user/role context.' },
    { id: 'be-10', question: 'How do JWTs (JSON Web Tokens) allow stateless authentication?', type: 'mcq', options: ['The server signs a cryptographic payload that can be verified with a secret without querying a session database', 'JWTs automatically store passwords in browser cookies', 'The token changes the server IP address dynamically', 'Tokens execute server-side functions inside the client'], correctIndex: 0, explanation: 'JWTs contain claims signed by the server. Any service with the secret/public key can verify authenticity without DB lookups.' },
    { id: 'be-11', question: 'What problem does database indexing with B-Trees solve?', type: 'mcq', options: ['Reduces search time complexity from O(N) full table scans to O(log N)', 'Automatically repairs corrupted hard drives', 'Compiles SQL queries into WebAssembly', 'Ensures that tables have zero duplicate columns'], correctIndex: 0, explanation: 'B-tree indexes maintain balanced sorted pointers, enabling logarithmic search, range scans, and orderings.' },
    { id: 'be-12', question: 'What is an N+1 query problem in Object-Relational Mappers (ORMs)?', type: 'mcq', options: ['Fetching 1 parent record followed by N individual database queries to retrieve related child records', 'An error when a database has more than N columns', 'A crash caused by infinite recursion in SQL triggers', 'Running N queries in a single database thread'], correctIndex: 0, explanation: 'N+1 occurs when code executes 1 query for parents and then N queries in a loop for each relation instead of a single JOIN/IN query.' },
    { id: 'be-13', question: 'What is the purpose of a reverse proxy like Nginx in front of Node.js services?', type: 'mcq', options: ['SSL termination, load balancing, gzip compression, and static asset caching', 'Running client-side React rendering', 'Generating SQL migrations automatically', 'Debugging JavaScript console logs'], correctIndex: 0, explanation: 'Reverse proxies shield app servers, distribute traffic across instances, terminate SSL, and buffer slow clients.' },
    { id: 'be-14', question: 'Why is CORS (Cross-Origin Resource Sharing) enforced by web browsers?', type: 'mcq', options: ['To prevent malicious websites from making unauthorized authenticated requests to external APIs using ambient credentials', 'To speed up DNS resolution', 'To enforce HTTPS across all web domains', 'To limit JavaScript payload sizes'], correctIndex: 0, explanation: 'CORS is a browser security mechanism that restricts resources requested from another domain outside the origin.' },
    { id: 'be-15', question: 'In distributed systems, what does the CAP theorem state?', type: 'mcq', options: ['A distributed data store can simultaneously provide at most two out of Consistency, Availability, and Partition Tolerance', 'Cache, Authorization, and Persistence cannot coexist on one server', 'CPUs can only run two concurrent threads per core', 'APIs cannot support both JSON and XML simultaneously'], correctIndex: 0, explanation: 'Under network partitions, a distributed system must choose between consistency or availability.' }
  ],
  'skill-dsa': [
    { id: 'dsa-1', question: 'What is the worst-case time complexity of quicksort when an inappropriate pivot is consistently chosen?', type: 'mcq', options: ['O(N²)', 'O(N log N)', 'O(N)', 'O(log N)'], correctIndex: 0, explanation: 'If the pivot is always the smallest or largest element, quicksort degrades to O(N²).' },
    { id: 'dsa-2', question: 'Which data structure is ideal for implementing Breadth-First Search (BFS) in a graph?', type: 'mcq', options: ['Queue (FIFO)', 'Stack (LIFO)', 'Max-Heap', 'Binary Search Tree'], correctIndex: 0, explanation: 'BFS explores vertices level-by-level using a First-In-First-Out Queue.' },
    { id: 'dsa-3', question: 'What is the average lookup time complexity in a well-balanced Hash Table?', type: 'mcq', options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'], correctIndex: 0, explanation: 'A hash table computes the bucket index via hash function in constant O(1) time on average.' },
    { id: 'dsa-4', question: 'In a min-heap with N elements, what is the time complexity to insert a new key?', type: 'mcq', options: ['O(log N)', 'O(1)', 'O(N)', 'O(N log N)'], correctIndex: 0, explanation: 'Insertion appends to the bottom and bubbles up at most height h = log N levels.' },
    { id: 'dsa-5', question: 'Which algorithmic paradigm does Dijkstra\'s shortest path algorithm employ?', type: 'mcq', options: ['Greedy Approach', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'], correctIndex: 0, explanation: 'Dijkstras algorithm greedily selects the unvisited node with the smallest tentative distance at each step.' },
    { id: 'dsa-6', question: 'What is the space complexity of an in-place merge sort vs standard merge sort?', type: 'mcq', options: ['Standard merge sort requires O(N) auxiliary space, while in-place uses O(1) auxiliary space', 'Standard merge sort uses O(1) space', 'Both use O(N²) space', 'In-place merge sort requires O(N log N) auxiliary space'], correctIndex: 0, explanation: 'Standard merge sort creates auxiliary arrays of size N during merge operations.' },
    { id: 'dsa-7', question: 'How do you detect a cycle in a singly linked list in O(1) space?', type: 'mcq', options: ['Floyd\'s Cycle-Finding Algorithm (slow and fast pointers)', 'Recursively printing all nodes', 'Counting nodes until an integer overflow occurs', 'Sorting the list by pointer address'], correctIndex: 0, explanation: 'Floyds algorithm advances one pointer by 1 step and another by 2 steps; if a cycle exists, they collide in O(1) space.' },
    { id: 'dsa-8', question: 'What characterizes Dynamic Programming problems?', type: 'mcq', options: ['Overlapping subproblems and optimal substructure', 'Randomized inputs and sorting algorithms', 'Unbounded recursive depth with no base case', 'Static memory allocation at compile time'], correctIndex: 0, explanation: 'DP applies when optimal solutions to subproblems can be cached and reused.' },
    { id: 'dsa-9', question: 'What is the height of a balanced AVL tree with N nodes?', type: 'mcq', options: ['O(log N)', 'O(N)', 'O(1)', 'O(N²)'], correctIndex: 0, explanation: 'AVL trees maintain a balance factor between -1 and +1, ensuring strict O(log N) height.' },
    { id: 'dsa-10', question: 'Which traversal of a Binary Search Tree (BST) produces keys in ascending sorted order?', type: 'mcq', options: ['In-order traversal (Left, Root, Right)', 'Pre-order traversal', 'Post-order traversal', 'Level-order traversal'], correctIndex: 0, explanation: 'In-order traversal visits left subtree, current node, then right subtree, matching BST ordering.' },
    { id: 'dsa-11', question: 'What is the amortized time complexity of inserting into a dynamic array?', type: 'mcq', options: ['O(1)', 'O(N)', 'O(log N)', 'O(N log N)'], correctIndex: 0, explanation: 'While doubling capacity takes O(N), it happens infrequently enough that amortized cost per insert is O(1).' },
    { id: 'dsa-12', question: 'Which of the following problems is known to be NP-Complete?', type: 'mcq', options: ['Traveling Salesperson Problem (Decision version)', 'Merge Sort', 'Single-Source Shortest Path (Dijkstra)', 'Binary Search'], correctIndex: 0, explanation: 'The decision version of the Traveling Salesperson Problem is NP-Complete.' },
    { id: 'dsa-13', question: 'What data structure is used to implement a Trie (Prefix Tree)?', type: 'mcq', options: ['A tree where each node represents a character or prefix edge', 'A hash map with numerical keys only', 'A doubly linked list of sentences', 'A binary heap'], correctIndex: 0, explanation: 'Tries store associative keys where descendants share common string prefixes.' },
    { id: 'dsa-14', question: 'What is the purpose of memoization in recursive algorithms?', type: 'mcq', options: ['Caching previously computed results of pure functions to avoid redundant calculations', 'Freeing memory used by unused variables', 'Measuring function execution time in milliseconds', 'Validating input types at compile time'], correctIndex: 0, explanation: 'Memoization caches the output of function calls given specific inputs.' },
    { id: 'dsa-15', question: 'What is the time complexity of building a Binary Heap from an unsorted array using bottom-up heapify?', type: 'mcq', options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'], correctIndex: 0, explanation: 'Bottom-up heapify runs in linear O(N) time due to the convergence of the geometric series summation.' }
  ],
  'skill-design': [
    { id: 'des-1', question: 'What is the minimum WCAG 2.1 AA contrast ratio required for normal body text against its background?', type: 'mcq', options: ['4.5:1', '3.0:1', '7.0:1', '2.0:1'], correctIndex: 0, explanation: 'WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.' },
    { id: 'des-2', question: 'What does Hick\'s Law state regarding user interface design?', type: 'mcq', options: ['The time it takes to make a decision increases logarithmically with the number and complexity of choices', 'Users spend most of their time on other websites', 'Touch targets should be at least 48x48 pixels', 'Dark mode reduces battery consumption on OLED screens'], correctIndex: 0, explanation: 'Hicks Law: More choices = longer decision time. Simplifying options accelerates user actions.' },
    { id: 'des-3', question: 'What is the purpose of design tokens in a modern design system?', type: 'mcq', options: ['Platform-agnostic visual primitives (colors, spacing, typography) stored as data to maintain cross-platform UI consistency', 'Cryptographic tokens used to pay UI designers', 'Cookies stored to track user clicks', 'SVG icons converted into raster PNGs'], correctIndex: 0, explanation: 'Design tokens are the single source of truth for design values across CSS, iOS, Android, and web components.' },
    { id: 'des-4', question: 'According to Fitts\'s Law, which elements on a screen are easiest and fastest to acquire?', type: 'mcq', options: ['Large elements located close to the starting cursor position and screen edges/corners', 'Elements positioned in the exact geometric center of a 4K display', 'Sub-pixel text links placed inside nested tables', 'Elements that constantly animate across the viewport'], correctIndex: 0, explanation: 'Fittss Law models target acquisition time based on distance and size. Screen edges provide infinite target width.' },
    { id: 'des-5', question: 'What is the primary difference between a wireframe, a mockup, and a prototype?', type: 'mcq', options: ['Wireframe is low-fidelity structural blueprint; Mockup is high-fidelity static visual; Prototype is interactive functional simulation', 'They are identical terms for vector graphics', 'Mockups contain live backend database queries', 'Wireframes are only drawn on physical paper'], correctIndex: 0, explanation: 'Wireframes define layout; mockups define visual styling; prototypes simulate user interactivity.' },
    { id: 'des-6', question: 'Why should color alone never be used as the sole indicator of an interface state?', type: 'mcq', options: ['Color-blind and visually impaired users will miss critical state cues without supporting icons or text', 'CSS colors are rendered differently on Mac vs PC', 'Browsers strip colors when running in battery saver mode', 'Search engines penalize colored buttons'], correctIndex: 0, explanation: 'Accessibility guidelines mandate combining color with icons, text labels, or patterns.' },
    { id: 'des-7', question: 'What is visual hierarchy in UI design?', type: 'mcq', options: ['The arrangement and styling of elements to guide the user\'s eye in order of importance', 'The folder structure of Figma components', 'The order of HTML tags in the DOM', 'A list of senior designer job titles'], correctIndex: 0, explanation: 'Visual hierarchy uses scale, contrast, weight, and white space to prioritize interface information.' },
    { id: 'des-8', question: 'What is the recommended minimum touch target size according to Apple HIG and Google Material Design?', type: 'mcq', options: ['44x44 pt (Apple) / 48x48 dp (Google)', '20x20 px', '100x100 px', '8x8 mm'], correctIndex: 0, explanation: 'Touch targets must be large enough (~44–48px) to prevent accidental taps from human fingers.' },
    { id: 'des-9', question: 'In typography, what is "leading" (line-height)?', type: 'mcq', options: ['The vertical space between baselines of consecutive lines of type', 'The horizontal tracking between letter pairs', 'The font size of the primary heading', 'The width of a drop cap'], correctIndex: 0, explanation: 'Leading refers to line-height or vertical line spacing.' },
    { id: 'des-10', question: 'What is the primary benefit of micro-interactions in a digital product?', type: 'mcq', options: ['They provide immediate tactile feedback, clarify system status, and delight users without cognitive friction', 'They replace the need for unit testing', 'They reduce server hosting costs', 'They bypass cross-origin browser policies'], correctIndex: 0, explanation: 'Micro-interactions confirm state changes and enhance usability.' },
    { id: 'des-11', question: 'What is the "Gestalt Law of Proximity"?', type: 'mcq', options: ['Objects placed close together are perceived as belonging to the same functional group', 'Objects of the same color are assumed to have different functions', 'Text always aligns with the closest image', 'Users look at the top-right corner of a website first'], correctIndex: 0, explanation: 'Proximity states that elements grouped physically close together are interpreted as related.' },
    { id: 'des-12', question: 'What is the difference between Skeuomorphism, Flat Design, and Glassmorphism?', type: 'mcq', options: ['Skeuomorphism mimics real-world textures; Flat removes gradients/shadows; Glassmorphism uses frosted transparency and subtle borders', 'They are different versions of the HTML specification', 'Glassmorphism is only used on physical glass screens', 'Flat design requires 3D graphics cards'], correctIndex: 0, explanation: 'Glassmorphism combines multi-layered depth, blur filters, and translucent glass aesthetics.' },
    { id: 'des-13', question: 'What is an empathy map used for in UX research?', type: 'mcq', options: ['Synthesizing qualitative user observations across What they Say, Think, Do, and Feel', 'Measuring the server response latency of an application', 'Creating 3D CAD models of hardware products', 'Tracking bounce rates using Google Analytics'], correctIndex: 0, explanation: 'Empathy maps help teams gain a shared understanding of user attitudes and behavioral needs.' },
    { id: 'des-14', question: 'Why is white space (negative space) essential in layout design?', type: 'mcq', options: ['It prevents cognitive overload, separates unrelated content, and highlights focal elements', 'It decreases file download size', 'It is required by web hosting providers to save bandwidth', 'It forces users to zoom in on mobile screens'], correctIndex: 0, explanation: 'White space lets content breathe, balancing density and visual readability.' },
    { id: 'des-15', question: 'What is progressive disclosure in interface interaction?', type: 'mcq', options: ['Sequencing information and actions across multiple steps to avoid overwhelming the user with complexity', 'Revealing source code inside the developer console', 'Displaying full legal terms in a popup modal', 'Gradually increasing font size as users scroll'], correctIndex: 0, explanation: 'Progressive disclosure defers advanced options until the user requests them, keeping default screens simple.' }
  ]
};

export const SEED_USERS = [
  {
    id: 'user-harshika',
    fullName: 'Harshika Sharma',
    email: 'harshika@elovate.dev',
    avatar: null,
    role: 'candidate',
    title: 'Frontend Specialist & React Architect',
    bio: 'Passionate about high-performance React applications, micro-frontends, and component design systems.',
    githubUsername: 'harshika-dev',
    eloRating: 1540,
    eloTier: 'Specialist',
    verifiedBadges: [
      {
        skillId: 'skill-frontend',
        skillName: 'Frontend Engineering',
        tier: 'gold',
        score: 93,
        eloDelta: 150,
        integrityScore: 100,
        verifiedAt: 'Verified Today',
        freshnessDays: 0,
        tabSwitches: 0
      }
    ],
    githubAudits: [
      {
        repoName: 'react-design-tokens',
        repoUrl: 'https://github.com/harshika-dev/react-design-tokens',
        language: 'TypeScript',
        commits: 34,
        authorshipRatio: 92,
        stars: 12,
        eloBonus: 90,
        authenticityRating: 'verified'
      }
    ],
    endorsements: [
      { giverName: 'Eshan Roy', skill: 'Clean Architecture', tier: 'gold' },
      { giverName: 'Alex Chen', skill: 'Rapid Prototyping', tier: 'silver' }
    ],
    teamId: null
  },
  {
    id: 'user-eshan',
    fullName: 'Eshan Roy',
    email: 'eshan@elovate.dev',
    avatar: null,
    role: 'candidate',
    title: 'Fullstack & Backend Engineer',
    bio: 'Building distributed microservices, Postgres optimization, and scalable APIs.',
    githubUsername: 'eshan-roy',
    eloRating: 1880,
    eloTier: 'Expert',
    verifiedBadges: [
      {
        skillId: 'skill-backend',
        skillName: 'Backend Architecture',
        tier: 'gold',
        score: 95,
        eloDelta: 160,
        integrityScore: 98,
        verifiedAt: 'Verified 2 days ago',
        freshnessDays: 2,
        tabSwitches: 1
      },
      {
        skillId: 'skill-dsa',
        skillName: 'Data Structures & Algorithms',
        tier: 'silver',
        score: 82,
        eloDelta: 95,
        integrityScore: 100,
        verifiedAt: 'Verified 4 days ago',
        freshnessDays: 4,
        tabSwitches: 0
      }
    ],
    githubAudits: [
      {
        repoName: 'distributed-queue-engine',
        repoUrl: 'https://github.com/eshan-roy/distributed-queue-engine',
        language: 'Go / Node',
        commits: 58,
        authorshipRatio: 88,
        stars: 27,
        eloBonus: 110,
        authenticityRating: 'verified'
      }
    ],
    endorsements: [
      { giverName: 'Harshika Sharma', skill: 'System Architecture', tier: 'gold' }
    ],
    teamId: 'team-neurostack',
    mentorBio: 'Available to mentor junior backend & distributed systems engineers. Office hours: Tue & Thu 7–9 PM.',
    mentorSkills: ['Backend Architecture', 'Distributed Systems', 'PostgreSQL', 'Go'],
    isMentor: true
  },
  {
    id: 'user-mishti',
    fullName: 'Mishti Verma',
    email: 'mishti@elovate.dev',
    avatar: null,
    role: 'candidate',
    title: 'Product Designer & Design Systems',
    bio: 'Bridging design & frontend code. Crafting glassmorphism tokens, accessible flows, and micro-interactions.',
    githubUsername: 'mishti-designs',
    eloRating: 1620,
    eloTier: 'Specialist',
    verifiedBadges: [
      {
        skillId: 'skill-design',
        skillName: 'UI/UX & Product Design',
        tier: 'gold',
        score: 94,
        eloDelta: 145,
        integrityScore: 100,
        verifiedAt: 'Verified 1 day ago',
        freshnessDays: 1,
        tabSwitches: 0
      }
    ],
    githubAudits: [
      {
        repoName: 'fluent-glass-tokens',
        repoUrl: 'https://github.com/mishti-designs/fluent-glass-tokens',
        language: 'CSS / TypeScript',
        commits: 26,
        authorshipRatio: 95,
        stars: 18,
        eloBonus: 85,
        authenticityRating: 'verified'
      }
    ],
    endorsements: [
      { giverName: 'Eshan Roy', skill: 'Visual Design', tier: 'gold' }
    ],
    teamId: null,
    mentorBio: 'Happy to guide designers on design systems, component tokens, and accessible dark-mode palettes.',
    mentorSkills: ['UI/UX Design', 'Figma', 'Design Tokens', 'Accessibility'],
    isMentor: true
  },
  {
    id: 'user-yajur',
    fullName: 'Yajur Mehta',
    email: 'yajur@venturehire.io',
    avatar: null,
    role: 'recruiter',
    title: 'Technical Talent Partner @ VentureHire',
    bio: 'Screening for proven engineering depth without resume fluff. Evaluating verified candidates for top engineering teams.',
    githubUsername: 'yajur-recruiter',
    eloRating: 2150,
    eloTier: 'Grandmaster',
    verifiedBadges: [],
    githubAudits: [],
    endorsements: [],
    teamId: null,
    mentorBio: 'Helping candidates ace technical interviews, build compelling verified profiles, and navigate the job market.',
    mentorSkills: ['Career Strategy', 'Interview Prep', 'Resume Review', 'Recruitment'],
    isMentor: true
  },
  {
    id: 'user-aravind',
    fullName: 'Aravind Menon',
    email: 'aravind@elovate.dev',
    avatar: null,
    role: 'candidate',
    title: 'Staff DevOps & Cloud Infrastructure Architect',
    bio: 'Kubernetes contributor, cloud-native resilience advocate, and infrastructure-as-code specialist.',
    githubUsername: 'aravind-cloud',
    eloRating: 2040,
    eloTier: 'Master',
    verifiedBadges: [
      {
        skillId: 'skill-backend',
        skillName: 'Cloud Infrastructure',
        tier: 'gold',
        score: 96,
        eloDelta: 170,
        integrityScore: 100,
        verifiedAt: 'Verified 3 days ago',
        freshnessDays: 3,
        tabSwitches: 0
      }
    ],
    githubAudits: [],
    endorsements: [
      { giverName: 'Eshan Roy', skill: 'K8s Cluster Orchestration', tier: 'gold' }
    ],
    teamId: null,
    mentorBio: 'Advising on production Kubernetes setups, cloud cost optimization, CI/CD reliability, and high-availability architecture.',
    mentorSkills: ['DevOps', 'Kubernetes', 'Cloud Infrastructure', 'CI/CD Pipelines', 'AWS/GCP'],
    isMentor: true
  },
  {
    id: 'user-ananya',
    fullName: 'Ananya Sen',
    email: 'ananya@elovate.dev',
    avatar: null,
    role: 'candidate',
    title: 'Senior AI/ML Systems Engineer',
    bio: 'Building low-latency inference pipelines, LLM fine-tuning harnesses, and vector search embeddings.',
    githubUsername: 'ananya-ml',
    eloRating: 1960,
    eloTier: 'Expert',
    verifiedBadges: [
      {
        skillId: 'skill-dsa',
        skillName: 'Data Structures & Algorithms',
        tier: 'gold',
        score: 98,
        eloDelta: 180,
        integrityScore: 100,
        verifiedAt: 'Verified 2 days ago',
        freshnessDays: 2,
        tabSwitches: 0
      }
    ],
    githubAudits: [],
    endorsements: [
      { giverName: 'Yajur Mehta', skill: 'Deep Learning Systems', tier: 'gold' }
    ],
    teamId: null,
    mentorBio: 'Guiding engineers transitioning into AI/ML, PyTorch distributed training, model quantization, and RAG architectures.',
    mentorSkills: ['Machine Learning', 'PyTorch', 'Vector Databases', 'LLM Fine-Tuning', 'Python'],
    isMentor: true
  }
];

export const SEED_TEAMS = [
  {
    id: 'team-neurostack',
    name: 'Team NeuroStack',
    hackathonTrack: 'AI & Developer Productivity',
    tagline: 'Building zero-latency contextual AI assistants for engineers',
    leadId: 'user-eshan',
    leadName: 'Eshan Roy',
    slots: [
      {
        id: 'slot-1',
        title: 'Backend Systems Lead',
        requiredSkillId: 'skill-backend',
        requiredSkillName: 'Backend Architecture',
        minElo: 1600,
        minTier: 'gold',
        assignedUserId: 'user-eshan',
        assignedUserName: 'Eshan Roy',
        assignedUserElo: 1880,
        assignedUserTier: 'gold',
        status: 'filled',
        challengeQuestion: 'How would you design a zero-downtime deployment pipeline for a distributed queue system?'
      },
      {
        id: 'slot-2',
        title: 'Frontend React Architect',
        requiredSkillId: 'skill-frontend',
        requiredSkillName: 'Frontend Engineering',
        minElo: 1400,
        minTier: 'silver',
        assignedUserId: null,
        assignedUserName: null,
        assignedUserElo: null,
        assignedUserTier: null,
        status: 'open',
        challengeQuestion: 'How would you structure client-side state caching in React to avoid redundant fetch calls during tab switching?'
      },
      {
        id: 'slot-3',
        title: 'Lead UI/UX Designer',
        requiredSkillId: 'skill-design',
        requiredSkillName: 'UI/UX & Product Design',
        minElo: 1450,
        minTier: 'silver',
        assignedUserId: null,
        assignedUserName: null,
        assignedUserElo: null,
        assignedUserTier: null,
        status: 'open',
        challengeQuestion: 'Describe your process for establishing accessible dark-theme color tokens with minimum 4.5:1 WCAG contrast.'
      }
    ],
    membersCount: 1,
    maxMembers: 4
  },
  {
    id: 'team-cipherforge',
    name: 'CipherForge',
    hackathonTrack: 'Campus Recruitment & Trust Tech',
    tagline: 'Cryptographic talent verification and anti-fraud interview pipelines',
    leadId: 'user-harshika',
    leadName: 'Harshika Sharma',
    slots: [
      {
        id: 'slot-cf-1',
        title: 'Frontend Lead',
        requiredSkillId: 'skill-frontend',
        requiredSkillName: 'Frontend Engineering',
        minElo: 1500,
        minTier: 'gold',
        assignedUserId: 'user-harshika',
        assignedUserName: 'Harshika Sharma',
        assignedUserElo: 1540,
        assignedUserTier: 'gold',
        status: 'filled',
        challengeQuestion: 'How do you architect a real-time collaborative editor in React with conflict-free CRDT merges?'
      },
      {
        id: 'slot-cf-2',
        title: 'Distributed Systems Engineer',
        requiredSkillId: 'skill-backend',
        requiredSkillName: 'Backend Architecture',
        minElo: 1600,
        minTier: 'gold',
        assignedUserId: null,
        assignedUserName: null,
        assignedUserElo: null,
        assignedUserTier: null,
        status: 'open',
        challengeQuestion: 'What strategy would you use to prevent race conditions during concurrent assessment submissions in Postgres?'
      },
      {
        id: 'slot-cf-3',
        title: 'Algorithmic Optimization Dev',
        requiredSkillId: 'skill-dsa',
        requiredSkillName: 'Data Structures & Algorithms',
        minElo: 1500,
        minTier: 'silver',
        assignedUserId: null,
        assignedUserName: null,
        assignedUserElo: null,
        assignedUserTier: null,
        status: 'open',
        challengeQuestion: 'Design an in-memory ranking buffer capable of ranking 100,000 candidate scores in under 5ms.'
      }
    ],
    membersCount: 1,
    maxMembers: 4
  }
];
