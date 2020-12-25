export interface Message {
    playerId: string;
    type: string;
    content: string;
    timeStamp: Date;
}

export interface IPoint {
    clientUniqueId: string;
    x: number;
    y: number;
    isFirstPointInSegment?: boolean;
}

export interface ILineSegments {
    segments: ILineSegment[];
}

export interface ILineSegment {
    points: IPoint[];
}