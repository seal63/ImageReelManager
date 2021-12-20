import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReelPlayerComponent } from './reel-player.component';

describe('ReelPlayerComponent', () => {
  let component: ReelPlayerComponent;
  let fixture: ComponentFixture<ReelPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReelPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReelPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
