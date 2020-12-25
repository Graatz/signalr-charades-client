import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { RiotService } from '../../services/riot.service';
import { Observable } from 'rxjs';
import { IChampionsData } from '../../models/riot.models'
import { IPoint, ILineSegment, ILineSegments } from '../../models/chat.models';
import { DrawingService } from '../../services/drawing.service';
import { BaseComponent } from 'src/app/helpers/base.component';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LobbiesService } from 'src/app/services/lobbies.service';
import { ILobby } from 'src/app/models/lobbies.models';
import { PlayerService } from 'src/app/services/player.service';

interface ICanvasConfiguration {
  lineWidth: number;
  lineColor: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent extends BaseComponent implements OnInit {
  public lobby: ILobby;
  public playerId: string;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  canvasConfig: ICanvasConfiguration = {
    lineWidth: 6,
    lineColor: '#fff'
  }

  private ctx: CanvasRenderingContext2D;

  protected lastPosition: IPoint;
  protected drawing: boolean;

  protected currentSegment: ILineSegment = {
    points: []
  };

  protected lineSegments: ILineSegments = {
    segments: []
  };

  public championsData: Observable<IChampionsData>

  constructor(
    protected readonly lobbiesService: LobbiesService,
    protected readonly riotService: RiotService,
    protected readonly playerService: PlayerService,
    protected readonly drawingService: DrawingService,
    protected readonly ngZone: NgZone,
  ) {
    super();
  }

  ngOnInit(): void {
    this.playerId = this.playerService.getCurrentPlayer().id;

    this.lobbiesService.currentlyJoinedLobby$.pipe(
      distinctUntilChanged(),
      takeUntil(super.destroy$)
    ).subscribe((lobby: ILobby) => {
      this.lobby = lobby;
    })

    this.championsData = this.riotService.getChampions();
    this.championsData.pipe(
      distinctUntilChanged(),
      takeUntil(super.destroy$)
    ).subscribe((result: IChampionsData) => {
    })

    this.initCanvas();
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
    this.drawingService.segmentPointReceived.pipe(
      distinctUntilChanged(),
      takeUntil(super.destroy$)
    ).subscribe((point: IPoint) => {
      this.ngZone.run(() => {
        this.drawPointFromServer(point)
      });
    });
  }

  private drawPointFromServer(point: IPoint): void {
    if (point.clientUniqueId !== this.playerId) {
      this.currentSegment.points.push(point);

      if (point.isFirstPointInSegment) {
        this.lastPosition = null;
        this.lineSegments.segments.push(this.currentSegment);
      }

      if (this.lastPosition != null) {
        this.drawLine(this.lastPosition, point);
      }

      this.lastPosition = {
        clientUniqueId: point.clientUniqueId,
        x: point.x,
        y: point.y,
        isFirstPointInSegment: point.isFirstPointInSegment
      }
    }
  }

  private drawLine(fromPoint: IPoint, toPoint: IPoint): void {
    this.ctx.beginPath();
    this.ctx.moveTo(fromPoint.x, fromPoint.y);
    this.ctx.lineTo(toPoint.x, toPoint.y);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private initCanvas(): void {
    // window.addEventListener('resize', () => {
    //   var canvas = document.getElementById('canvas');

    //   this.redraw();
    // });

    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.initCanvasSettings();
    this.initCanvasEventListeners();
  }

  private initCanvasSettings(): void {
    this.ctx.lineWidth = this.canvasConfig.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = "round";
  }

  private initCanvasEventListeners(): void {
    this.canvas.nativeElement.addEventListener("mousedown", (event) => this.onMouseDown(event));
    document.addEventListener("mouseup", (event) => this.onMouseUp(event));

    // this.canvas.nativeElement.addEventListener("mouseup", (event) => this.onMouseUp(event));
    this.canvas.nativeElement.addEventListener("mousemove", (event) => this.onMouseMove(event));
    this.canvas.nativeElement.addEventListener("mouseout", (event) => this.onMouseOut(event));
    this.canvas.nativeElement.addEventListener("mouseenter", (event) => this.onMouseEnter(event));
  }

  private onMouseMove(e): void {
    if (!this.drawing) {
      return;
    }

    this.drawLine(this.lastPosition, { x: e.offsetX, y: e.offsetY } as IPoint);

    this.lastPosition = {
      clientUniqueId: this.playerId,
      x: e.offsetX,
      y: e.offsetY,
      isLastPointInSegment: false
    } as IPoint;

    this.currentSegment.points.push(this.lastPosition);
    this.drawingService.sendSegmentPoint(this.lastPosition, this.lobby.id);
  }

  private onMouseDown(e): void {
    this.drawing = true;

    this.currentSegment = {
      points: []
    } as ILineSegment;

    this.lastPosition = {
      clientUniqueId: this.playerId,
      x: e.offsetX,
      y: e.offsetY,
      isFirstPointInSegment: true
    } as IPoint;

    this.currentSegment.points.push(this.lastPosition);
    this.drawingService.sendSegmentPoint(this.lastPosition, this.lobby.id);
  }

  private onMouseUp(e): void {
    if (!this.drawing) {
      return;
    }

    if (this.lastPosition.x === e.offsetX && this.lastPosition.y === e.offsetY) {
      this.currentSegment.points.push({
        clientUniqueId: this.playerId,
        x: e.offsetX + 5,
        y: e.offsetY + 5,
        isLastPointInSegment: true
      } as IPoint);

      this.drawLine(this.lastPosition, { x: e.offsetX, y: e.offsetY } as IPoint);
    }

    this.drawing = false;
    this.lineSegments.segments.push(this.currentSegment);
    this.drawingService.sendSegmentPoint(this.lastPosition, this.lobby.id);
  }

  private onMouseOut(e): void {
    if (!this.drawing) {
      return;
    }

    // this.drawing = false;
    this.lastPosition = {
      x: e.offsetX,
      y: e.offsetY
    } as IPoint;

    this.currentSegment.points.push(this.lastPosition);
    this.lineSegments.segments.push(this.currentSegment);
  }

  private onMouseEnter(e): void {
    this.currentSegment = {
      points: []
    } as ILineSegment;

    this.lastPosition = {
      x: e.offsetX,
      y: e.offsetY
    } as IPoint;

    this.currentSegment.points.push(this.lastPosition);
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)

    this.lineSegments = {
      segments: []
    } as ILineSegments;
  }

  public redraw(): void {
    this.initCanvasSettings();
    for (const segment of this.lineSegments.segments) {
      for (let i = 0; i < segment.points.length - 1; i++) {
        this.drawLine(segment.points[i], segment.points[i + 1]);
      }
    }
  }
}
