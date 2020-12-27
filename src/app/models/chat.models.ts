export interface Message {
    playerId: string;
    type: string;
    content: string;
    timeStamp: Date;
}

export interface IPoint {
    clientUniqueId: string;
    canvasWidth: number;
    canvasHeight: number;
    x: number;
    y: number;
    isFirstPointInSegment?: boolean;
    isLastPointInSegment?: boolean;
}

export interface ILineSegments {
    segments: ILineSegment[];
}

export interface ILineSegment {
    points: IPoint[];
}