import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';

@Injectable()
export class PlayerGuard implements CanActivate {
    constructor(
        protected readonly playerService: PlayerService,
        protected readonly router: Router
    ) { }

    canActivate(): boolean {
        const player = this.playerService.getCurrentPlayer();

        if (player == null) {
            this.router.navigateByUrl('new-player');
            return false;
        }

        return true;
    }
}