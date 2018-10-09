import {TextRegion, TextRegionType} from './text-region';
import {MusicRegion} from './music-region/music-region';
import {Syllable} from './syllable';
import {Point, PolyLine, Rect} from '../../geometry/geometry';
import {StaffEquiv} from './music-region/staff-equiv';
import {MusicLine} from './music-region/staff-line';
import {EmptyMusicRegionDefinition, StaffEquivIndex} from './definitions';

export class Page {
  constructor(
    public textRegions: Array<TextRegion> = [],
    public musicRegions: Array<MusicRegion> = [],
    public imageFilename = '',
    public imageHeight = 0,
    public imageWidth = 0
  ) {}

  static fromJson(json) {
    const page = new Page(
      json.textRegions.map(t => TextRegion.fromJson(t)),
      json.musicRegions.map(m => MusicRegion.fromJson(m)),
      json.imageFilename,
      json.imageHeight,
      json.imageWidth,
    );
    page._resolveCrossRefs();
    return page;
  }

  syllableById(id): Syllable {
    for (const t of this.textRegions) {
      const r = t.syllableById(id);
      if (r) { return r; }
    }
    return null;
  }

  _resolveCrossRefs() {
    this.textRegions.forEach(t => t._resolveCrossRefs(this));
    this.musicRegions.forEach(m => m._resolveCrossRefs(this));
  }

  toJson() {
    return {
      textRegions: this.textRegions.map(t => t.toJson()),
      musicRegions: this.musicRegions.map(m => m.toJson()),
      imageFilename: this.imageFilename,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
    };
  }

  clean() {
    this.cleanMusicRegions();
  }

  cleanMusicRegions(flags = EmptyMusicRegionDefinition.Default) {
    this.musicRegions.forEach(m => m.clean(flags));
    this.musicRegions = this.musicRegions.filter(m => !m.isEmpty(flags));
  }

  addNewMusicRegion(): MusicRegion {
    const m = new MusicRegion();
    this.musicRegions.push(m);
    return m;
  }

  addTextRegion(type: TextRegionType): TextRegion {
    const t = new TextRegion(type);
    this.textRegions.push(t);
    return t;
  }

  removeCoords(coords: PolyLine) {
    for (const mr of this.musicRegions) {
      if (mr.coords === coords) {
        this.musicRegions.splice(this.musicRegions.indexOf(mr), 1);
        return;
      }
      for (const se of mr.staffsEquivs) {
        if (se.coords === coords) {
          mr.staffsEquivs.splice(mr.staffsEquivs.indexOf(se), 1);
          return;
        }
      }
    }

    for (const tr of this.textRegions) {
      if (tr.coords === coords) {
        console.log(this.textRegions.indexOf(tr));
        this.textRegions.splice(this.textRegions.indexOf(tr), 1);
        return;
      }
      for (const tl of tr.textLines) {
        if (tl.coords === coords) {
          tr.textLines.splice(tr.textLines.indexOf(tl), 1);
          return;
        }
      }
    }

    console.warn('Cannot find polyline');
  }

  closestStaffEquivToPoint(p: Point, index = StaffEquivIndex.Default): StaffEquiv {
    if (this.musicRegions.length === 0) {
      return null;
    }
    let bestStaff = this.musicRegions[0].getOrCreateStaffEquiv(index);
    let bestDistSqr = bestStaff.distanceSqrToPoint(p);
    for (let i = 1; i < this.musicRegions.length; i++) {
      const staff = this.musicRegions[i].getOrCreateStaffEquiv(index);
      const d = staff.distanceSqrToPoint(p);
      if (d < bestDistSqr) {
        bestDistSqr = d;
        bestStaff = staff;
      }
    }
    if (bestDistSqr >= 10e8) {
      return null;
    }
    return bestStaff;
  }

  listLinesInRect(rect: Rect, index = StaffEquivIndex.Default): MusicLine[] {
    const outLines: MusicLine[] = [];
    for (const music of this.musicRegions) {
      const staff = music.getOrCreateStaffEquiv(index);
      if (staff.AABB.intersetcsWithRect(rect)) {
        for (const staffLine of staff.staffLines) {
          if (staffLine.AABB.intersetcsWithRect(rect)) {
            if (staffLine.coords.intersectsWithRect(rect)) {
              outLines.push(staffLine);
            }
          }
        }
      }
    }
    return outLines;
  }

  staffLinePointsInRect(rect: Rect, index = StaffEquivIndex.Default): Array<Point> {
    const points = [];
    for (const music of this.musicRegions) {
      const staff = music.getOrCreateStaffEquiv(index);
      if (staff.AABB.intersetcsWithRect(rect)) {
        for (const staffLine of staff.staffLines) {
          if (staffLine.AABB.intersetcsWithRect(rect)) {
            for (const point of staffLine.coords.points) {
              if (rect.containsPoint(point)) {
                points.push(point);
              }
            }
          }
        }
      }
    }
    return points;
  }

}