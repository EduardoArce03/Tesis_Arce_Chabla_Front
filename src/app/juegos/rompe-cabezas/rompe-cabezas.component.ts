import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';

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
  imports: [CommonModule, ButtonModule, CardModule, DialogModule],
  templateUrl: './rompe-cabezas.component.html',
  styleUrls: ['./rompe-cabezas.component.scss']
})
export class RompeCabezasComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('puzzleContainer', { static: false }) puzzleContainer!: ElementRef<HTMLDivElement>;

  gridSize: number = 3;
  moves: number = 0;
  tiempoTranscurrido: number = 0;
  timerInterval: any;
  isPlaying: boolean = false;
  isCompleted: boolean = false;
  showMenu: boolean = false;

  private puzzle!: Puzzle;
  private moving: any = {};
  private mouseInitX: number = 0;
  private mouseInitY: number = 0;

  imagenUrl: string = 'https://picsum.photos/800/600?random=1';

  imagenesDisponibles = [
    { url: 'https://picsum.photos/800/600?random=1', label: 'Paisaje 1' },
    { url: 'https://picsum.photos/800/600?random=2', label: 'Paisaje 2' },
    { url: 'https://picsum.photos/800/600?random=3', label: 'Paisaje 3' },
    { url: 'https://picsum.photos/800/600?random=4', label: 'Paisaje 4' }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    this.initializePuzzle();
  }

  initializePuzzle() {
    const container = this.puzzleContainer.nativeElement;
    this.puzzle = new Puzzle(container);
    this.puzzle.nbPieces = this.gridSize * this.gridSize;

    // Event listeners
    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mouseup', this.onMouseUp.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    container.addEventListener('touchend', this.onTouchEnd.bind(this));
    container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });

    this.loadImage();
  }

  loadImage() {
  console.log('🖼️ Cargando imagen:', this.imagenUrl);
  
  this.puzzle.srcImage = new Image();
  
  // Solo usar crossOrigin para URLs externas (que empiezan con http)
  if (this.imagenUrl.startsWith('http')) {
    this.puzzle.srcImage.crossOrigin = 'Anonymous';
    console.log('🌐 Usando CORS para URL externa');
  } else {
    console.log('📁 Cargando imagen local');
  }
  
  this.puzzle.srcImage.onload = () => {
    console.log('✅ Imagen cargada exitosamente');
    console.log('📐 Dimensiones:', this.puzzle.srcImage.naturalWidth, 'x', this.puzzle.srcImage.naturalHeight);
    this.puzzle.imageLoaded = true;
    
    // Verificar que la imagen no esté vacía
    if (this.puzzle.srcImage.naturalWidth === 0 || this.puzzle.srcImage.naturalHeight === 0) {
      console.error('❌ La imagen está vacía o corrupta');
      return;
    }
    
    this.setupPuzzle();
  };
  
  this.puzzle.srcImage.onerror = (error) => {
    console.error('❌ Error al cargar imagen:', error);
    console.error('URL intentada:', this.imagenUrl);
  };
  
  // Importante: establecer src al final
  this.puzzle.srcImage.src = this.imagenUrl;
}

  setupPuzzle() {
    this.puzzle.create();
    this.puzzle.scale();
    
    this.puzzle.polyPieces.forEach(pp => {
      pp.drawImage();
      pp.moveToInitialPlace();
    });

    this.puzzle.gameCanvas.style.top = this.puzzle.offsy + 'px';
    this.puzzle.gameCanvas.style.left = this.puzzle.offsx + 'px';
    this.puzzle.gameCanvas.style.display = 'block';
  }

  iniciarJuego() {
    this.puzzle.gameCanvas.style.display = 'none';
    
    this.puzzle.polyPieces.forEach(pp => {
      pp.canvas.classList.add('moving');
    });

    setTimeout(() => {
      this.puzzle.optimInitial();
      
      setTimeout(() => {
        this.puzzle.polyPieces.forEach(pp => {
          pp.canvas.classList.remove('moving');
        });
        
        this.moves = 0;
        this.tiempoTranscurrido = 0;
        this.isPlaying = true;
        this.isCompleted = false;
        this.iniciarContador();
      }, 1200);
    }, 0);
  }

  onMouseDown(event: MouseEvent) {
    if (!this.isPlaying || event.button !== 0) return;
    event.preventDefault();

    const rect = this.puzzleContainer.nativeElement.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.x,
      y: event.clientY - rect.y
    };

    this.handleTouchStart(position, Date.now());
  }

  onMouseMove(event: MouseEvent) {
    if (!this.moving.pp) return;
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

  onMouseUp(event: MouseEvent) {
    if (!this.moving.pp || event.button !== 0) return;
    event.preventDefault();
    this.handleTouchEnd(Date.now());
  }

  onTouchStart(event: TouchEvent) {
    if (!this.isPlaying || event.touches.length !== 1) return;
    event.preventDefault();

    const touch = event.touches[0];
    const rect = this.puzzleContainer.nativeElement.getBoundingClientRect();
    const position = {
      x: touch.clientX - rect.x,
      y: touch.clientY - rect.y
    };

    this.handleTouchStart(position, Date.now());
  }

  onTouchMove(event: TouchEvent) {
    if (!this.moving.pp || event.touches.length !== 1) return;
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

  onTouchEnd(event: TouchEvent) {
    if (!this.moving.pp) return;
    this.handleTouchEnd(Date.now());
  }

  handleTouchStart(position: { x: number, y: number }, tStamp: number) {
    this.moving = {
      xMouseInit: position.x,
      yMouseInit: position.y
    };

    for (let k = this.puzzle.polyPieces.length - 1; k >= 0; --k) {
      const pp = this.puzzle.polyPieces[k];
      
      if (pp.isPointInPath(position)) {
        pp.selected = true;
        pp.drawImage();
        this.moving.pp = pp;
        this.moving.ppXInit = pp.x;
        this.moving.ppYInit = pp.y;
        this.moving.tInit = tStamp;

        this.puzzle.polyPieces.splice(k, 1);
        this.puzzle.polyPieces.push(pp);
        pp.canvas.style.zIndex = this.puzzle.zIndexSup.toString();
        return;
      }
    }
  }

  handleTouchEnd(tStamp: number) {
    if (!this.moving.pp) return;

    this.moving.pp.selected = false;
    this.moving.pp.drawImage();
    this.moves++;

    let merged = false;
    let doneSomething: boolean;

    do {
      doneSomething = false;
      for (let k = this.puzzle.polyPieces.length - 1; k >= 0; --k) {
        const pp = this.puzzle.polyPieces[k];
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

    this.puzzle.evaluateZIndex();

    if (merged) {
      this.moving.pp.selected = true;
      this.moving.pp.drawImage(true);
      setTimeout(() => {
        this.moving.pp.selected = false;
        this.moving.pp.drawImage();
        this.checkWin();
      }, 500);
    } else {
      this.checkWin();
    }

    this.moving = {};
  }

  checkWin() {
    if (this.puzzle.polyPieces.length === 1 && this.puzzle.polyPieces[0].rot === 0) {
      this.isCompleted = true;
      this.isPlaying = false;
      this.detenerContador();
    }
  }

  iniciarContador() {
    this.detenerContador();
    this.timerInterval = setInterval(() => {
      this.tiempoTranscurrido++;
    }, 1000);
  }

  detenerContador() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTiime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  changeGridSize(size: number) {
    this.gridSize = size;
    this.resetGame();
  }

  resetGame() {
    this.detenerContador();
    this.moves = 0;
    this.tiempoTranscurrido = 0;
    this.isPlaying = false;
    this.isCompleted = false;
    this.moving = {};
    
    // Limpiar piezas existentes
    this.puzzle.polyPieces.forEach(pp => {
      if (pp.canvas && pp.canvas.parentNode) {
        pp.canvas.parentNode.removeChild(pp.canvas);
      }
    });
    
    this.puzzle.nbPieces = this.gridSize * this.gridSize;
    this.loadImage();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  changeImage(url: string) {
    this.imagenUrl = url;
    this.resetGame();
  }

  ngOnDestroy() {
    this.detenerContador();
  }
}