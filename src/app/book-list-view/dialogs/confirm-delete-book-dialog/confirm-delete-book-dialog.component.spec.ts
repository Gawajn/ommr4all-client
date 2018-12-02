import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteBookDialogComponent } from './confirm-delete-book-dialog.component';

describe('ConfirmDeleteBookDialogComponent', () => {
  let component: ConfirmDeleteBookDialogComponent;
  let fixture: ComponentFixture<ConfirmDeleteBookDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteBookDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteBookDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
