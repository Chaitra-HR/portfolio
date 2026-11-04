import logo from '../../../assets/images/gather/moneyworks-logo.png';
import { cx } from '../../../lib/cx';
import { Art } from '../flow/Art';
import s from './MoneyStage.module.css';

/** Indian grouping: 2,34,50,000. */
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const ASSETS = [
  { name: 'Mutual funds', value: 11800000, dot: 'var(--g900)', note: 64 },
  { name: 'Stocks', value: 7450000, dot: 'var(--lime)', note: 52 },
  { name: 'Fixed deposit', value: 2500000, dot: 'var(--slate)', note: 58 },
  { name: 'Savings accounts', value: 1700000, dot: 'var(--chartreuse)', note: 46 },
];
const TOTAL = ASSETS.reduce((n, a) => n + a.value, 0);
export const SHARE = 7250000;
export const WORTH = '1,45,00,000';

/** A number whose digits roll to their new values, only the ones that change. */
function Roll({ value }: { value: string }) {
  return (
    <span className={s.roll} aria-label={value}>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className={s.slot}>
            <span className={s.strip} style={{ translate: `0 ${-Number(ch) * 10}%` }}>
              {'0123456789'.split('').map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

function Icon({ name }: { name: string }) {
  const d: Record<string, string> = {
    home: 'M3 8.5 10 3l7 5.5V17H3V8.5Zm5 8.5v-5h4v5',
    clock: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-10v3.5l2.5 1.5',
    gold: 'M5 15h10l-2-5H7l-2 5Zm2.5-5L9 6h2l1.5 4',
    plus: 'M10 4v12M4 10h12',
    check: 'M4.5 10.5 8 14l7.5-8',
    close: 'M6 6l8 8M14 6l-8 8',
  };
  return (
    <svg className={s.icon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d[name]} />
    </svg>
  );
}

export interface StageState {
  /** Property pressed and the home card open. */
  open: boolean;
  /** Characters of the home's value typed. */
  typed: number;
  /** "Me and my spouse" chosen. */
  joint: boolean;
  /** The card has gone into the list as a row. */
  added: boolean;
  /** Which control is being pressed, for its press state. */
  press?: string;
}

/**
 * MoneyWorks onboarding, framed like a product demo: the window pinned to the top left and running off the
 * tile, only the words the story needs (placeholder lines for the rest), and the one card the story is about
 * sliding in over it. Laid out on a 1000-wide stage. Illustrative, with sample figures.
 */
export function MoneyStage({ open, typed, joint, added, press }: StageState) {
  const total = TOTAL + (added ? SHARE : 0);
  return (
    <div className={s.stage}>
      <div className={s.window}>
        <div className={s.chrome}>
          <span className={s.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.url}>app.moneyworks.in/onboarding</span>
        </div>
        <div className={s.top}>
          <img className={s.logo} src={logo} width={454} height={84} alt="" decoding="async" />
          <span className={s.steps}>
            <i className={s.stepDone} />
            <i className={s.stepDone} />
            <i className={s.stepDone} />
            <i className={s.stepNow} />
            <i />
            <i />
          </span>
        </div>
        <div className={s.body}>
          <p className={s.kicker}>Assets &amp; loans · 1 of 2</p>
          <h4 className={s.title}>What you’ve built so far</h4>
          <p className={s.totalLabel}>Total assets</p>
          <p className={s.total}>
            <Roll value={inr(total)} />
          </p>
          <div className={s.grid}>
            <div className={s.list}>
              <div className={cx(s.row, s.newRow, added && s.newOn)} data-target="row">
                <i style={{ background: 'var(--g700)' }} />
                <span>
                  Your home
                  <small>50% share, joint</small>
                </span>
                <b>{inr(SHARE)}</b>
                <span className={cx(s.remove, press === 'remove' && s.pressed)} data-target="remove">
                  <Icon name="close" />
                </span>
              </div>
              {ASSETS.map((a) => (
                <div key={a.name} className={s.row}>
                  <i style={{ background: a.dot }} />
                  <span>
                    {a.name}
                    <em style={{ width: `${a.note}%` }} />
                  </span>
                  <b>{inr(a.value)}</b>
                </div>
              ))}
            </div>
            <div className={s.own}>
              <p className={s.ownHead}>Anything else you own?</p>
              <div className={cx(s.option, s.suggested, (open || added) && s.optionOn, press === 'property' && s.pressed)} data-target="property">
                <i>
                  <Icon name="home" />
                </i>
                <span>
                  Property
                  <small>{added ? 'Added' : 'Suggested for you'}</small>
                </span>
                <Icon name={added ? 'check' : 'plus'} />
              </div>
              {[
                ['clock', 'Retirement savings', 70],
                ['gold', 'Gold', 54],
              ].map(([icon, name, w]) => (
                <div key={name} className={s.option}>
                  <i>
                    <Icon name={icon as string} />
                  </i>
                  <span>
                    {name}
                    <em style={{ width: `${w}%` }} />
                  </span>
                  <Icon name="plus" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* the one card the story needs, over the window */}
      <div className={cx(s.card, open && !added && s.cardOn, added && s.cardGone)} data-target="card">
        <span className={s.cardArt}>
          <Art name="home" className={s.house} />
        </span>
        <div className={s.cardBody}>
          <p className={s.cardTitle}>Your home</p>
          <span className={cx(s.worth, typed > 0 && s.worthOn)}>
            <em>₹</em>
            <span className={cx(typed > 0 && typed < WORTH.length && s.caret)}>{WORTH.slice(0, typed)}</span>
            <i className={cx(s.range, typed >= WORTH.length && s.rangeOn)}>Within local range</i>
          </span>
          <span className={s.pills}>
            <span className={s.pill}>Just me</span>
            <span className={cx(s.pill, joint && s.pillOn, press === 'joint' && s.pressed)} data-target="joint">
              Me and my spouse
            </span>
          </span>
          <span className={cx(s.share, joint && s.shareOn)}>
            Your share<b>{inr(SHARE)}</b>
          </span>
          <span className={cx(s.add, press === 'add' && s.pressed)} data-target="add">
            Add to assets
          </span>
        </div>
      </div>
    </div>
  );
}
