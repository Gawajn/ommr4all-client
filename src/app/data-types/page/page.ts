import {Point, PolyLine, Rect} from '../../geometry/geometry';
import {StaffLine} from './music-region/staff-line';
import {BlockType} from './definitions';
import {Region} from './region';
import {ReadingOrder} from './reading-order';
import {Annotations} from './annotations';
import {Block} from './block';
import {PageLine} from './pageLine';
import {IdType} from './id-generator';

export class Page extends Region {
  private _readingOrder = new ReadingOrder(this);
  private _annotations = new Annotations(this);

  constructor(
    public imageFilename = '',
    public imageHeight = 0,
    public imageWidth = 0,
  ) {
    super(IdType.Page);
  }

  static fromJson(json) {
    const page = new Page(
      json.imageFilename,
      json.imageHeight,
      json.imageWidth,
    );
    json.textRegions.forEach(t => Block.textBlockFromJson(page, t));
    json.musicRegions.forEach(m => Block.musicBlockFromJson(page, m));
    page._readingOrder = ReadingOrder.fromJson(json.readingOrder, page);
    page._annotations = Annotations.fromJson(json.annotations, page);
    page._readingOrder._updateReadingOrder();
    page._resolveCrossRefs();

    return page;
  }

  toJson() {
    return {
      textRegions: this.textRegions.map(t => t.toJson()),
      musicRegions: this.musicRegions.map(m => m.toJson()),
      imageFilename: this.imageFilename,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      readingOrder: this._readingOrder.toJson(),
      annotations: this._annotations.toJson(),
    };
  }

  get readingOrder() { return this._readingOrder; }
  get annotations() { return this._annotations; }
  get blocks() { return this._children as Array<Block>; }
  get textRegions() { return this.blocks.filter(b => b.type !== BlockType.Music); }
  get musicRegions() { return this.blocks.filter(b => b.type === BlockType.Music); }

  clean() {
    this.blocks.forEach(b => b.lines.forEach(l => l.clean()));
    this.blocks.forEach(b => b.lines.filter(l => l.isEmpty()).forEach(l => l.detachFromParent()));
    this.blocks.filter(b => b.isEmpty()).forEach(b => b.detachFromParent());
  }

  textLineById(id: string): PageLine {
    for (const tr of this.textRegions) {
      for (const tl of tr.textLines) {
        if (tl.id === id) { return tl as PageLine; }
      }
    }
    return null;
  }

  _resolveCrossRefs() {
    this.blocks.forEach(b => b._resolveCrossRefs(this));
  }

  addNewMusicRegion(): Block {
    return Block.create(this, BlockType.Music);
  }

  musicRegionById(id: string): Block {
    return this.musicRegions.find(r => r.id === id);
  }

  musicLineById(id: string): PageLine {
    for (const mr of this.musicRegions) {
      const ml = mr.musicLines.find(l => l.id === id);
      if (ml) { return ml; }
    }
    return null;
  }

  textRegionById(id: string): Block {
    return this.textRegions.find(r => r.id === id);
  }

  addTextRegion(type: BlockType): Block {
    return Block.create(this, type);
  }

  static closestRegionOfListToPoint(p: Point, regions: Array<Region>) {   // tslint:disable-line member-ordering
    if (regions.length === 0) { return null; }

    let closestD = 1e8;
    let closestR = [];

    regions.forEach(mr => {
      if (mr.AABB.tl().y > p.y) {
        const newD = mr.AABB.tl().y - p.y;
        if (newD === closestD) {
          closestR.push(mr);
        } else if (newD < closestD) {
          closestR = [mr];
          closestD = newD;
        }
      } else if (mr.AABB.bl().y < p.y) {
        const newD = p.y - mr.AABB.bl().y;
        if (newD === closestD) {
          closestR.push(mr);
        } else if (newD < closestD) {
          closestR = [mr];
          closestD = newD;
        }
      } else {
        if (0 === closestD) {
          closestR.push(mr);
        } else {
          closestR = [mr];
          closestD = 0;
        }
      }
    });
    if (closestR.length === 0) { return null; }

    let bestR: Region = closestR[0];
    let bestDistSqr = bestR.distanceSqrToPoint(p);
    for (let i = 1; i < closestR.length; i++) {
      const r = closestR[i];
      const d = r.distanceSqrToPoint(p);
      if (d < bestDistSqr) {
        bestDistSqr = d;
        bestR = r;
      }
    }
    return bestR;
  }

  closestMusicRegionToPoint(p: Point): Block {
    return Page.closestRegionOfListToPoint(p, this.musicRegions) as Block;
  }

  closestRegionToPoint(p: Point): Region {
    return Page.closestRegionOfListToPoint(p, this._children);
  }

  listLinesInRect(rect: Rect): StaffLine[] {
    const outLines: StaffLine[] = [];
    for (const music of this.musicRegions) {
      music.musicLines.forEach(ml => {
        if (ml.AABB.intersetcsWithRect(rect)) {
          for (const staffLine of ml.staffLines) {
            if (staffLine.AABB.intersetcsWithRect(rect)) {
              if (staffLine.coords.intersectsWithRect(rect)) {
                outLines.push(staffLine);
              }
            }
          }
        }
      });
    }
    return outLines;
  }

  staffLinePointsInRect(rect: Rect): {points: Set<Point>, staffLines: Set<StaffLine>} {
    const points = new Set<Point>();
    const staffLines = new Set<StaffLine>();
    for (const music of this.musicRegions) {
      music.musicLines.forEach(ml => {
        if (ml.AABB.intersetcsWithRect(rect)) {
          for (const staffLine of ml.staffLines) {
            if (staffLine.AABB.intersetcsWithRect(rect)) {
              for (const point of staffLine.coords.points) {
                if (rect.containsPoint(point)) {
                  points.add(point);
                  staffLines.add(staffLine);
                }
              }
            }
          }
        }
      });
    }
    return {points: points, staffLines: staffLines};
  }

  regionByCoords(coords: PolyLine): Region {
    if (!coords) { return null; }
    for (const b of this._children) {
      const r = b.regionByCoords(coords);
      if (r) { return r; }
    }
    return null;
  }

  staffLineByCoords(coords: PolyLine): StaffLine {
    if (!coords) { return null; }
    for (const mr of this.musicRegions) {
      for (const ml of mr.musicLines) {
        const sl = ml.staffLines.find(p => p.coords === coords);
        if (sl) { return sl; }
      }
    }
    return null;
  }

  polylineDifference(polyLine: PolyLine): PolyLine {
    const pl = polyLine.copy();
    const rect = pl.aabb();
    this._children.forEach(b => {
      if (b.AABB.intersetcsWithRect(rect)) {
        b.children.forEach(l => {
          if (l.AABB.intersetcsWithRect(rect)) {
            if (l.coords !== polyLine) {
              pl.moveRef(pl.differenceSingle(l.coords));
            }
          }
        });
      }
    });
    return pl;
  }
}
