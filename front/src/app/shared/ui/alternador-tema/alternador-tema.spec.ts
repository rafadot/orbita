import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemaService } from '../../../core/tema/tema.service';
import { AlternadorTema } from './alternador-tema';

describe('AlternadorTema', () => {
  let fixture: ComponentFixture<AlternadorTema>;
  let temaService: TemaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlternadorTema],
    }).compileComponents();

    fixture = TestBed.createComponent(AlternadorTema);
    temaService = TestBed.inject(TemaService);
    fixture.nativeElement.getBoundingClientRect = () => ({
      left: 100,
      top: 50,
      width: 24,
      height: 24,
      right: 124,
      bottom: 74,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function botao(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('clique chama alternarTema com o centro do proprio elemento', () => {
    const espiao = vi.spyOn(temaService, 'alternarTema').mockImplementation(() => {});

    botao().click();

    expect(espiao).toHaveBeenCalledWith(112, 62);
  });

  it('liga o pulso no clique e desliga sozinho depois de 620ms', () => {
    vi.spyOn(temaService, 'alternarTema').mockImplementation(() => {});
    vi.useFakeTimers();

    botao().click();
    fixture.detectChanges();
    expect(fixture.componentInstance['pulsando']()).toBe(true);

    vi.advanceTimersByTime(619);
    expect(fixture.componentInstance['pulsando']()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(fixture.componentInstance['pulsando']()).toBe(false);
  });
});
