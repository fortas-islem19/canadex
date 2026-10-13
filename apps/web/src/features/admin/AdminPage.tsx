import {
  BOOKING_STATUSES,
  OFFICE_SCHEDULE,
  zonedNow,
  type BookingListQuery,
  type BookingStatus,
} from '@canadex/shared';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { Logo } from '../../components/Logo';
import { useLocale } from '../../i18n/useLocale';
import { ApiError } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { downloadFile } from '../../lib/ics';
import { useAdminBookings, useUpdateStatus } from './api';
import { bookingsToCsv } from './csv';
import styles from './AdminPage.module.css';

const TOKEN_KEY = 'canadex.adminToken';

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session simply won't persist.
  }
}

export default function AdminPage() {
  const { t, dict, intlLocale } = useLocale();
  const [token, setToken] = useState<string | null>(readToken);
  const [draft, setDraft] = useState('');
  const today = zonedNow(OFFICE_SCHEDULE.timeZone).date;
  const [filters, setFilters] = useState<BookingListQuery>({ from: today });

  const bookings = useAdminBookings(token, filters);
  const updateStatus = useUpdateStatus(token);
  const error = bookings.error instanceof ApiError ? bookings.error : null;
  const unauthorized = error?.code === 'unauthorized';
  const disabled = error?.code === 'admin_disabled';

  function signIn(event: FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    storeToken(value);
    setToken(value);
    setDraft('');
  }

  function signOut() {
    storeToken(null);
    setToken(null);
  }

  const list = bookings.data ?? [];
  const stats = {
    today: list.filter((booking) => booking.date === today && booking.status !== 'cancelled')
      .length,
    upcoming: list.filter((booking) => booking.date >= today && booking.status !== 'cancelled')
      .length,
    toConfirm: list.filter((booking) => booking.status === 'new').length,
  };

  const signedIn = Boolean(token) && !unauthorized;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.brand}>
            <Logo />
          </Link>
          <div>
            <p className={styles.subtitle}>{t('admin.subtitle')}</p>
            <h1 className={styles.title}>{t('admin.title')}</h1>
          </div>
          <div className={styles.headerActions}>
            <LanguageSwitcher />
            {signedIn && (
              <Button size="sm" variant="secondary" icon="logout" onClick={signOut}>
                {t('admin.signOut')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {!signedIn ? (
          <form className={styles.login} onSubmit={signIn}>
            <Icon name="shield" size={32} />
            <label htmlFor="admin-token">{t('admin.tokenLabel')}</label>
            <input
              id="admin-token"
              type="password"
              autoComplete="current-password"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            {unauthorized && <p className={styles.error}>{t('admin.invalidToken')}</p>}
            <Button type="submit" block>
              {t('admin.signIn')}
            </Button>
            <Link to="/" className={styles.back}>
              {t('admin.back')}
            </Link>
          </form>
        ) : (
          <>
            <section className={styles.stats}>
              {(['today', 'upcoming', 'toConfirm'] as const).map((key) => (
                <div key={key} className={styles.stat}>
                  <span>{t(`admin.stats.${key}`)}</span>
                  <strong>{stats[key]}</strong>
                </div>
              ))}
            </section>

            <section className={styles.toolbar}>
              <label className={styles.search}>
                <Icon name="search" size={18} />
                <input
                  type="search"
                  placeholder={t('admin.search')}
                  aria-label={t('admin.search')}
                  value={filters.q ?? ''}
                  onChange={(event) =>
                    setFilters({ ...filters, q: event.target.value || undefined })
                  }
                />
              </label>
              <select
                aria-label={t('admin.allStatuses')}
                value={filters.status ?? ''}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    status: (event.target.value || undefined) as BookingStatus | undefined,
                  })
                }
              >
                <option value="">{t('admin.allStatuses')}</option>
                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {dict.admin.statuses[status]}
                  </option>
                ))}
              </select>
              <label className={styles.date}>
                {t('admin.from')}
                <input
                  type="date"
                  value={filters.from ?? ''}
                  onChange={(event) =>
                    setFilters({ ...filters, from: event.target.value || undefined })
                  }
                />
              </label>
              <label className={styles.date}>
                {t('admin.to')}
                <input
                  type="date"
                  value={filters.to ?? ''}
                  onChange={(event) =>
                    setFilters({ ...filters, to: event.target.value || undefined })
                  }
                />
              </label>
              <Button
                size="sm"
                variant="secondary"
                icon="refresh"
                onClick={() => void bookings.refetch()}
              >
                {t('admin.refresh')}
              </Button>
              <Button
                size="sm"
                icon="download"
                disabled={list.length === 0}
                onClick={() =>
                  downloadFile(
                    `canadex-bookings-${today}.csv`,
                    bookingsToCsv(list),
                    'text/csv;charset=utf-8',
                  )
                }
              >
                {t('admin.export')}
              </Button>
            </section>

            {disabled && <p className={styles.notice}>{t('admin.disabled')}</p>}
            {error && !disabled && !unauthorized && (
              <p className={styles.notice}>{t('admin.loadError')}</p>
            )}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('admin.columns.when')}</th>
                    <th>{t('admin.columns.client')}</th>
                    <th>{t('admin.columns.service')}</th>
                    <th>{t('admin.columns.wilaya')}</th>
                    <th>{t('admin.columns.language')}</th>
                    <th>{t('admin.columns.notes')}</th>
                    <th>{t('admin.columns.reference')}</th>
                    <th>{t('admin.columns.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((booking) => (
                    <tr key={booking.reference} data-status={booking.status}>
                      <td>
                        <strong>
                          {formatDate(booking.date, intlLocale, {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </strong>
                        <span dir="ltr">{booking.time}</span>
                      </td>
                      <td>
                        <strong dir="auto">{booking.fullName}</strong>
                        <a href={`tel:${booking.phone}`} dir="ltr">
                          {booking.phone}
                        </a>
                        {booking.email && <a href={`mailto:${booking.email}`}>{booking.email}</a>}
                      </td>
                      <td>
                        {dict.services.names[booking.service]}
                        <span>{dict.booking.service.modes[booking.mode]}</span>
                      </td>
                      <td dir="auto">{booking.wilaya}</td>
                      <td className={styles.mono}>{booking.language.toUpperCase()}</td>
                      <td className={styles.notes} dir="auto">
                        {booking.notes}
                      </td>
                      <td className={styles.mono}>{booking.reference}</td>
                      <td>
                        <select
                          className={styles.status}
                          data-status={booking.status}
                          value={booking.status}
                          aria-label={`${t('admin.columns.status')} ${booking.reference}`}
                          disabled={updateStatus.isPending}
                          onChange={(event) =>
                            updateStatus.mutate({
                              reference: booking.reference,
                              status: event.target.value as BookingStatus,
                            })
                          }
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {dict.admin.statuses[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!bookings.isPending && list.length === 0 && !error && (
                <p className={styles.empty}>{t('admin.empty')}</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
