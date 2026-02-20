export type ActionType = 'type' | 'delete' | 'highlight' | 'reset';

export interface CodeEvent {
    timestamp: number; // Time in milliseconds
    type: ActionType;
    payload: string; // The text to type/delete, or new state for reset
}

export interface TrainerScript {
    audioUrl: string;
    events: CodeEvent[];
}
