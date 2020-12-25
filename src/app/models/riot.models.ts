export interface IRiotData {
    format: string;
    type: string;
    version: string;
}

export interface IChampionsData extends IRiotData {
    data: IChampionData[];
}

export interface IChampionData {
    [champion: string] : {
        name: string;
        title: string;
    }
}