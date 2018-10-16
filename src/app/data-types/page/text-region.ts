import {PolyLine} from '../../geometry/geometry';
import {TextLine} from './text-line';
import {TextEquiv} from './text-equiv';
import {Page} from './page';
import {Syllable} from './syllable';
import {ɵisListLikeIterable} from '@angular/core';
import {Region} from './region';
import {TextEquivContainer, TextEquivIndex} from './definitions';

export enum TextRegionType {
  Paragraph = 0,
  Heading = 1,
  Lyrics = 2,
  DropCapital = 3,
}

export class TextRegion extends Region implements TextEquivContainer {
  public type = TextRegionType.Paragraph;
  public textEquivs: Array<TextEquiv> = [];

  static create(
    type = TextRegionType.Paragraph,
    coords = new PolyLine([]),
    textLines: Array<TextLine> = [],
    textEquivs: Array<TextEquiv> = [],
  ) {
    const tr = new TextRegion();
    tr.type = type;
    tr.coords = coords;
    textLines.forEach(tl => tr.attachChild(tl));
    tr.textEquivs = textEquivs;
    return tr;

  }
  private constructor() {
    super();
  }

  static fromJson(json) {
    const tr = TextRegion.create(
      json.type,
      PolyLine.fromString(json.coords),
      [],
      json.textEquivs.map(t => TextEquiv.fromJson(t)),
    );
    json.textLines.forEach(t => TextLine.fromJson(t, tr));

    return tr;
  }

  toJson() {
    return {
      type: this.type,
      coords: this.coords.toString(),
      textLines: this.textLines.map(t => t.toJson()),
      textEquivs: this.textEquivs.map(t => t.toJson()),
    };
  }

  getRegion() { return this; }
  get textLines(): Array<TextLine> { return this._children as Array<TextLine>; }

  _resolveCrossRefs(page: Page) {
  }

  cleanSyllables(): void {
    this.textLines.forEach(tl => tl.cleanSyllables());
  }

  createTextLine(): TextLine {
    const tl = TextLine.create(this);
    return tl;
  }

  getOrCreateTextEquiv(index: TextEquivIndex) {
    for (const te of this.textEquivs) {
      if (te.index === index) { return te; }
    }
    const t = new TextEquiv('', index);
    this.textEquivs.push(t);
    return t;
  }

  clean() {
    this.textEquivs = this.textEquivs.filter(te => te.content.length > 0);
    this.textLines.forEach(tl => {
      tl.textEquivs = tl.textEquivs.filter(te => te.content.length > 0);
      if (tl.isEmpty()) { tl.detachFromParent(); }
    });
  }

  isEmpty() {
    return this.textEquivs.length === 0 && this.textLines.length === 0 && this.AABB.area === 0;
  }
}
