import { animate, style, transition, trigger } from "@angular/animations";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";

@Component({
    template: '',
    animations: [
        trigger('fade', [ 
          transition('void => *', [
            style({ opacity: 0 }), 
            animate(300, style({opacity: 1}))
          ]) 
        ])
      ]
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