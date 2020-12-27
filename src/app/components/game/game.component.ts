import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { RiotService } from '../../services/riot.service';
import { Observable, fromEvent } from 'rxjs';
import { IChampionsData } from '../../models/riot.models'
import { IPoint, ILineSegment, ILineSegments } from '../../models/chat.models';
import { DrawingService } from '../../services/drawing.service';
import { BaseComponent } from 'src/app/helpers/base.component';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
export class GameComponent extends BaseComponent implements OnInit, AfterViewInit{
  public lobby: ILobby;
  public playerId: string;

  public initialWidth: number;
  public currentAspectRatioHeight: number;

  public initialHeight: number;
  public currentAspectRatioWidth: number;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  canvasConfig: ICanvasConfiguration = {
    lineWidth: 3,
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
      takeUntil(this.destroy$)
    ).subscribe((lobby: ILobby) => {
      this.lobby = lobby;
    })

    this.championsData = this.riotService.getChampions();
    this.championsData.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((result: IChampionsData) => {
    })

    this.initCanvas();
    this.subscribeToEvents();
  }

  ngAfterViewInit() {
    this.updateCanvasWidth();
    this.initCanvasSettings();
    this.initCanvasEventListeners();
  }


  private subscribeToEvents(): void {
    this.drawingService.segmentPointReceived.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((point: IPoint) => {
      this.ngZone.run(() => {
        this.drawPointFromServer(point)
      });
    });
  }

  private drawPointFromServer(point: IPoint): void {
    if (point.clientUniqueId !== this.playerId) {
      if (point.isFirstPointInSegment && this.currentSegment.points.length) {
        this.lastPosition = null;
        this.currentSegment = {
          points: []
        } as ILineSegment;
      }

      if (point.isLastPointInSegment) {
        this.lineSegments.segments.push(this.currentSegment);
      }

      this.currentSegment.points.push(point);

      if (this.lastPosition != null) {
        this.drawLine(this.lastPosition, point);
      }

      this.lastPosition = {
        clientUniqueId: point.clientUniqueId,
        canvasWidth: point.canvasWidth,
        canvasHeight: point.canvasHeight,
        x: point.x,
        y: point.y,
        isFirstPointInSegment: point.isFirstPointInSegment
      }
    }
  }

  private drawLine(fromPoint: IPoint, toPoint: IPoint): void {
    this.ctx.beginPath();
    this.ctx.moveTo(fromPoint.x * (this.canvas.nativeElement.width / fromPoint.canvasWidth), fromPoint.y * (this.canvas.nativeElement.height / fromPoint.canvasHeight));
    this.ctx.lineTo(toPoint.x * (this.canvas.nativeElement.width / toPoint.canvasWidth), toPoint.y * (this.canvas.nativeElement.height / toPoint.canvasHeight));
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private initCanvas(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    fromEvent(window, 'resize').pipe(
        takeUntil(this.destroy$)
    ).subscribe((event) => {
      this.ngZone.run(() => {
        this.updateCanvasWidth();
        this.redraw();
      });
    });


  }

  private updateCanvasWidth(): void {
    var canvas = document.getElementById('canvas');
    var canvasWrapper = document.getElementById('canvas-wrapper');

    var aspect = (canvas as any).height/(canvas as any).width;

    var width = canvasWrapper.offsetWidth;
    //var height = canvasWrapper.offsetHeight;

    (canvas as any).width = width;
    (canvas as any).height = Math.round(width * aspect);

    if (!this.initialWidth) {
      this.initialWidth = (canvas as any).width;
      this.initialHeight = (canvas as any).height
    }

    this.currentAspectRatioWidth = (canvas as any).width / this.initialWidth;
    this.currentAspectRatioHeight = (canvas as any).height / this.initialHeight;
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

    this.drawLine(this.lastPosition, { x: e.offsetX, y: e.offsetY, canvasWidth: this.canvas.nativeElement.width, canvasHeight: this.canvas.nativeElement.height, } as IPoint);

    this.lastPosition = {
      clientUniqueId: this.playerId,
      canvasWidth: this.canvas.nativeElement.width,
      canvasHeight: this.canvas.nativeElement.height,
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
      canvasWidth: this.canvas.nativeElement.width,
      canvasHeight: this.canvas.nativeElement.height,
      x: e.offsetX,
      y: e.offsetY,
      isFirstPointInSegment: true
    } as IPoint;

    this.currentSegment.points.push(this.lastPosition);

    this.drawLine(this.lastPosition, { x: e.offsetX, y: e.offsetY, canvasWidth: this.canvas.nativeElement.width, canvasHeight: this.canvas.nativeElement.height, } as IPoint);

    this.drawingService.sendSegmentPoint(this.lastPosition, this.lobby.id);
  }

  private onMouseUp(e): void {
    if (!this.drawing) {
      return;
    }

    /*if (this.lastPosition.x === e.offsetX && this.lastPosition.y === e.offsetY) {
      this.currentSegment.points.push({
        clientUniqueId: this.playerId,
        canvasWidth: this.canvas.nativeElement.width,
        canvasHeight: this.canvas.nativeElement.height,
        x: e.offsetX,
        y: e.offsetY,
        isLastPointInSegment: true
      } as IPoint);

      this.drawLine(this.lastPosition, { x: e.offsetX, y: e.offsetY, canvasWidth: this.canvas.nativeElement.width, canvasHeight: this.canvas.nativeElement.height, } as IPoint);
    }*/

    this.drawing = false;
    this.lineSegments.segments.push(this.currentSegment);
    this.lastPosition.isLastPointInSegment = true;
    this.drawingService.sendSegmentPoint(this.lastPosition, this.lobby.id);
  }

  private onMouseOut(e): void {
    if (!this.drawing) {
      return;
    }

    // this.drawing = false;
    this.lastPosition = {
      canvasWidth: this.canvas.nativeElement.width,
      canvasHeight: this.canvas.nativeElement.height,
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
      y: e.offsetY,
      canvasWidth: this.canvas.nativeElement.width,
      canvasHeight: this.canvas.nativeElement.height
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
