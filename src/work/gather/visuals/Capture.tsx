import { InvestmentsScreen, ReturnScreen, SavedScreen } from '../product/Product';
import s from './Capture.module.css';

/** One client adding what she knows, stepping away, and coming back. */
export function Capture() {
  return (
    <div className={s.wrap}>
      <div className={s.step}>
        <p className={s.when}>Adds what she knows</p>
        <InvestmentsScreen />
      </div>
      <div className={s.pair}>
        <div className={s.step}>
          <p className={s.when}>Stops, with three things open</p>
          <SavedScreen />
        </div>
        <div className={s.step}>
          <p className={s.when}>Comes back with a document</p>
          <ReturnScreen />
        </div>
      </div>
    </div>
  );
}
