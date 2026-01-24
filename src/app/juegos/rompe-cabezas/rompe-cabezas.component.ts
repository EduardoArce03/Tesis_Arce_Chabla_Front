import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PuzzleService } from '@/services/puzzle.service';
import { FinalizarPuzzleRequest, ImagenPuzzle, IniciarPuzzleRequest, ProgresoJugador } from '@/models/puzzle.model';
import { Divider } from 'primeng/divider';
import { DesafioGenerado, DesafioPuzzleService, PowerUpDisponible, PowerUpPuzzle } from '@/services/desafio-puzzle.service';
import { ProgressBar } from 'primeng/progressbar';

// ============= CLASES AUXILIARES =============

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = Number(x);
    this.y = Number(y);
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }

  distance(otherPoint: Point): number {
    return Math.hypot(this.x - otherPoint.x, this.y - otherPoint.y);
  }
}

class Segment {
  p1: Point;
  p2: Point;

  constructor(p1: Point, p2: Point) {
    this.p1 = new Point(p1.x, p1.y);
    this.p2 = new Point(p2.x, p2.y);
  }

  dx(): number {
    return this.p2.x - this.p1.x;
  }

  dy(): number {
    return this.p2.y - this.p1.y;
  }

  length(): number {
    return Math.hypot(this.dx(), this.dy());
  }

  pointOnRelative(coeff: number): Point {
    const dx = this.dx();
    const dy = this.dy();
    return new Point(this.p1.x + coeff * dx, this.p1.y + coeff * dy);
  }
}

class Side {
  type: string = ""; // "d" para línea recta o "z" para forma de puzzle
  points: Point[] = [];
  scaledPoints: Point[] = [];

  reversed(): Side {
    const ns = new Side();
    ns.type = this.type;
    ns.points = this.points.slice().reverse();
    return ns;
  }

  scale(puzzle: Puzzle): void {
    const coefx = puzzle.scalex;
    const coefy = puzzle.scaley;
    this.scaledPoints = this.points.map(p => new Point(p.x * coefx, p.y * coefy));
  }

  drawPath(ctx: CanvasRenderingContext2D, shiftx: number, shifty: number, withoutMoveTo: boolean): void {
    if (!withoutMoveTo) {
      ctx.moveTo(this.scaledPoints[0].x + shiftx, this.scaledPoints[0].y + shifty);
    }
    if (this.type === "d") {
      ctx.lineTo(this.scaledPoints[1].x + shiftx, this.scaledPoints[1].y + shifty);
    } else {
      for (let k = 1; k < this.scaledPoints.length - 1; k += 3) {
        ctx.bezierCurveTo(
          this.scaledPoints[k].x + shiftx, this.scaledPoints[k].y + shifty,
          this.scaledPoints[k + 1].x + shiftx, this.scaledPoints[k + 1].y + shifty,
          this.scaledPoints[k + 2].x + shiftx, this.scaledPoints[k + 2].y + shifty
        );
      }
    }
  }
}

class Piece {
  ts: Side = new Side(); // top side
  rs: Side = new Side(); // right side
  bs: Side = new Side(); // bottom side
  ls: Side = new Side(); // left side
  kx: number;
  ky: number;

  constructor(kx: number, ky: number) {
    this.kx = kx;
    this.ky = ky;
  }

  scale(puzzle: Puzzle): void {
    this.ts.scale(puzzle);
    this.rs.scale(puzzle);
    this.bs.scale(puzzle);
    this.ls.scale(puzzle);
  }
}

class PolyPiece {
  pckxmin: number;
  pckxmax: number;
  pckymin: number;
  pckymax: number;
  pieces: Piece[] = [];
  puzzle: Puzzle;
  selected: boolean = false;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rot: number = 0;
  tbLoops: Side[][] = [];
  nx: number = 0;
  ny: number = 0;
  offsx: number = 0;
  offsy: number = 0;
  path!: Path2D;
  x: number = 0;
  y: number = 0;

  constructor(initialPiece: Piece, puzzle: Puzzle) {
    this.pckxmin = initialPiece.kx;
    this.pckxmax = initialPiece.kx + 1;
    this.pckymin = initialPiece.ky;
    this.pckymax = initialPiece.ky + 1;
    this.pieces = [initialPiece];
    this.puzzle = puzzle;
    this.listLoops();
    this.canvas = document.createElement('canvas') as HTMLCanvasElement;
    puzzle.container.appendChild(this.canvas);
    this.canvas.classList.add('polypiece');
    this.ctx = this.canvas.getContext("2d")!;
  }

  merge(otherPoly: PolyPiece): void {
    const orgpckxmin = this.pckxmin;
    const orgpckymin = this.pckymin;
    const pbefore = this.getTransformed(0, 0, this.nx * this.puzzle.scalex, this.ny * this.puzzle.scaley, this.rot);

    const kOther = this.puzzle.polyPieces.indexOf(otherPoly);
    this.puzzle.polyPieces.splice(kOther, 1);
    this.puzzle.container.removeChild(otherPoly.canvas);

    for (let k = 0; k < otherPoly.pieces.length; ++k) {
      this.pieces.push(otherPoly.pieces[k]);
      if (otherPoly.pieces[k].kx < this.pckxmin) this.pckxmin = otherPoly.pieces[k].kx;
      if (otherPoly.pieces[k].kx + 1 > this.pckxmax) this.pckxmax = otherPoly.pieces[k].kx + 1;
      if (otherPoly.pieces[k].ky < this.pckymin) this.pckymin = otherPoly.pieces[k].ky;
      if (otherPoly.pieces[k].ky + 1 > this.pckymax) this.pckymax = otherPoly.pieces[k].ky + 1;
    }

    this.pieces.sort((p1, p2) => {
      if (p1.ky < p2.ky) return -1;
      if (p1.ky > p2.ky) return 1;
      if (p1.kx < p2.kx) return -1;
      if (p1.kx > p2.kx) return 1;
      return 0;
    });

    this.listLoops();
    this.drawImage();

    const pafter = this.getTransformed(
      this.puzzle.scalex * (orgpckxmin - this.pckxmin),
      this.puzzle.scaley * (orgpckymin - this.pckymin),
      this.puzzle.scalex * (this.pckxmax - this.pckxmin + 1),
      this.puzzle.scaley * (this.pckymax - this.pckymin + 1),
      this.rot
    );

    this.moveTo(this.x - pafter.x + pbefore.x, this.y - pafter.y + pbefore.y);
    this.puzzle.evaluateZIndex();
  }

  getTransformed(orgx: number, orgy: number, width: number, height: number, rot: number): { x: number, y: number } {
    const dx = orgx - width / 2;
    const dy = orgy - height / 2;
    const rotations = [
      { x: 1, y: 0, dx: 0, dy: 1 },
      { x: 0, y: 1, dx: -1, dy: 0 },
      { x: -1, y: 0, dx: 0, dy: -1 },
      { x: 0, y: -1, dx: 1, dy: 0 }
    ];
    const r = rotations[rot];
    return {
      x: width / 2 + r.x * dx + r.dx * dy,
      y: height / 2 + r.y * dx + r.dy * dy
    };
  }

  ifNear(otherPoly: PolyPiece): boolean {
    if (this.rot !== otherPoly.rot) return false;

    const org = this.getOrgP();
    const orgOther = otherPoly.getOrgP();

    if (Math.hypot(org.x - orgOther.x, org.y - orgOther.y) >= this.puzzle.dConnect) return false;

    for (let k = this.pieces.length - 1; k >= 0; --k) {
      const p1 = this.pieces[k];
      for (let ko = otherPoly.pieces.length - 1; ko >= 0; --ko) {
        const p2 = otherPoly.pieces[ko];
        if (p1.kx === p2.kx && Math.abs(p1.ky - p2.ky) === 1) return true;
        if (p1.ky === p2.ky && Math.abs(p1.kx - p2.kx) === 1) return true;
      }
    }
    return false;
  }

  listLoops(): void {
    const edgeIsCommon = (kx: number, ky: number, edge: number): boolean => {
      let checkKx = kx, checkKy = ky;
      switch (edge) {
        case 0: checkKy--; break;
        case 1: checkKx++; break;
        case 2: checkKy++; break;
        case 3: checkKx--; break;
      }
      for (let k = 0; k < this.pieces.length; k++) {
        if (checkKx === this.pieces[k].kx && checkKy === this.pieces[k].ky) return true;
      }
      return false;
    };

    const edgeIsInTbEdges = (kx: number, ky: number, edge: number, tbEdges: any[]): number | false => {
      for (let k = 0; k < tbEdges.length; k++) {
        if (kx === tbEdges[k].kx && ky === tbEdges[k].ky && edge === tbEdges[k].edge) return k;
      }
      return false;
    };

    const tbLoops: any[] = [];
    let tbEdges: any[] = [];

    const tbTries = [
      [{ dkx: 0, dky: 0, edge: 1 }, { dkx: 1, dky: 0, edge: 0 }, { dkx: 1, dky: -1, edge: 3 }],
      [{ dkx: 0, dky: 0, edge: 2 }, { dkx: 0, dky: 1, edge: 1 }, { dkx: 1, dky: 1, edge: 0 }],
      [{ dkx: 0, dky: 0, edge: 3 }, { dkx: -1, dky: 0, edge: 2 }, { dkx: -1, dky: 1, edge: 1 }],
      [{ dkx: 0, dky: 0, edge: 0 }, { dkx: 0, dky: -1, edge: 3 }, { dkx: -1, dky: -1, edge: 2 }]
    ];

    for (let k = 0; k < this.pieces.length; k++) {
      for (let kEdge = 0; kEdge < 4; kEdge++) {
        if (!edgeIsCommon(this.pieces[k].kx, this.pieces[k].ky, kEdge)) {
          tbEdges.push({ kx: this.pieces[k].kx, ky: this.pieces[k].ky, edge: kEdge, kp: k });
        }
      }
    }

    while (tbEdges.length > 0) {
      const lp: any[] = [];
      let currEdge = tbEdges[0];
      lp.push(currEdge);
      tbEdges.splice(0, 1);

      let edgeNumber: number | false;
      do {
        edgeNumber = false;
        for (let tries = 0; tries < 3; tries++) {
          const potNext = tbTries[currEdge.edge][tries];
          edgeNumber = edgeIsInTbEdges(currEdge.kx + potNext.dkx, currEdge.ky + potNext.dky, potNext.edge, tbEdges);
          if (edgeNumber !== false) {
            currEdge = tbEdges[edgeNumber];
            lp.push(currEdge);
            tbEdges.splice(edgeNumber, 1);
            break;
          }
        }
      } while (edgeNumber !== false);

      tbLoops.push(lp);
    }

    this.tbLoops = tbLoops.map(loop => loop.map((edge: any) => {
      const cell = this.pieces[edge.kp];
      if (edge.edge === 0) return cell.ts;
      if (edge.edge === 1) return cell.rs;
      if (edge.edge === 2) return cell.bs;
      return cell.ls;
    }));
  }

  getRect(): { x: number, y: number, right: number, bottom: number, width: number, height: number } {
    const rect0 = this.puzzle.container.getBoundingClientRect();
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: rect.x - rect0.x,
      y: rect.y - rect0.y,
      right: rect.right - rect0.x,
      bottom: rect.bottom - rect0.y,
      width: rect.width,
      height: rect.height
    };
  }

  getOrgP(): { x: number, y: number } {
    const rect = this.getRect();
    const puzzle = this.puzzle;
    switch (this.rot) {
      case 0: return { x: rect.x - puzzle.scalex * this.pckxmin, y: rect.y - puzzle.scaley * this.pckymin };
      case 1: return { x: rect.right + puzzle.scaley * this.pckymin, y: rect.y - puzzle.scalex * this.pckxmin };
      case 2: return { x: rect.right + puzzle.scalex * this.pckxmin, y: rect.bottom + puzzle.scaley * this.pckymin };
      case 3: return { x: rect.x - puzzle.scaley * this.pckymin, y: rect.bottom + puzzle.scalex * this.pckxmin };
      default: return { x: 0, y: 0 };
    }
  }

  drawPath(ctx: CanvasRenderingContext2D, shiftx: number, shifty: number): void {
    this.tbLoops.forEach(loop => {
      let without = false;
      loop.forEach(side => {
        side.drawPath(ctx, shiftx, shifty, without);
        without = true;
      });
      ctx.closePath();
    });
  }

  drawImage(special?: boolean): void {
  const puzzle = this.puzzle;
  this.nx = this.pckxmax - this.pckxmin + 1;
  this.ny = this.pckymax - this.pckymin + 1;
  this.canvas.width = this.nx * puzzle.scalex;
  this.canvas.height = this.ny * puzzle.scaley;

  this.offsx = (this.pckxmin - 0.5) * puzzle.scalex;
  this.offsy = (this.pckymin - 0.5) * puzzle.scaley;

  this.path = new Path2D();
  this.drawPath(this.path as any, -this.offsx, -this.offsy);

  // Limpiar canvas primero
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  if (special) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    this.ctx.shadowColor = 'gold';
    this.ctx.shadowBlur = 30;
    this.ctx.fill(this.path);
    this.ctx.restore();
  }

  // Dibujar sombra
  this.ctx.save();
  this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';

  if (this.selected && special) {
    this.ctx.shadowColor = 'gold';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Dibujar múltiples veces para efecto más intenso
    for (let i = 0; i < 10; i++) {
      this.ctx.fill(this.path);
    }
  } else if (this.selected) {
    // Seleccionado normal (sin merge)
    this.ctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
    this.ctx.shadowBlur = Math.min(8, puzzle.scalex / 10);
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    for (let i = 0; i < 6; i++) {
      this.ctx.fill(this.path);
    }
  } else {
    // Sombra normal
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = -4;
    this.ctx.shadowOffsetY = 4;
    this.ctx.fill(this.path);
  }

  this.ctx.restore();

  // Dibujar cada pieza
  this.pieces.forEach((pp) => {
    this.ctx.save();

    // Crear path para esta pieza específica
    const path = new Path2D();
    const shiftx = -this.offsx;
    const shifty = -this.offsy;

    pp.ts.drawPath(this.ctx, shiftx, shifty, false);
    pp.rs.drawPath(this.ctx, shiftx, shifty, true);
    pp.bs.drawPath(this.ctx, shiftx, shifty, true);
    pp.ls.drawPath(this.ctx, shiftx, shifty, true);
    path.closePath();

    // Aplicar clipping
    this.ctx.clip(this.path);

    // Calcular coordenadas de origen en la imagen
    const srcx = pp.kx ? ((pp.kx - 0.5) * puzzle.scalex) : 0;
    const srcy = pp.ky ? ((pp.ky - 0.5) * puzzle.scaley) : 0;

    const destx = (pp.kx ? 0 : puzzle.scalex / 2) + (pp.kx - this.pckxmin) * puzzle.scalex;
    const desty = (pp.ky ? 0 : puzzle.scaley / 2) + (pp.ky - this.pckymin) * puzzle.scaley;

    let w = 2 * puzzle.scalex;
    let h = 2 * puzzle.scaley;

    // Ajustar dimensiones si exceden el canvas
    if (srcx + w > puzzle.gameCanvas.width) w = puzzle.gameCanvas.width - srcx;
    if (srcy + h > puzzle.gameCanvas.height) h = puzzle.gameCanvas.height - srcy;

    // Dibujar la imagen del gameCanvas
    this.ctx.drawImage(
      puzzle.gameCanvas,
      srcx, srcy, w, h,
      destx, desty, w, h
    );

    this.ctx.restore();
  });

  // Dibujar bordes con efecto 3D
  this.pieces.forEach((pp) => {
    this.ctx.save();

    const path = new Path2D();
    const shiftx = -this.offsx;
    const shifty = -this.offsy;

    pp.ts.drawPath(this.ctx, shiftx, shifty, false);
    pp.rs.drawPath(this.ctx, shiftx, shifty, true);
    pp.bs.drawPath(this.ctx, shiftx, shifty, true);
    pp.ls.drawPath(this.ctx, shiftx, shifty, true);
    path.closePath();

    if (special && this.selected) {
      this.ctx.strokeStyle = "rgba(255, 215, 0, 0.8)"; // Dorado
      this.ctx.lineWidth = puzzle.embossThickness * 1.5;
      this.ctx.stroke(path);
    }

    // Sombra oscura
    this.ctx.translate(puzzle.embossThickness / 2, -puzzle.embossThickness / 2);
    this.ctx.lineWidth = puzzle.embossThickness;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    this.ctx.stroke(path);

    // Luz clara
    this.ctx.translate(-puzzle.embossThickness, puzzle.embossThickness);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    this.ctx.stroke(path);

    this.ctx.restore();
  });

  // Aplicar rotación si es necesario
  this.canvas.style.transform = `rotate(${90 * this.rot}deg)`;
}

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.canvas.style.left = x + 'px';
    this.canvas.style.top = y + 'px';
  }

  moveToInitialPlace(): void {
    const puzzle = this.puzzle;
    this.moveTo(
      puzzle.offsx + (this.pckxmin - 0.5) * puzzle.scalex,
      puzzle.offsy + (this.pckymin - 0.5) * puzzle.scaley
    );
  }

  rotate(angle: number): void {
    this.canvas.style.transform = `rotate(${90 * angle}deg)`;
    this.rot = angle;
  }

  isPointInPath(p: { x: number, y: number }): boolean {
    const rect = this.getRect();
    const pRefx = [rect.x, rect.right, rect.right, rect.x][this.rot];
    const pRefy = [rect.y, rect.y, rect.bottom, rect.bottom][this.rot];

    const rotData = [
      { mx: 1, my: 0, dx: 0, dy: 1 },
      { mx: 0, my: -1, dx: 1, dy: 0 },
      { mx: -1, my: 0, dx: 0, dy: -1 },
      { mx: 0, my: 1, dx: -1, dy: 0 }
    ][this.rot];

    const mposx = rotData.mx * (p.x - pRefx) + rotData.dx * (p.y - pRefy);
    const mposy = rotData.my * (p.x - pRefx) + rotData.dy * (p.y - pRefy);

    return this.ctx.isPointInPath(this.path, mposx, mposy);
  }
}

// ============= FUNCIONES AUXILIARES =============

function alea(min: number, max?: number): number {
  if (typeof max === 'undefined') return min * Math.random();
  return min + (max - min) * Math.random();
}

function intAlea(min: number, max?: number): number {
  if (typeof max === 'undefined') {
    max = min;
    min = 0;
  }
  return Math.floor(min + (max - min) * Math.random());
}

function arrayShuffle<T>(array: T[]): T[] {
  for (let k = array.length - 1; k >= 1; --k) {
    const k1 = intAlea(0, k + 1);
    const temp = array[k];
    array[k] = array[k1];
    array[k1] = temp;
  }
  return array;
}

function twist0(side: Side, ca: Point, cb: Point): void {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx();
  const dyh = seg0.dy();

  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5);
  const mid1 = seg1.pointOnRelative(0.5);

  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx();
  const dyv = segMid.dy();

  const scalex = alea(0.8, 1);
  const scaley = alea(0.9, 1);
  const mid = alea(0.45, 0.55);

  const pointAt = (coeffh: number, coeffv: number) => {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv
    );
  };

  const pa = pointAt(mid - 1 / 12 * scalex, 1 / 12 * scaley);
  const pb = pointAt(mid - 2 / 12 * scalex, 3 / 12 * scaley);
  const pc = pointAt(mid, 4 / 12 * scaley);
  const pd = pointAt(mid + 2 / 12 * scalex, 3 / 12 * scaley);
  const pe = pointAt(mid + 1 / 12 * scalex, 1 / 12 * scaley);

  side.points = [
    seg0.p1,
    new Point(seg0.p1.x + 5 / 12 * dxh * 0.52, seg0.p1.y + 5 / 12 * dyh * 0.52),
    new Point(pa.x - 1 / 12 * dxv * 0.72, pa.y - 1 / 12 * dyv * 0.72),
    pa,
    new Point(pa.x + 1 / 12 * dxv * 0.72, pa.y + 1 / 12 * dyv * 0.72),
    new Point(pb.x - 1 / 12 * dxv * 0.92, pb.y - 1 / 12 * dyv * 0.92),
    pb,
    new Point(pb.x + 1 / 12 * dxv * 0.52, pb.y + 1 / 12 * dyv * 0.52),
    new Point(pc.x - 2 / 12 * dxh * 0.40, pc.y - 2 / 12 * dyh * 0.40),
    pc,
    new Point(pc.x + 2 / 12 * dxh * 0.40, pc.y + 2 / 12 * dyh * 0.40),
    new Point(pd.x + 1 / 12 * dxv * 0.52, pd.y + 1 / 12 * dyv * 0.52),
    pd,
    new Point(pd.x - 1 / 12 * dxv * 0.92, pd.y - 1 / 12 * dyv * 0.92),
    new Point(pe.x + 1 / 12 * dxv * 0.72, pe.y + 1 / 12 * dyv * 0.72),
    pe,
    new Point(pe.x - 1 / 12 * dxv * 0.72, pe.y - 1 / 12 * dyv * 0.72),
    new Point(seg0.p2.x - 5 / 12 * dxh * 0.52, seg0.p2.y - 5 / 12 * dyh * 0.52),
    seg0.p2
  ];
  side.type = "z";
}

// ============= CLASE PUZZLE =============

class Puzzle {
  container: HTMLElement;
  contWidth: number = 0;
  contHeight: number = 0;
  srcImage: HTMLImageElement;
  imageLoaded: boolean = false;
  gameCanvas: HTMLCanvasElement;
  gameCtx!: CanvasRenderingContext2D;
  gameWidth: number = 0;
  gameHeight: number = 0;
  nx: number = 0;
  ny: number = 0;
  scalex: number = 0;
  scaley: number = 0;
  offsx: number = 0;
  offsy: number = 0;
  dConnect: number = 0;
  embossThickness: number = 0;
  pieces: Piece[][] = [];
  polyPieces: PolyPiece[] = [];
  zIndexSup: number = 0;
  nbPieces: number = 12;

  constructor(container: HTMLElement) {
    this.container = container;
    this.srcImage = new Image();
    this.gameCanvas = document.createElement('canvas') as HTMLCanvasElement;
    this.container.appendChild(this.gameCanvas);
    this.gameCanvas.classList.add('gameCanvas');
    this.gameCanvas.style.zIndex = '500';
  }

  getContainerSize(): void {
    const styl = window.getComputedStyle(this.container);
    this.contWidth = parseFloat(styl.width);
    this.contHeight = parseFloat(styl.height);
  }

  computenxAndny(): void {
    const width = this.srcImage.naturalWidth;
    const height = this.srcImage.naturalHeight;
    const npieces = this.nbPieces;
    let errmin = 1e9;

    let nHPieces = Math.round(Math.sqrt(npieces * width / height));
    let nVPieces = Math.round(npieces / nHPieces);

    for (let ky = 0; ky < 5; ky++) {
      const ncv = nVPieces + ky - 2;
      for (let kx = 0; kx < 5; kx++) {
        const nch = nHPieces + kx - 2;
        let err = nch * height / ncv / width;
        err = (err + 1 / err) - 2;
        err += Math.abs(1 - nch * ncv / npieces);

        if (err < errmin) {
          errmin = err;
          this.nx = nch;
          this.ny = ncv;
        }
      }
    }
  }

  defineShapes(): void {
    const coeffDecentr = 0.12;
    const corners: Point[][] = [];
    const nx = this.nx;
    const ny = this.ny;

    for (let ky = 0; ky <= ny; ++ky) {
      corners[ky] = [];
      for (let kx = 0; kx <= nx; ++kx) {
        corners[ky][kx] = new Point(
          kx + alea(-coeffDecentr, coeffDecentr),
          ky + alea(-coeffDecentr, coeffDecentr)
        );
        if (kx === 0) corners[ky][kx].x = 0;
        if (kx === nx) corners[ky][kx].x = nx;
        if (ky === 0) corners[ky][kx].y = 0;
        if (ky === ny) corners[ky][kx].y = ny;
      }
    }

    this.pieces = [];
    for (let ky = 0; ky < ny; ++ky) {
      this.pieces[ky] = [];
      for (let kx = 0; kx < nx; ++kx) {
        const np = new Piece(kx, ky);
        this.pieces[ky][kx] = np;

        // Top side
        if (ky === 0) {
          np.ts.points = [corners[ky][kx], corners[ky][kx + 1]];
          np.ts.type = "d";
        } else {
          np.ts = this.pieces[ky - 1][kx].bs.reversed();
        }

        // Right side
        np.rs.points = [corners[ky][kx + 1], corners[ky + 1][kx + 1]];
        np.rs.type = "d";
        if (kx < nx - 1) {
          if (intAlea(2)) {
            twist0(np.rs, corners[ky][kx], corners[ky + 1][kx]);
          } else {
            twist0(np.rs, corners[ky][kx + 2], corners[ky + 1][kx + 2]);
          }
        }

        // Left side
        if (kx === 0) {
          np.ls.points = [corners[ky + 1][kx], corners[ky][kx]];
          np.ls.type = "d";
        } else {
          np.ls = this.pieces[ky][kx - 1].rs.reversed();
        }

        // Bottom side
        np.bs.points = [corners[ky + 1][kx + 1], corners[ky + 1][kx]];
        np.bs.type = "d";
        if (ky < ny - 1) {
          if (intAlea(2)) {
            twist0(np.bs, corners[ky][kx + 1], corners[ky][kx]);
          } else {
            twist0(np.bs, corners[ky + 2][kx + 1], corners[ky + 2][kx]);
          }
        }
      }
    }
  }

  scale(): void {
    const maxWidth = 0.95 * this.contWidth;
    const maxHeight = 0.95 * this.contHeight;
    let gameInfo: any = {};
    let memoHeight = 0;
    const xtra = Math.ceil(this.nx * this.ny * 0.2);

    for (let extrax = 0; extrax <= Math.ceil(xtra / this.ny); ++extrax) {
      const reqx = this.srcImage.naturalWidth * (this.nx + extrax) / this.nx;
      const availx = (extrax === 0) ? maxWidth : this.contWidth;

      for (let extray = Math.ceil(xtra / this.nx);
           (this.nx + extrax) * (this.ny + extray) >= this.nx * this.ny + xtra;
           --extray) {
        const reqy = this.srcImage.naturalHeight * (this.ny + extray) / this.ny;
        const availy = (extray === 0) ? maxHeight : this.contHeight;
        let resultx = availx;
        let resulty = resultx * reqy / reqx;

        if (resulty > availy) {
          resulty = availy;
          resultx = resulty * reqx / reqy;
        }

        const gameHeight = resulty / (this.ny + extray) * this.ny;
        const gameWidth = resultx / (this.nx + extrax) * this.nx;

        if (gameHeight > memoHeight) {
          memoHeight = gameHeight;
          gameInfo = { gameWidth, gameHeight, extrax, extray };
        }
      }
    }

    this.gameHeight = gameInfo.gameHeight;
    this.gameWidth = gameInfo.gameWidth;

    this.gameCanvas.width = this.gameWidth;
    this.gameCanvas.height = this.gameHeight;
    this.gameCtx = this.gameCanvas.getContext("2d")!;
    this.gameCtx.drawImage(this.srcImage, 0, 0, this.gameWidth, this.gameHeight);

    this.scalex = this.gameWidth / this.nx;
    this.scaley = this.gameHeight / this.ny;

    this.pieces.forEach(row => {
      row.forEach(piece => piece.scale(this));
    });

    this.offsx = (this.contWidth - this.gameWidth) / 2;
    this.offsy = (this.contHeight - this.gameHeight) / 2;

    this.dConnect = Math.max(10, Math.min(this.scalex, this.scaley) / 10);
    this.embossThickness = Math.min(2 + this.scalex / 200 * (5 - 2), 5);
  }

  create(): void {
    this.container.innerHTML = "";
    this.getContainerSize();
    this.computenxAndny();
    this.defineShapes();

    this.polyPieces = [];
    this.pieces.forEach(row => row.forEach(piece => {
      this.polyPieces.push(new PolyPiece(piece, this));
    }));

    arrayShuffle(this.polyPieces);
    this.evaluateZIndex();
  }

  optimInitial(): void {
    const minx = -this.scalex / 2;
    const miny = -this.scaley / 2;
    const maxx = this.contWidth - 1.5 * this.scalex;
    const maxy = this.contHeight - 1.5 * this.scaley;

    this.polyPieces.forEach(pp => {
      pp.moveTo(
        alea(minx, maxx),
        alea(miny, maxy)
      );
    });
  }

  evaluateZIndex(): void {
    for (let k = this.polyPieces.length - 1; k > 0; --k) {
      if (this.polyPieces[k].pieces.length > this.polyPieces[k - 1].pieces.length) {
        [this.polyPieces[k], this.polyPieces[k - 1]] = [this.polyPieces[k - 1], this.polyPieces[k]];
      }
    }

    this.polyPieces.forEach((pp, k) => {
      pp.canvas.style.zIndex = (k + 10).toString();
    });

    this.zIndexSup = this.polyPieces.length + 10;
  }
}

// ============= COMPONENTE ANGULAR =============

@Component({
    selector: 'app-rompe-cabezas',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, DialogModule, ToastModule, Divider, ProgressBar],
    providers: [MessageService],
    templateUrl: './rompe-cabezas.component.html',
    styleUrls: ['./rompe-cabezas.component.scss']
})
export class RompeCabezasComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('puzzleContainer', { static: false }) puzzleContainer!: ElementRef<HTMLDivElement>;

    // Estado del juego
    gridSize: number = 3;
    moves: number = 0;
    tiempoLimite: number = 0; // ⬅️ NUEVO
    tiempoRestante: number = 0; // ⬅️ CAMBIADO
    timerInterval: any;
    isPlaying: boolean = false;
    isCompleted: boolean = false;

    // Backend
    jugadorId: string = '';
    partidaId: number | null = null;
    imagenActual: ImagenPuzzle | null = null;
    imagenesDisponibles: ImagenPuzzle[] = [];
    progreso: ProgresoJugador | null = null;

    // Diálogos
    mostrarSelectorImagenes: boolean = true;
    mostrarVictoria: boolean = false;

    // Resultados
    estrellasObtenidas: number = 0;
    mensajeVictoria: string = '';
    siguienteImagen: ImagenPuzzle | null = null;

    // ==================== DESAFÍOS ====================
    mostrarDesafio: boolean = false;
    desafioActual: DesafioGenerado | null = null;
    tiempoDesafio: number = 15;
    timerDesafio: any;
    respuestaSeleccionada: string | null = null;
    desafioRespondido: boolean = false;

    // ==================== POWER-UPS ====================
    powerUpsDisponibles: PowerUpDisponible[] = [];
    mostrarMenuPowerUps: boolean = false;
    powerUpActivo: PowerUpPuzzle | null = null;
    tiempoPowerUpActivo: number = 0;

    // Control de desafíos
    private movimientosDesdeUltimoDesafio: number = 0;
    private readonly MOVIMIENTOS_PARA_DESAFIO = 15;

    private puzzle?: Puzzle;
    private moving: any = {};

    constructor(
        private puzzleService: PuzzleService,
        private desafioService: DesafioPuzzleService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.jugadorId = this.obtenerJugadorId();
        this.cargarDatosIniciales();
    }

    ngAfterViewInit() {
        console.log('✅ Vista inicializada');
    }

    // ==================== MÉTODOS BACKEND ====================

    private obtenerJugadorId(): string {
        let jugadorId = localStorage.getItem('jugadorId');
        if (!jugadorId) {
            jugadorId = `jugador_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('jugadorId', jugadorId);
        }
        return jugadorId;
    }

    private cargarDatosIniciales(): void {
        console.log('📊 Cargando datos iniciales para:', this.jugadorId);

        this.puzzleService.obtenerProgreso(this.jugadorId).subscribe({
            next: (progreso) => {
                this.progreso = progreso;
                console.log('✅ Progreso cargado:', progreso);
            },
            error: (error) => {
                console.error('❌ Error cargando progreso:', error);
            }
        });

        this.puzzleService.obtenerImagenesDisponibles(this.jugadorId).subscribe({
            next: (imagenes) => {
                this.imagenesDisponibles = imagenes;
                console.log('✅ Imágenes cargadas:', imagenes);
            },
            error: (error) => {
                console.error('❌ Error cargando imágenes:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar las imágenes disponibles'
                });
            }
        });
    }

    seleccionarImagen(imagen: ImagenPuzzle): void {
        if (!imagen.desbloqueada) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Bloqueado',
                detail: 'Completa el puzzle anterior para desbloquear este'
            });
            return;
        }

        console.log('🖼️ Imagen seleccionada:', imagen.titulo);
        this.imagenActual = imagen;
        this.mostrarSelectorImagenes = false;

        setTimeout(() => {
            this.initializePuzzle();
            this.loadImage(imagen.imagenUrl);
        }, 100);
    }

    iniciarJuego(): void {
        if (!this.imagenActual || !this.puzzle) {
            console.error('❌ No hay imagen o puzzle');
            return;
        }

        const request: IniciarPuzzleRequest = {
            jugadorId: this.jugadorId,
            imagenId: this.imagenActual.id,
            gridSize: this.gridSize
        };

        console.log('🎮 Iniciando juego:', request);

        this.puzzleService.iniciarPuzzle(request).subscribe({
            next: (response) => {
                console.log('✅ Partida iniciada:', response);
                this.partidaId = response.partidaId;

                // ⬇️ CONFIGURAR TIEMPO LÍMITE
                this.tiempoLimite = response.tiempoLimiteSegundos;
                this.tiempoRestante = response.tiempoLimiteSegundos;

                if (this.puzzle?.gameCanvas) {
                    this.puzzle.gameCanvas.style.display = 'none';
                }

                if (this.puzzle?.polyPieces) {
                    this.puzzle.polyPieces.forEach(pp => {
                        pp.canvas.classList.add('moving');
                    });

                    setTimeout(() => {
                        this.puzzle!.optimInitial();

                        setTimeout(() => {
                            this.puzzle!.polyPieces.forEach(pp => {
                                pp.canvas.classList.remove('moving');
                            });

                            this.moves = 0;
                            this.movimientosDesdeUltimoDesafio = 0;
                            this.isPlaying = true;
                            this.isCompleted = false;
                            this.iniciarContadorInverso(); // ⬅️ CAMBIADO

                            this.messageService.add({
                                severity: 'success',
                                summary: response.mensajeBienvenida,
                                life: 3000
                            });
                        }, 1200);
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error iniciando partida:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'No se pudo iniciar la partida'
                });
            }
        });
    }

    // ⬇️ NUEVO: Contador inverso (cuenta regresiva)
    iniciarContadorInverso(): void {
        this.detenerContador();

        this.timerInterval = setInterval(() => {
            this.tiempoRestante--;

            // Game Over si se acaba el tiempo
            if (this.tiempoRestante <= 0) {
                this.detenerContador();
                this.gameOver();
            }

            // Alerta cuando quedan 60 segundos
            if (this.tiempoRestante === 60) {
                this.messageService.add({
                    severity: 'warn',
                    summary: '⏱️ ¡Último minuto!',
                    detail: 'Apresúrate, el tiempo se agota',
                    life: 3000
                });
            }

            // Alerta cuando quedan 30 segundos
            if (this.tiempoRestante === 30) {
                this.messageService.add({
                    severity: 'error',
                    summary: '🚨 ¡30 segundos!',
                    detail: 'El tiempo casi se acaba',
                    life: 2000
                });
            }
        }, 1000);
    }

    // ⬇️ NUEVO: Agregar tiempo bonus
    agregarTiempoBonus(segundos: number): void {
        this.tiempoRestante += segundos;

        this.messageService.add({
            severity: 'success',
            summary: `⏱️ +${segundos} segundos`,
            detail: '¡Tiempo extra ganado!',
            life: 2000
        });

        console.log(`⏱️ Tiempo agregado: +${segundos}s | Total: ${this.tiempoRestante}s`);
    }

    // ⬇️ NUEVO: Game Over por tiempo agotado
    gameOver(): void {
        this.isPlaying = false;
        this.isCompleted = false;

        this.messageService.add({
            severity: 'error',
            summary: '⏱️ ¡Tiempo Agotado!',
            detail: 'No completaste el puzzle a tiempo',
            life: 5000
        });

        setTimeout(() => {
            this.volverAlMenu();
        }, 3000);
    }

    checkWin(): void {
        if (!this.puzzle || !this.puzzle.polyPieces) return;

        if (this.puzzle.polyPieces.length === 1 && this.puzzle.polyPieces[0].rot === 0) {
            this.isCompleted = true;
            this.isPlaying = false;
            this.detenerContador();
            this.finalizarPuzzle();
        }
    }

    private finalizarPuzzle(): void {
        if (!this.partidaId) {
            console.error('❌ No hay partidaId');
            return;
        }

        const request: FinalizarPuzzleRequest = {
            partidaId: this.partidaId,
            jugadorId: this.jugadorId,
            movimientos: this.moves,
            tiempoRestante: this.tiempoRestante, // ⬅️ CAMBIADO
            hintsUsados: 0
        };

        console.log('🏁 Finalizando puzzle:', request);

        this.puzzleService.finalizarPuzzle(request).subscribe({
            next: (response) => {
                console.log('✅ Puzzle finalizado:', response);

                this.estrellasObtenidas = response.estrellas;
                this.mensajeVictoria = response.mensaje;
                this.siguienteImagen = response.siguienteImagenDesbloqueada;
                this.progreso = response.progresoActual;

                setTimeout(() => {
                    this.mostrarVictoria = true;
                }, 500);

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Felicidades!',
                    detail: response.mensaje,
                    life: 5000
                });
            },
            error: (error) => {
                console.error('❌ Error finalizando puzzle:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo guardar el resultado'
                });
            }
        });
    }

    continuarSiguiente(): void {
        if (this.siguienteImagen) {
            this.mostrarVictoria = false;
            this.seleccionarImagen(this.siguienteImagen);
        } else {
            this.volverAlMenu();
        }
    }

    volverAlMenu(): void {
        this.mostrarVictoria = false;
        this.resetGame();
        this.mostrarSelectorImagenes = true;
        this.cargarDatosIniciales();
    }

    obtenerEstrellas(cantidad: number): string[] {
        return Array(cantidad).fill('⭐');
    }

    // ==================== MÉTODOS DESAFÍOS ====================

    private verificarDesafio(): void {
        if (!this.isPlaying || !this.partidaId) return;

        this.movimientosDesdeUltimoDesafio++;

        if (this.movimientosDesdeUltimoDesafio >= this.MOVIMIENTOS_PARA_DESAFIO) {
            this.movimientosDesdeUltimoDesafio = 0;
            this.mostrarNuevoDesafio();
        }
    }

    private mostrarNuevoDesafio(): void {
        if (!this.partidaId) return;

        console.log('🎯 Generando desafío...');

        this.desafioService.generarDesafio(this.partidaId).subscribe({
            next: (desafio) => {
                console.log('✅ Desafío generado:', desafio);
                this.desafioActual = desafio;
                this.tiempoDesafio = desafio.tiempoLimite;
                this.respuestaSeleccionada = null;
                this.desafioRespondido = false;
                this.mostrarDesafio = true;

                // Pausar el juego
                this.detenerContador();

                // Iniciar contador del desafío
                this.iniciarContadorDesafio();

                this.messageService.add({
                    severity: 'info',
                    summary: '🎯 ¡Desafío Cultural!',
                    detail: 'Responde correctamente para ganar tiempo y power-ups',
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Error generando desafío:', error);
            }
        });
    }

    private iniciarContadorDesafio(): void {
        this.detenerContadorDesafio();

        this.timerDesafio = setInterval(() => {
            this.tiempoDesafio--;

            if (this.tiempoDesafio <= 0) {
                this.detenerContadorDesafio();
                this.responderDesafioIncorrecto();
            }
        }, 1000);
    }

    private detenerContadorDesafio(): void {
        if (this.timerDesafio) {
            clearInterval(this.timerDesafio);
            this.timerDesafio = null;
        }
    }

    seleccionarRespuesta(opcion: string): void {
        if (this.desafioRespondido) return;
        this.respuestaSeleccionada = opcion;
    }

    confirmarRespuesta(): void {
        if (!this.respuestaSeleccionada || !this.desafioActual || this.desafioRespondido) {
            return;
        }

        this.desafioRespondido = true;
        this.detenerContadorDesafio();

        this.desafioService.responderDesafio({
            desafioId: this.desafioActual.desafioId,
            respuestaSeleccionada: this.respuestaSeleccionada
        }).subscribe({
            next: (response) => {
                console.log('✅ Respuesta procesada:', response);

                if (response.correcto) {
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Correcto! ✅',
                        detail: response.mensaje,
                        life: 3000
                    });

                    // ⬇️ AGREGAR TIEMPO BONUS
                    if (response.tiempoBonus > 0) {
                        this.agregarTiempoBonus(response.tiempoBonus);
                    }

                    if (response.powerUpObtenido) {
                        this.mostrarAnimacionPowerUp(response.powerUpObtenido);
                    }
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Incorrecto ❌',
                        detail: response.mensaje,
                        life: 3000
                    });
                }

                this.powerUpsDisponibles = response.powerUpsDisponibles;

                setTimeout(() => {
                    this.cerrarDesafio();
                }, 2000);
            },
            error: (error) => {
                console.error('❌ Error respondiendo desafío:', error);
                this.cerrarDesafio();
            }
        });
    }

    private responderDesafioIncorrecto(): void {
        if (!this.desafioActual || this.desafioRespondido) return;

        this.desafioRespondido = true;

        this.desafioService.responderDesafio({
            desafioId: this.desafioActual.desafioId,
            respuestaSeleccionada: ''
        }).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: '⏱️ ¡Tiempo agotado!',
                    detail: 'No respondiste a tiempo',
                    life: 3000
                });

                setTimeout(() => {
                    this.cerrarDesafio();
                }, 2000);
            },
            error: (error) => {
                console.error('❌ Error:', error);
                this.cerrarDesafio();
            }
        });
    }

    cerrarDesafio(): void {
        this.mostrarDesafio = false;
        this.desafioActual = null;
        this.detenerContadorDesafio();

        // Reanudar el juego
        if (this.isPlaying) {
            this.iniciarContadorInverso();
        }
    }

    private mostrarAnimacionPowerUp(tipo: PowerUpPuzzle): void {
        const nombres = {
            [PowerUpPuzzle.VISION_CONDOR]: 'Visión del Cóndor 👁️',
            [PowerUpPuzzle.TIEMPO_PACHAMAMA]: 'Tiempo de la Pachamama ⏱️',
            [PowerUpPuzzle.SABIDURIA_AMAWTA]: 'Sabiduría del Amawta 🧠',
            [PowerUpPuzzle.BENDICION_SOL]: 'Bendición del Sol ☀️'
        };

        this.messageService.add({
            severity: 'success',
            summary: '🎁 ¡Power-Up Obtenido!',
            detail: nombres[tipo],
            life: 4000,
            sticky: false
        });
    }

    // ==================== MÉTODOS POWER-UPS ====================

    abrirMenuPowerUps(): void {
        if (!this.partidaId) return;

        this.desafioService.obtenerPowerUps(this.partidaId).subscribe({
            next: (powerUps) => {
                this.powerUpsDisponibles = powerUps;
                this.mostrarMenuPowerUps = true;
            },
            error: (error) => {
                console.error('❌ Error cargando power-ups:', error);
            }
        });
    }

    usarPowerUp(powerUp: PowerUpDisponible): void {
        if (!this.partidaId) return;

        this.desafioService.usarPowerUp({
            powerUpId: powerUp.id,
            partidaId: this.partidaId
        }).subscribe({
            next: (response) => {
                console.log('⚡ Power-up activado:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: '⚡ Power-Up Activado',
                    detail: response.mensaje,
                    life: 3000
                });

                // Aplicar efecto del power-up
                this.aplicarEfectoPowerUp(response.tipo, response.datos);

                // Actualizar lista
                this.powerUpsDisponibles = this.powerUpsDisponibles.filter(
                    p => p.id !== powerUp.id
                );

                this.mostrarMenuPowerUps = false;
            },
            error: (error) => {
                console.error('❌ Error usando power-up:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo activar el power-up',
                    life: 3000
                });
            }
        });
    }

    private aplicarEfectoPowerUp(tipo: PowerUpPuzzle, datos: any): void {
        switch (tipo) {
            case PowerUpPuzzle.VISION_CONDOR:
                this.activarVisionCondor(datos.duracion);
                break;

            case PowerUpPuzzle.TIEMPO_PACHAMAMA:
                this.activarTiempoPachamama(datos.duracion);
                break;

            case PowerUpPuzzle.SABIDURIA_AMAWTA:
                this.activarSabiduriaAmawta();
                break;

            case PowerUpPuzzle.BENDICION_SOL:
                this.activarBendicionSol(datos.multiplicador, datos.duracion);
                break;
        }
    }

    private activarVisionCondor(duracion: number): void {
        if (!this.puzzle?.gameCanvas) return;

        this.puzzle.gameCanvas.style.display = 'block';
        this.puzzle.gameCanvas.style.opacity = '0.8';
        this.puzzle.gameCanvas.style.zIndex = '1000';

        setTimeout(() => {
            if (this.puzzle?.gameCanvas) {
                this.puzzle.gameCanvas.style.display = 'none';
                this.puzzle.gameCanvas.style.opacity = '1';
                this.puzzle.gameCanvas.style.zIndex = '500';
            }
        }, duracion * 1000);
    }

    private activarTiempoPachamama(duracion: number): void {
        this.detenerContador();

        setTimeout(() => {
            if (this.isPlaying && !this.isCompleted) {
                this.iniciarContadorInverso();
            }
        }, duracion * 1000);
    }

    private activarSabiduriaAmawta(): void {
        if (!this.puzzle || !this.puzzle.polyPieces || this.puzzle.polyPieces.length <= 1) {
            console.log('⚠️ Puzzle no válido para Sabiduría Amawta');
            return;
        }

        // Buscar la mejor pieza para auto-colocar
        let mejorPieza: any = null;
        let menorDistancia = Infinity;

        this.puzzle.polyPieces.forEach((pp: any) => {
            // Solo piezas individuales sin rotación
            if (pp.pieces.length === 1 && pp.rot === 0) {
                // Calcular posición correcta de esta pieza
                const posicionCorrecta = {
                    x: this.puzzle!.offsx + (pp.pckxmin - 0.5) * this.puzzle!.scalex,
                    y: this.puzzle!.offsy + (pp.pckymin - 0.5) * this.puzzle!.scaley
                };

                // Calcular distancia actual a la posición correcta
                const distancia = Math.hypot(
                    pp.x - posicionCorrecta.x,
                    pp.y - posicionCorrecta.y
                );

                // Ignorar piezas que ya están muy cerca (ya colocadas)
                if (distancia > 10 && distancia < menorDistancia) {
                    menorDistancia = distancia;
                    mejorPieza = pp;
                }
            }
        });

        if (!mejorPieza) {
            console.log('⚠️ No hay piezas disponibles para auto-colocar');
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin piezas',
                detail: 'No hay piezas sueltas para colocar'
            });
            return;
        }

        console.log('🎯 Auto-colocando pieza:', mejorPieza.pieces[0].kx, mejorPieza.pieces[0].ky);

        // ⬇️ CALCULAR LA POSICIÓN EXACTA USANDO moveToInitialPlace
        // Esta es la posición donde debería estar la pieza
        const posicionFinal = {
            x: this.puzzle.offsx + (mejorPieza.pckxmin - 0.5) * this.puzzle.scalex,
            y: this.puzzle.offsy + (mejorPieza.pckymin - 0.5) * this.puzzle.scaley
        };

        console.log('📍 Posición actual:', mejorPieza.x, mejorPieza.y);
        console.log('📍 Posición destino:', posicionFinal.x, posicionFinal.y);
        console.log('📏 Distancia a recorrer:', Math.hypot(mejorPieza.x - posicionFinal.x, mejorPieza.y - posicionFinal.y));

        // Agregar clase de animación
        mejorPieza.canvas.classList.add('moving');
        mejorPieza.selected = true;
        mejorPieza.drawImage(true); // Resaltar con efecto dorado

        // PASO 1: Animar el movimiento
        const duracionAnimacion = 1200; // ms
        const pasos = 50;
        const intervalo = duracionAnimacion / pasos;

        const posInicial = { x: mejorPieza.x, y: mejorPieza.y };
        let pasoActual = 0;

        const intervaloId = setInterval(() => {
            pasoActual++;
            const progreso = pasoActual / pasos;

            // Interpolación suave (ease-in-out)
            const t = progreso < 0.5
                ? 2 * progreso * progreso
                : -1 + (4 - 2 * progreso) * progreso;

            // Calcular nueva posición
            const nuevaX = posInicial.x + (posicionFinal.x - posInicial.x) * t;
            const nuevaY = posInicial.y + (posicionFinal.y - posInicial.y) * t;

            // Mover la pieza
            mejorPieza.moveTo(nuevaX, nuevaY);

            if (pasoActual >= pasos) {
                clearInterval(intervaloId);

                // PASO 2: Asegurar posición EXACTA usando moveToInitialPlace
                console.log('✅ Animación completada, colocando en posición exacta...');
                mejorPieza.moveToInitialPlace(); // ⬅️ Esto asegura la posición correcta

                mejorPieza.canvas.classList.remove('moving');

                console.log('📍 Posición final real:', mejorPieza.x, mejorPieza.y);

                // PASO 3: Forzar el merge con búsqueda agresiva
                setTimeout(() => {
                    this.forzarMergePiezaAgresivo(mejorPieza);
                }, 200);
            }
        }, intervalo);
    }

// ⬇️ VERSIÓN MEJORADA: Búsqueda más agresiva de merge
    private forzarMergePiezaAgresivo(pieza: any): void {
        if (!this.puzzle) return;

        console.log('🔍 Buscando merge para pieza en:', pieza.pieces[0].kx, pieza.pieces[0].ky);
        console.log('📊 Total de polyPieces:', this.puzzle.polyPieces.length);

        let mergeRealizado = false;
        let intentos = 0;

        // Intentar múltiples veces con diferentes umbrales
        const umbrales = [
            this.puzzle.dConnect,              // Umbral normal
            this.puzzle.dConnect * 1.5,        // 50% más grande
            this.puzzle.dConnect * 2,          // El doble
            this.puzzle.scalex                 // Tamaño de una pieza completa
        ];

        for (const umbral of umbrales) {
            if (mergeRealizado) break;

            console.log(`   🔍 Intento ${++intentos} con umbral:`, umbral.toFixed(2));

            for (let i = this.puzzle.polyPieces.length - 1; i >= 0; i--) {
                const otraPieza = this.puzzle.polyPieces[i];

                if (otraPieza === pieza) continue;

                // Método 1: ifNear (verifica adyacencia lógica)
                if (pieza.ifNear(otraPieza)) {
                    console.log('   ✅ Piezas adyacentes por ifNear!');
                    this.realizarMerge(pieza, otraPieza);
                    mergeRealizado = true;
                    break;
                }

                // Método 2: Verificar cada pieza individual dentro de los polypieces
                for (const p1 of pieza.pieces) {
                    for (const p2 of otraPieza.pieces) {
                        // Verificar si son adyacentes en la grilla
                        const esAdyacente =
                            (p1.kx === p2.kx && Math.abs(p1.ky - p2.ky) === 1) || // Arriba/abajo
                            (p1.ky === p2.ky && Math.abs(p1.kx - p2.kx) === 1);   // Izq/der

                        if (esAdyacente) {
                            // Calcular distancia física entre los centros
                            const org1 = pieza.getOrgP();
                            const org2 = otraPieza.getOrgP();
                            const dist = Math.hypot(org1.x - org2.x, org1.y - org2.y);

                            console.log(`   📏 Piezas adyacentes en grilla (${p1.kx},${p1.ky}) <-> (${p2.kx},${p2.ky}), distancia: ${dist.toFixed(2)}`);

                            if (dist < umbral) {
                                console.log('   ✅ Merge por adyacencia + distancia!');
                                this.realizarMerge(pieza, otraPieza);
                                mergeRealizado = true;
                                break;
                            }
                        }
                    }
                    if (mergeRealizado) break;
                }
                if (mergeRealizado) break;
            }
        }

        if (!mergeRealizado) {
            console.log('⚠️ No se pudo hacer merge automático');
            console.log('💡 Sugerencia: La pieza está colocada, intenta moverla manualmente un poco');

            // Resaltar la pieza para que el usuario sepa dónde está
            pieza.selected = true;
            pieza.drawImage(true);

            setTimeout(() => {
                pieza.selected = false;
                pieza.drawImage();
            }, 2000);

            this.messageService.add({
                severity: 'info',
                summary: '✨ Pieza colocada',
                detail: 'La pieza está en su posición. Tócala para conectarla.',
                life: 4000
            });
        }

        // Verificar victoria
        this.checkWin();
    }

// ⬇️ MÉTODO AUXILIAR: Realizar merge
    private realizarMerge(pieza1: any, pieza2: any): void {
        if (!this.puzzle) return;

        console.log('🔗 Realizando merge...');

        // El polypiece más grande absorbe al más pequeño
        if (pieza2.pieces.length > pieza1.pieces.length) {
            pieza2.selected = true;
            pieza2.drawImage(true);
            pieza2.merge(pieza1);

            setTimeout(() => {
                pieza2.selected = false;
                pieza2.drawImage();
            }, 500);
        } else {
            pieza1.selected = true;
            pieza1.drawImage(true);
            pieza1.merge(pieza2);

            setTimeout(() => {
                pieza1.selected = false;
                pieza1.drawImage();
            }, 500);
        }

        this.puzzle.evaluateZIndex();

        this.messageService.add({
            severity: 'success',
            summary: '✨ ¡Pieza conectada!',
            detail: 'La Sabiduría del Amawta guió la pieza',
            life: 3000
        });

        console.log('✅ Merge completado! Piezas restantes:', this.puzzle.polyPieces.length);
    }

// Función auxiliar para forzar el merge de una pieza
    private forzarMergePieza(pieza: any): void {
        if (!this.puzzle) return;

        // Buscar piezas vecinas para merge
        this.puzzle.polyPieces.forEach((otraPieza: any) => {
            if (otraPieza !== pieza) {
                // Calcular distancia entre piezas
                const distancia = Math.hypot(
                    pieza.x - otraPieza.x,
                    pieza.y - otraPieza.y
                );

                // Si están lo suficientemente cerca, intentar merge
                if (distancia < this.puzzle!.scalex * 1.5) {
                    pieza.merge(otraPieza);
                    this.checkWin();
                }
            }
        });

        // Verificar si el puzzle está completo
        this.verificarPuzzleCompleto();
    }

// Verificar si el puzzle está completo
    private verificarPuzzleCompleto(): void {
        if (!this.puzzle) return;

        if (this.puzzle.polyPieces.length === 1) {
            console.log('🎉 ¡Puzzle completado!');
            this.checkWin();
        }
    }

    private intentarMergeAutomatico(pieza: any): void {
        if (!this.puzzle) return;

        for (let k = this.puzzle.polyPieces.length - 1; k >= 0; --k) {
            const otraPieza = this.puzzle.polyPieces[k];
            if (otraPieza === pieza) continue;

            if (pieza.ifNear(otraPieza)) {
                if (otraPieza.pieces.length > pieza.pieces.length) {
                    otraPieza.merge(pieza);
                } else {
                    pieza.merge(otraPieza);
                }
                this.puzzle.evaluateZIndex();
                this.checkWin();
                break;
            }
        }
    }

    private activarBendicionSol(multiplicador: number, duracion: number): void {
        this.powerUpActivo = PowerUpPuzzle.BENDICION_SOL;
        this.tiempoPowerUpActivo = duracion;

        const interval = setInterval(() => {
            this.tiempoPowerUpActivo--;

            if (this.tiempoPowerUpActivo <= 0) {
                clearInterval(interval);
                this.powerUpActivo = null;
                this.messageService.add({
                    severity: 'info',
                    summary: '⏱️ Power-Up Finalizado',
                    detail: 'Bendición del Sol ha terminado',
                    life: 2000
                });
            }
        }, 1000);
    }

    // ==================== MÉTODOS PUZZLE ====================

    initializePuzzle(): void {
        if (!this.puzzleContainer || !this.puzzleContainer.nativeElement) {
            console.error('❌ Container no disponible');
            return;
        }

        const container = this.puzzleContainer.nativeElement;
        container.innerHTML = '';

        this.puzzle = new Puzzle(container);
        this.puzzle.nbPieces = this.gridSize * this.gridSize;

        container.addEventListener('mousedown', this.onMouseDown.bind(this));
        container.addEventListener('mouseup', this.onMouseUp.bind(this));
        container.addEventListener('mousemove', this.onMouseMove.bind(this));
        container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        container.addEventListener('touchend', this.onTouchEnd.bind(this));
        container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });

        console.log('✅ Puzzle inicializado');
    }

    loadImage(imageUrl: string): void {
        if (!this.puzzle) {
            console.error('❌ Puzzle no inicializado');
            return;
        }

        console.log('🖼️ Cargando imagen:', imageUrl);

        this.puzzle.srcImage = new Image();
        this.puzzle.srcImage.crossOrigin = 'anonymous';

        this.puzzle.srcImage.onload = () => {
            console.log('✅ Imagen cargada:', this.puzzle!.srcImage.naturalWidth, 'x', this.puzzle!.srcImage.naturalHeight);
            this.puzzle!.imageLoaded = true;
            this.setupPuzzle();
        };

        this.puzzle.srcImage.onerror = (error) => {
            console.error('❌ Error al cargar imagen:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la imagen'
            });
        };

        this.puzzle.srcImage.src = imageUrl;
    }

    setupPuzzle(): void {
        if (!this.puzzle) return;

        this.puzzle.create();
        this.puzzle.scale();

        this.puzzle.polyPieces.forEach(pp => {
            pp.drawImage();
            pp.moveToInitialPlace();
        });

        this.puzzle.gameCanvas.style.top = this.puzzle.offsy + 'px';
        this.puzzle.gameCanvas.style.left = this.puzzle.offsx + 'px';
        this.puzzle.gameCanvas.style.display = 'block';

        console.log('✅ Puzzle configurado');
    }

    changeGridSize(size: number): void {
        this.gridSize = size;

        if (this.imagenActual) {
            this.resetGame();
            setTimeout(() => {
                this.initializePuzzle();
                this.loadImage(this.imagenActual!.imagenUrl);
            }, 100);
        }
    }

    resetGame(): void {
        this.detenerContador();
        this.detenerContadorDesafio();
        this.moves = 0;
        this.tiempoRestante = 0;
        this.tiempoLimite = 0;
        this.isPlaying = false;
        this.isCompleted = false;
        this.moving = {};
        this.partidaId = null;
        this.movimientosDesdeUltimoDesafio = 0;
        this.powerUpsDisponibles = [];
        this.powerUpActivo = null;

        if (this.puzzle?.polyPieces) {
            this.puzzle.polyPieces.forEach(pp => {
                if (pp.canvas && pp.canvas.parentNode) {
                    pp.canvas.parentNode.removeChild(pp.canvas);
                }
            });
        }

        if (this.puzzleContainer?.nativeElement) {
            this.puzzleContainer.nativeElement.innerHTML = '';
        }

        this.puzzle = undefined;
    }

    detenerContador(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // ==================== EVENTOS MOUSE/TOUCH ====================

    onMouseDown(event: MouseEvent): void {
        if (!this.isPlaying || event.button !== 0 || !this.puzzle) return;
        event.preventDefault();

        const rect = this.puzzleContainer.nativeElement.getBoundingClientRect();
        const position = {
            x: event.clientX - rect.x,
            y: event.clientY - rect.y
        };

        this.handleTouchStart(position, Date.now());
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.moving.pp || !this.puzzle) return;
        event.preventDefault();

        const rect = this.puzzleContainer.nativeElement.getBoundingClientRect();
        const position = {
            x: event.clientX - rect.x,
            y: event.clientY - rect.y
        };

        this.moving.pp.moveTo(
            position.x - this.moving.xMouseInit + this.moving.ppXInit,
            position.y - this.moving.yMouseInit + this.moving.ppYInit
        );
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.moving.pp || event.button !== 0 || !this.puzzle) return;
        event.preventDefault();
        this.handleTouchEnd(Date.now());
    }

    onTouchStart(event: TouchEvent): void {
        if (!this.isPlaying || event.touches.length !== 1 || !this.puzzle) return;
        event.preventDefault();

        const touch = event.touches[0];
        const rect = this.puzzleContainer.nativeElement.getBoundingClientRect();
        const position = {
            x: touch.clientX - rect.x,
            y: touch.clientY - rect.y
        };

        this.handleTouchStart(position, Date.now());
    }

    onTouchMove(event: TouchEvent): void {
        if (!this.moving.pp || event.touches.length !== 1 || !this.puzzle) return;
        event.preventDefault();

        const touch = event.touches[0];
        const rect = this.puzzleContainer.nativeElement.getBoundingClientRect();
        const position = {
            x: touch.clientX - rect.x,
            y: touch.clientY - rect.y
        };

        this.moving.pp.moveTo(
            position.x - this.moving.xMouseInit + this.moving.ppXInit,
            position.y - this.moving.yMouseInit + this.moving.ppYInit
        );
    }

    onTouchEnd(event: TouchEvent): void {
        if (!this.moving.pp || !this.puzzle) return;
        this.handleTouchEnd(Date.now());
    }

    handleTouchStart(position: { x: number, y: number }, tStamp: number): void {
        if (!this.puzzle) return;

        const puzzle = this.puzzle;

        this.moving = {
            xMouseInit: position.x,
            yMouseInit: position.y
        };

        for (let k = puzzle.polyPieces.length - 1; k >= 0; --k) {
            const pp = puzzle.polyPieces[k];

            if (pp.isPointInPath(position)) {
                pp.selected = true;
                pp.drawImage();
                this.moving.pp = pp;
                this.moving.ppXInit = pp.x;
                this.moving.ppYInit = pp.y;
                this.moving.tInit = tStamp;

                puzzle.polyPieces.splice(k, 1);
                puzzle.polyPieces.push(pp);
                pp.canvas.style.zIndex = puzzle.zIndexSup.toString();
                return;
            }
        }
    }

    handleTouchEnd(tStamp: number): void {
        if (!this.moving.pp || !this.puzzle) return;

        const puzzle = this.puzzle;

        this.moving.pp.selected = false;
        this.moving.pp.drawImage();
        this.moves++;

        // ⬇️ Verificar si debe aparecer desafío
        this.verificarDesafio();

        let merged = false;
        let doneSomething: boolean;

        do {
            doneSomething = false;
            for (let k = puzzle.polyPieces.length - 1; k >= 0; --k) {
                const pp = puzzle.polyPieces[k];

                if (pp === this.moving.pp) continue;

                if (this.moving.pp.ifNear(pp)) {
                    merged = true;
                    if (pp.pieces.length > this.moving.pp.pieces.length) {
                        pp.merge(this.moving.pp);
                        this.moving.pp = pp;
                    } else {
                        this.moving.pp.merge(pp);
                    }
                    doneSomething = true;
                    break;
                }
            }
        } while (doneSomething);

        puzzle.evaluateZIndex();

        if (merged) {
            this.moving.pp.selected = true;
            this.moving.pp.drawImage(true);
            setTimeout(() => {
                if (this.moving.pp) {
                    this.moving.pp.selected = false;
                    this.moving.pp.drawImage();
                }
                this.checkWin();
            }, 500);
        } else {
            this.checkWin();
        }

        this.moving = {};
    }

    ngOnDestroy(): void {
        this.detenerContador();
        this.detenerContadorDesafio();
        this.resetGame();
    }

}
