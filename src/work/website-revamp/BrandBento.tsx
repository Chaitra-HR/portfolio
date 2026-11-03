import s from './BrandBento.module.css';

interface Photo {
  src: string;
  alt: string;
}

/* From the House of Alpha brand guide; `light` marks swatches that take dark text. */
const CORE = [
  { name: 'Primary', hex: '#3B2A23' },
  { name: 'Secondary', hex: '#6B4F3E' },
  { name: 'Accent', hex: '#D2A679', light: true },
  { name: 'Beige', hex: '#F6F1EB', light: true },
  { name: 'Light gray', hex: '#E5E1DC', light: true },
  { name: 'Off white', hex: '#FAF8F6', light: true },
];

const EXTENDED = [
  { name: 'Warm cream', hex: '#FFF4E5', light: true },
  { name: 'Peach', hex: '#F3CDB7', light: true },
  { name: 'Terracotta', hex: '#C46A4A' },
  { name: 'Sage', hex: '#A8B5A1', light: true },
  { name: 'Olive', hex: '#6F7A5E' },
  { name: 'Forest', hex: '#2E3D2F' },
  { name: 'Sky', hex: '#D6E6F2', light: true },
  { name: 'Muted blue', hex: '#4C6A87' },
  { name: 'Navy', hex: '#1F2D3D' },
  { name: 'Gold', hex: '#E2C28B', light: true },
  { name: 'Taupe', hex: '#8E8176' },
  { name: 'Charcoal', hex: '#333333' },
];

function Swatch({ name, hex, light }: { name: string; hex: string; light?: boolean }) {
  return (
    <li style={{ background: hex }} className={light ? s.onLight : undefined}>
      <span>{name}</span>
      <span>{hex}</span>
    </li>
  );
}

/**
 * The identity on one board, after the Augment presentation: a white frame holding two rows
 * with their own rhythm. Top: the cards, the sign and the core palette as stacked bands.
 * Below: the serif, the extended palette and Karla.
 */
export function BrandBento({ photos }: { photos: [Photo, Photo] }) {
  return (
    <div className={s.board}>
      <div className={s.inner}>
      <div className={s.top}>
        {photos.map((p) => (
          <img key={p.src} className={s.photo} src={p.src} alt={p.alt} loading="lazy" />
        ))}
        <ul className={s.core} aria-label="Core palette">
          {CORE.map((c) => (
            <Swatch key={c.hex} {...c} />
          ))}
        </ul>
      </div>
      <div className={s.bottom}>
        <p className={`${s.face} ${s.serif}`}>
          <span aria-hidden="true">Aa</span>
          Gascogne Serial
        </p>
        <ul className={s.extended} aria-label="Extended palette">
          {EXTENDED.map((c) => (
            <Swatch key={c.hex} {...c} />
          ))}
        </ul>
        <p className={`${s.face} ${s.sans}`}>
          <span aria-hidden="true">Aa</span>
          Karla
        </p>
      </div>
      </div>
    </div>
  );
}
