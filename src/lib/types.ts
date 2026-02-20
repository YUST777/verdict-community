export interface UserProfile {
    id: number;
    name: string;
    email: string;
    student_id?: string;
    role: 'student' | 'instructor' | 'admin' | 'owner';
    telegram_username?: string;
    codeforces_profile?: string;
    leetcode_profile?: string;
    profile_picture?: string;
    codeforces_data?: {
        rating?: number;
        rank?: string;
        maxRating?: number;
        maxRank?: string;
    };
    created_at?: string;
}

export interface Submission {
    id: number;
    user_id: number;
    problem_id: string;
    problem_name: string;
    sheet_id: string;
    sheet_name?: string;
    status_id: number; // 3 = AC
    language_id: number;
    memory: number;
    time: number; // runtime
    created_at: string;
    verdict?: string; // Optional redundant field if status_id is used
}

export interface LeaderboardEntry {
    userId: number;
    name: string;
    solved_count: number;
    total_score?: number;
    rank?: number;
    rating?: number;
}

export interface Judge0Token {
    token: string;
}

export interface Judge0SubmissionResult {
    token: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    status_id: number;
    time?: string | null;
    memory?: number | null;
}

export interface DistributionEntry {
    range: string;
    count: number;
}

export interface ProblemStats {
    averageTime: number;
    averageMemory: number;
    totalAttempts: number;
    acceptedCount: number;
    runtimeDistribution: DistributionEntry[];
    memoryDistribution: DistributionEntry[];
}
