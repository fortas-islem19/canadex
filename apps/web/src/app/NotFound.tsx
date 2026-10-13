import { Link } from 'react-router';
import { MapleLeaf } from '../components/Flags';
import { useLocale } from '../i18n/useLocale';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <main className={styles.page}>
      <MapleLeaf className={styles.leaf} />
      <p className={styles.code}>404</p>
      <h1>{t('notFound.title')}</h1>
      <Link to="/" className={styles.link}>
        {t('notFound.back')}
      </Link>
    </main>
  );
}
