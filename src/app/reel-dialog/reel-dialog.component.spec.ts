import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReelDialogComponent } from './reel-dialog.component';

describe('ReelDialogComponent', () => {
  let component: ReelDialogComponent;
  let fixture: ComponentFixture<ReelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReelDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
