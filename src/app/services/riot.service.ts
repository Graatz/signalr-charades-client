import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IChampionsData } from '../models/riot.models'

@Injectable({
    providedIn: 'root',
})
export class RiotService {
    constructor(protected readonly http: HttpClient) {}

    public getChampions(): Observable<IChampionsData> {
        return this.http.get<IChampionsData>('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/champion.json');
    }
}