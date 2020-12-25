import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";

@Component({
    template: ''
})
export class BaseComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor() {

    }

    public ngOnInit(): void {

    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}