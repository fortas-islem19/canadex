import { LANGUAGES, type BookingRequestInput } from '@canadex/shared';
import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { dictionaries } from '../../../i18n';
import { useLocale } from '../../../i18n/useLocale';
import { WILAYAS } from '../../../lib/wilayas';
import styles from '../Booking.module.css';
import { FieldError } from '../FieldError';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: { message?: string };
  wide?: boolean;
  children: ReactNode;
}

function Field({ id, label, hint, error, wide, children }: FieldProps) {
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.fieldHint}>
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function DetailsStep() {
  const { t, language } = useLocale();
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingRequestInput>();

  const describedBy = (id: string, hasHint = false) =>
    errors[id as keyof typeof errors] ? `${id}-error` : hasHint ? `${id}-hint` : undefined;

  return (
    <div className={styles.fields}>
      <Field id="fullName" label={t('booking.details.fullName')} error={errors.fullName}>
        <input
          id="fullName"
          className={styles.input}
          autoComplete="name"
          placeholder={t('booking.details.fullNamePlaceholder')}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={describedBy('fullName')}
          {...register('fullName')}
        />
      </Field>

      <Field
        id="phone"
        label={t('booking.details.phone')}
        hint={t('booking.details.phoneHint')}
        error={errors.phone}
      >
        <input
          id="phone"
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          className={styles.input}
          placeholder={t('booking.details.phonePlaceholder')}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy('phone', true)}
          {...register('phone')}
        />
      </Field>

      <Field id="email" label={t('booking.details.email')} error={errors.email}>
        <input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          className={styles.input}
          placeholder={t('booking.details.emailPlaceholder')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email')}
          {...register('email')}
        />
      </Field>

      <Field id="wilaya" label={t('booking.details.wilaya')} error={errors.wilaya}>
        <input
          id="wilaya"
          list="wilaya-options"
          autoComplete="address-level1"
          className={styles.input}
          placeholder={t('booking.details.wilayaPlaceholder')}
          aria-invalid={Boolean(errors.wilaya)}
          aria-describedby={describedBy('wilaya')}
          {...register('wilaya')}
        />
        <datalist id="wilaya-options">
          {WILAYAS.map((wilaya) => (
            <option
              key={wilaya.code}
              value={`${wilaya.code} · ${language === 'ar' ? wilaya.ar : wilaya.fr}`}
            />
          ))}
        </datalist>
      </Field>

      <Field id="language" label={t('booking.details.language')} error={errors.language}>
        <select id="language" className={styles.input} {...register('language')}>
          {LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {dictionaries[code].common.languageName}
            </option>
          ))}
        </select>
      </Field>

      <Field id="notes" label={t('booking.details.notes')} error={errors.notes} wide>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          className={`${styles.input} ${styles.textarea}`}
          placeholder={t('booking.details.notesPlaceholder')}
          aria-invalid={Boolean(errors.notes)}
          {...register('notes')}
        />
      </Field>

      <div className={`${styles.field} ${styles.wide}`}>
        <label className={styles.consent}>
          <input
            type="checkbox"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            {...register('consent')}
          />
          <span>{t('booking.details.consent')}</span>
        </label>
        <FieldError id="consent-error" error={errors.consent} />
      </div>
    </div>
  );
}
