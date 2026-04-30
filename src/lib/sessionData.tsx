import { Terminal, Info, AlertTriangle, FileText, X, Check } from 'lucide-react';
import React from 'react';

// --- content components ---

export function Session1Content() {
    return (
        <div className="space-y-12 text-white/90">
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Standard I/O: iostream</h2>
                </div>
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">Console Output (cout)</h3>
                    <p className="text-white/70 mb-4 leading-relaxed">
                        The <code className="text-[#10B981] bg-white/5 px-1.5 py-0.5 rounded font-mono">cout</code> object is used for outputting data to the standard output device (usually your screen). It is buffered and type-safe.
                    </p>
                    <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 mb-6 overflow-x-auto">
                        <pre className="text-green-400">{`// Example of formatting with iomanip
cout << right << setw(5) << 122;
cout << setw(5) << 78 << '\\n';

// Basic Types
int num = 10;
string str = "Hello, CPP!";
cout << "Result: " << num << " - " << str << endl;`}</pre>
                    </div>
                </div>
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">Console Input (cin)</h3>
                    <p className="text-white/70 mb-4">Used for getting input from the user. Note that <code className="text-[#10B981]">cin</code> stops reading at whitespace (space, tab, newline).</p>
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6">
                        <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-4 h-4" /> Pro Tip: getline()
                        </h4>
                        <p className="text-sm text-white/80 mb-2">To read a full line of text including spaces, use <code className="font-mono bg-black/30 px-1 rounded">getline(cin, str)</code>.</p>
                        <div className="bg-black/30 p-2 rounded text-xs font-mono text-white/70">
                            <pre>{`string str;
// Reads until space
cin >> str; 

// Reads whole line until enter
getline(cin, str);

// Reads until custom delimiter ('.')
getline(cin, str, '.');`}</pre>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Error & Logging</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-red-400 mb-2">cerr (Unbuffered)</h4>
                        <p className="text-sm text-white/60">Outputs immediately. Best for critical errors.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-yellow-400 mb-2">clog (Buffered)</h4>
                        <p className="text-sm text-white/60">Stores in buffer first. Best for non-critical logging.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <FileText className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Data Types & Limits</h2>
                </div>
                <p className="text-white/70">Understanding the limits of data types is crucial in Competitive Programming to avoid Overflow and Underflow.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {['int', 'double', 'float', 'char', 'bool', 'long long', 'short', 'unsigned int'].map(type => (
                        <div key={type} className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 font-mono text-sm text-[#10B981]">{type}</div>
                    ))}
                </div>
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold mb-3 text-white">How to check limits?</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-xs text-white/40 uppercase font-bold block mb-2">Modern C++ (limits)</span>
                            <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-green-400">{`#include <limits>
cout << numeric_limits<int>::max();`}</pre>
                        </div>
                        <div>
                            <span className="text-xs text-white/40 uppercase font-bold block mb-2">Simpler (climits)</span>
                            <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-green-400">{`#include <climits>
cout << INT_MAX;`}</pre>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export function Session3Content() {
    return (
        <div className="space-y-12 text-white/90">
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Control Flow</h2>
                </div>

                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">if/else Statements</h3>
                    <p className="text-white/70 mb-4">Master conditional statements, logical operators, and control flow patterns.</p>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-white mb-2">Comparison Operators</h4>
                            <ul className="text-xs text-white/60 space-y-1 font-mono">
                                <li>a &lt; b : Less than</li>
                                <li>a &gt; b : Greater than</li>
                                <li>a == b : Equal to</li>
                                <li>a != b : Not equal to</li>
                            </ul>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-white mb-2">Ternary Operator</h4>
                            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{`variable = (condition) ? true : false;`}</pre>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">Switch Statement</h3>
                    <div className="prose prose-invert max-w-none text-white/80 text-sm">
                        <p>Switch is a control structure that chooses one code path based on an integer-like value. When cases are dense numbers (1,2,3...), the compiler builds a jump table for instant <strong>O(1)</strong> lookup.</p>
                    </div>
                    <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto mt-4">
                        <pre className="text-green-400">{`switch (age) {
    case 0 ... 4:   // GCC extension
        cout << "Free";
        break;
    default:
        cout << "Paid";
}`}</pre>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500 bg-yellow-900/10 p-2 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Range syntax (0 ... 4) is a GCC extension.</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export function Session5Content() {
    return (
        <div className="space-y-12 text-white/90">
            {/* Introduction to Algorithms and Complexity */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Introduction to Algorithms</h2>
                </div>

                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">Basic Concepts</h3>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-black/30 p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-white mb-2">What is a Program?</h4>
                            <p className="text-sm text-white/70">A program is a sequence of instructions executed by the computer.</p>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-white mb-2">What is an Instruction?</h4>
                            <p className="text-sm text-white/70">An instruction is one action the computer performs while running a program.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-white mb-3">Examples of Instructions:</h4>
                        <div className="space-y-3 font-mono text-sm">
                            <div className="bg-black/50 p-3 rounded border border-white/5">
                                <p className="text-gray-400 mb-1">{/* Assignment */}{'// Assignment'}</p>
                                <pre className="text-green-400">int x = 5;</pre>
                                <pre className="text-green-400">x = x + 1;</pre>
                            </div>
                            <div className="bg-black/50 p-3 rounded border border-white/5">
                                <p className="text-gray-400 mb-1">{/* Comparison */}{'// Comparison'}</p>
                                <pre className="text-green-400">if (x {'>'} 10)</pre>
                            </div>
                            <div className="bg-black/50 p-3 rounded border border-white/5">
                                <p className="text-gray-400 mb-1">{/* Output */}{'// Output'}</p>
                                <pre className="text-green-400">cout {'<<'} x;</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">Algorithms</h3>
                    <div className="mb-4">
                        <p className="text-lg text-white mb-2"><strong className="text-[#10B981]">What is an Algorithm?</strong></p>
                        <p className="text-white/70">An Algorithm is a sequence of <strong>well-defined instructions</strong> for solving a problem.</p>
                    </div>
                    <div>
                        <p className="text-lg text-white mb-2"><strong className="text-[#10B981]">Why Study Algorithms?</strong></p>
                        <ul className="list-disc list-inside text-white/70 space-y-1 ml-2">
                            <li>To know a standard set of important algorithms from different areas of computing.</li>
                            <li>To be able to design new algorithms and analyze their efficiency.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Time Complexity */}
            <section className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Time Complexity Analysis</h2>
                </div>

                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-4 text-white">What is Time Complexity?</h3>
                    <p className="text-white/70 mb-6">Time Complexity describes how many times program instructions are executed as the input size increases.</p>

                    <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl mb-6">
                        <h4 className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Important Clarification
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-red-400"><X size={16} /> It is not the real time in seconds.</li>
                            <li className="flex items-center gap-2 text-red-400"><X size={16} /> It does not depend on computer speed.</li>
                            <li className="flex items-center gap-2 text-green-400"><Check size={16} /> It depends on the number of executed instructions.</li>
                        </ul>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-3">Why Do We Need Time Complexity?</h4>
                    <ol className="list-decimal list-inside text-white/70 space-y-1 ml-2 mb-4">
                        <li>To compare different solutions.</li>
                        <li>To know which program works better for large inputs.</li>
                        <li>To avoid very slow programs.</li>
                    </ol>
                    <p className="italic text-white/50 text-sm border-l-2 border-white/20 pl-3">Note: Time complexity depends on how many times instructions are executed.</p>
                </div>
            </section>

            {/* Complexity Examples */}
            <section className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Complexity Examples</h2>
                </div>

                {/* Example 1: O(n) */}
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">1. Linear Time: <span className="text-green-400 font-mono">O(n)</span></h3>
                    </div>
                    <p className="text-white/70 mb-4"><strong>Problem:</strong> Find the sum of numbers from 1 to <span className="font-mono">n</span>.</p>

                    <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto mb-4">
                        <pre className="text-blue-400">{`int sum = 0;
for (int i = 1; i <= n; i++) {
    sum = sum + i;
}`}</pre>
                    </div>

                    <div className="space-y-2 text-sm text-white/60 mb-4">
                        <p><strong>Counting Instructions:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                            <li><code className="text-[#10B981]">sum = 0</code> → executed <strong>1 time</strong></li>
                            <li>Loop runs → <strong>n times</strong></li>
                            <li><code className="text-[#10B981]">sum = sum + i</code> → executed <strong>n times</strong></li>
                        </ul>
                        <p className="mt-2 text-white/80 italic">The number of instructions increases linearly with n.</p>
                    </div>
                </div>

                {/* Example 2: O(1) */}
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">2. Constant Time: <span className="text-green-400 font-mono">O(1)</span></h3>
                    </div>
                    <p className="text-white/70 mb-4"><strong>Problem:</strong> Sum from 1 to <span className="font-mono">n</span> (Efficient Solution).</p>
                    <p className="text-white/60 text-sm mb-4">Instead of adding numbers one by one, we use a mathematical formula.</p>

                    <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto mb-4">
                        <pre className="text-blue-400">{`int sum = n * (n + 1) / 2;`}</pre>
                    </div>

                    <div className="space-y-2 text-sm text-white/60 mb-4">
                        <p><strong>Counting Instructions:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>Multiplication, Addition, Division, Assignment → Each <strong>1 time</strong></li>
                        </ul>
                        <p className="mt-2 text-white/80 italic">Total instructions = constant.</p>
                    </div>
                </div>

                {/* Example 3: O(n^2) */}
                <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">3. Quadratic Time: <span className="text-green-400 font-mono">O(n²)</span></h3>
                    </div>
                    <p className="text-white/70 mb-4"><strong>Problem:</strong> Nested Loops.</p>

                    <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto mb-4">
                        <pre className="text-blue-400">{`for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n; j++) {
        cout << "Hello";
    }
}`}</pre>
                    </div>

                    <div className="space-y-2 text-sm text-white/60 mb-4">
                        <p><strong>Counting Instructions:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>Outer loop runs → <strong>n times</strong></li>
                            <li>Inner loop runs → <strong>n times</strong> for each iteration of outer loop</li>
                            <li>Total inner body executions → <strong>n × n = n²</strong></li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}

export function Session4Content() {
    return (
        <div className="space-y-12 text-white/90">
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-[#10B981] mb-6">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Revision Session</h2>
                </div>
                <div className="mb-8">
                    <p className="text-white/70 text-lg">This session covers a comprehensive review of all topics from the previous sessions. Complete the 3 practice problems below to test your understanding.</p>
                </div>

                {/* Practice Problems */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white border-l-4 border-[#10B981] pl-3">Practice Problems</h3>

                    {/* Problem 1 */}
                    <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#10B981] text-black px-2.5 py-1 rounded-full text-xs font-bold">Problem 1</span>
                            <span className="text-white/40 text-sm">I/O & Data Types</span>
                        </div>
                        <h4 className="text-lg font-bold mb-3 text-white">Sum of Two Numbers</h4>
                        <p className="text-white/70 mb-4">Read two integers from the user and print their sum. Make sure to handle the case where the sum might overflow.</p>
                        <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto">
                            <pre className="text-green-400">{`// Sample Input:
5 7
// Sample Output:
12`}</pre>
                        </div>
                    </div>

                    {/* Problem 2 */}
                    <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#10B981] text-black px-2.5 py-1 rounded-full text-xs font-bold">Problem 2</span>
                            <span className="text-white/40 text-sm">Control Flow</span>
                        </div>
                        <h4 className="text-lg font-bold mb-3 text-white">Grade Calculator</h4>
                        <p className="text-white/70 mb-4">Given a score (0-100), print the corresponding grade: A (90-100), B (80-89), C (70-79), D (60-69), F (below 60).</p>
                        <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto">
                            <pre className="text-green-400">{`// Sample Input:
85
// Sample Output:
B`}</pre>
                        </div>
                    </div>

                    {/* Problem 3 */}
                    <div className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#10B981] text-black px-2.5 py-1 rounded-full text-xs font-bold">Problem 3</span>
                            <span className="text-white/40 text-sm">Loops</span>
                        </div>
                        <h4 className="text-lg font-bold mb-3 text-white">Factorial</h4>
                        <p className="text-white/70 mb-4">Given a non-negative integer n, print n! (n factorial). Remember: 0! = 1.</p>
                        <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/5 overflow-x-auto">
                            <pre className="text-green-400">{`// Sample Input:
5
// Sample Output:
120`}</pre>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// --- Data Definitions ---

export interface Session {
    id: number; // Legacy ID, useful for internal reference
    campSlug: string; // 'approvalcamp', 'programming1', 'wintercamp'
    number: string; // '1', '2', '3'
    displayNumber: string; // '01', '02'
    title: string;
    desc: string;
    description: string; // Detailed description
    tag: string;
    thumbnail?: string;
    videoId?: string;
    content?: React.ReactNode;
}

export interface Camp {
    slug: string;
    title: string;
    description: string;
    image: string;
    sessions: Session[];
    publicVisible?: boolean; // If true, show on public /sessions page
    dashboardVisible?: boolean; // If false, hide from dashboard /dashboard/sessions
}

export const camps: Camp[] = [
    {
        slug: "approvalcamp",
        title: "Approval Camp",
        description: "Fundamental C++ concepts including Data Types, I/O, Control Flow, and Loops.",
        image: '/images/lessons/approval/approvalcamp.webp',
        publicVisible: false,
        dashboardVisible: true,
        sessions: [
            {
                id: 1,
                campSlug: 'approvalcamp',
                number: '1',
                displayNumber: '01',
                tag: 'Fundamentals',
                title: 'Data Types & I/O',
                desc: 'Fundamentals of C++ Input/Output streams, arithmetic operators, and understanding basic data types and their limits.',
                description: 'Master the basics of C++, input/output streams, and understand how data is stored in memory. Essential first steps for any competitive programmer.',
                thumbnail: '/images/lessons/approval/datatypes.webp',
                videoId: '1Ihh7e6pxPbu5L8RobscDgfSVv-WJEE6g',
                content: <Session1Content />
            },
            // Session 2 skipped
            {
                id: 3,
                campSlug: 'approvalcamp',
                number: '3',
                displayNumber: '03',
                tag: 'Control Flow',
                title: 'Control Flow',
                desc: 'Mastering decision making with if-else statements, switch cases, and understanding program flow control.',
                description: 'Master conditional statements, logical operators, and control flow patterns. Learn when to use if/else vs switch, and optimize your decision-making code.',
                thumbnail: '/images/lessons/approval/control-flow.webp',
                videoId: '1rm9v66HZd-_bZ7Z9KrpPbIIubBaqIa14',
                content: <Session3Content />
            },
            {
                id: 4,
                campSlug: 'approvalcamp',
                number: '4',
                displayNumber: '04',
                tag: 'Revision',
                title: 'Revision',
                desc: 'Comprehensive review covering all previous topics with 3 practice problems to solidify your understanding.',
                description: 'Comprehensive review of all previous topics with 3 practice problems to solidify your understanding.',
                thumbnail: '/images/lessons/approval/revision.webp',
                videoId: '1sQT2Uk9A0FdDqn1gzBgvl8zn2rge3fe0',
                content: <Session4Content />
            },
        ]
    },
    {
        slug: "programming1",
        title: "Programming 1 Camp",
        description: "Master the basics of Programming 1.",
        image: '/images/lessons/pro1/pro1camp.webp',
        publicVisible: true,
        dashboardVisible: true,
        sessions: [
            {
                id: 6,
                campSlug: 'programming1',
                number: '1',
                displayNumber: '01',
                tag: 'Programming 1',
                title: 'Full Revision',
                desc: 'Comprehensive revision of Programming 1 concepts.',
                description: 'Comprehensive revision of Programming 1 concepts.',
                thumbnail: '/images/lessons/pro1/revison.webp',
                videoId: '1wa6DS3f-PMTaGEmdnvuU7q-ILkE703ak',
                content: (
                    <div className="space-y-6 text-white/90">
                        <section className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                            <h3 className="text-xl font-bold mb-4 text-white">Session Overview</h3>
                            <p className="text-white/70 mb-6">
                                This session covers a complete revision of the Programming 1 curriculum, including key concepts, problem-solving strategies, and preparation for the final exam.
                            </p>

                            <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                                <h4 className="text-[#10B981] font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="bg-[#10B981] text-black w-6 h-6 rounded flex items-center justify-center text-xs">T</span>
                                    Video Timeline
                                </h4>
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                                        <span className="text-white/80 group-hover:text-white">Iostream</span>
                                        <span className="text-[#10B981]">01:51</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                                        <span className="text-white/80 group-hover:text-white">if/else & Return & Switch</span>
                                        <span className="text-[#10B981]">17:21</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                                        <span className="text-white/80 group-hover:text-white">Arrays & Loops</span>
                                        <span className="text-[#10B981]">29:23</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                                        <span className="text-white/80 group-hover:text-white">Continue/break & 2D Array & Nested For</span>
                                        <span className="text-[#10B981]">40:48</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )
            },
            {
                id: 7,
                campSlug: 'programming1',
                number: '2',
                displayNumber: '02',
                tag: 'Programming 1',
                title: 'Exam Training',
                desc: 'Live exam training session recording.',
                description: 'Recording of the live exam training session covering problem solving strategies.',
                thumbnail: '/images/lessons/pro1/examtraining.webp',
                videoId: '1n3aiK4zG29WK6Si3NoJnnZKN-QvymCjR',
                content: (
                    <div className="space-y-6 text-white/90">
                        <section className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                            <h3 className="text-xl font-bold mb-4 text-white">Session Overview</h3>
                            <p className="text-white/70">
                                This is the recording of the live exam training session. Watch the video to review the problems and solutions discussed during the class.
                            </p>
                        </section>

                        <section className="bg-[#111] rounded-2xl border border-white/10 p-6 sm:p-8">
                            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-[#10B981]" />
                                Session Materials
                            </h3>
                            <div className="grid gap-4">
                                <a
                                    href="/images/lessons/pro1/Revision%20Questions.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#10B981]/10 rounded-lg group-hover:bg-[#10B981]/20 transition-colors">
                                            <FileText className="w-5 h-5 text-[#10B981]" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white group-hover:text-[#10B981] transition-colors">Revision Questions</div>
                                            <div className="text-xs text-white/40">PDF Document</div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </section>
                    </div>
                )
            }
        ]
    },
    {
        slug: "wintercamp",
        title: "Winter Camp",
        description: "Advanced topics for competitive programming.",
        image: '/images/lessons/winter/wintercamp.webp',
        publicVisible: false,
        dashboardVisible: true,
        sessions: [
            {
                id: 5,
                campSlug: 'wintercamp',
                number: '1',
                displayNumber: '01',
                tag: 'Winter Camp',
                title: 'Time Complexity',
                desc: 'Introduction to Algorithms, Instructions, and Time Complexity analysis (O(n), O(1), O(n²)).',
                description: 'Introduction to Algorithms, Instructions, and Time Complexity. Learn O(n), O(1), and O(n²) analysis with practical examples.',
                thumbnail: '/images/lessons/winter/complexity.webp',
                videoId: '1fH4AIGqw3j6XSomagPB3CNwJVtM1YUxf',
                content: <Session5Content />
            }
        ]
    },

];
