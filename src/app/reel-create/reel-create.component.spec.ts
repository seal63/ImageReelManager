import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReelCreateComponent } from './reel-create.component';

describe('ReelCreateComponent', () => {
  let component: ReelCreateComponent;
  let fixture: ComponentFixture<ReelCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReelCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReelCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
