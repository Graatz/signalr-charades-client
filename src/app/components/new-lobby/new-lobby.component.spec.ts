import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLobbyComponent } from './new-lobby.component';

describe('NewLobbyComponent', () => {
  let component: NewLobbyComponent;
  let fixture: ComponentFixture<NewLobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewLobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
