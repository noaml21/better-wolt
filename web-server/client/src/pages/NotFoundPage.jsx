import { LinkButton } from '../components/ui';
import './NotFoundPage.css';

/* A line that does not run (V5 spec §6): the LED board says so, and the
   two ways back sit under it. */

export default function NotFoundPage() {
  return (
    <div className="bw-page bw-not-found">
      <section className="bw-not-found__board">
        <p className="bw-not-found__code bw-num" aria-hidden="true">
          404
        </p>
        <h1 className="bw-not-found__title bw-display">הדף הזה לא קיים</h1>
        <p className="bw-not-found__text">
          יכול להיות שהמסעדה ירדה מהאוויר, או שהקישור נשבר בדרך. אפשר להתחיל מחדש מהמסעדות.
        </p>
      </section>

      <div className="bw-not-found__actions">
        <LinkButton to="/">לעמוד הבית</LinkButton>
        <LinkButton to="/restaurants" variant="secondary">
          לכל המסעדות
        </LinkButton>
      </div>
    </div>
  );
}
