import { EmptyState, LinkButton } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="bw-page bw-page--narrow">
      <EmptyState
        level={1}
        icon="search"
        title="הדף הזה לא קיים"
        description="יכול להיות שהמסעדה ירדה מהאוויר, או שהקישור נשבר בדרך. אפשר להתחיל מחדש מהמסעדות."
        action={
          <div className="bw-actions">
            <LinkButton to="/">לעמוד הבית</LinkButton>
            <LinkButton to="/restaurants" variant="secondary">
              לכל המסעדות
            </LinkButton>
          </div>
        }
      />
    </div>
  );
}
