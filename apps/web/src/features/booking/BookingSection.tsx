import { zodResolver } from '@hookform/resolvers/zod';
import {
  OFFICE_SCHEDULE,
  bookingRequestSchema,
  type BookingField,
  type BookingRequest,
  type BookingRequestInput,
} from '@canadex/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SectionHeader } from '../../components/Section';
import { useLocale } from '../../i18n/useLocale';
import { ApiError } from '../../lib/api';
import { availabilityKey, useAvailability, useCreateBooking } from './api';
import styles from './Booking.module.css';
import { useBookingIntent } from './bookingIntentContext';
import { FieldError } from './FieldError';
import {
  LAST_STEP,
  STEP_FIELDS,
  emptyBooking,
  localReference,
  stepOfField,
  type BookingOutcome,
} from './model';
import { DetailsStep } from './steps/DetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { ServiceStep } from './steps/ServiceStep';
import { Success } from './Success';
import { Ticket } from './Ticket';

export function BookingSection() {
  const { t, dict, language } = useLocale();
  const { onBookingRequest } = useBookingIntent();
  const queryClient = useQueryClient();
  const availability = useAvailability();
  const createBooking = useCreateBooking();

  const form = useForm<BookingRequestInput, unknown, BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: emptyBooking(language),
    mode: 'onTouched',
  });

  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<BookingOutcome | null>(null);
  const wizardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const moveFocus = useRef(false);

  function goTo(next: number) {
    moveFocus.current = true;
    setStep(next);
  }

  // After a step change, bring the wizard into view and move focus to the step title.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const wizard = wizardRef.current;
    if (wizard && wizard.getBoundingClientRect().top < 0) wizard.scrollIntoView({ block: 'start' });
    headingRef.current?.focus({ preventScroll: true });
  }, [step, outcome]);

  // "Book this consultation" buttons elsewhere on the page pre-select a service.
  const outcomeRef = useRef(outcome);
  useEffect(() => {
    outcomeRef.current = outcome;
  }, [outcome]);

  useEffect(
    () =>
      onBookingRequest((service) => {
        if (outcomeRef.current) {
          setOutcome(null);
          form.reset(emptyBooking(form.getValues('language')));
        }
        form.setValue('service', service, { shouldDirty: true, shouldValidate: true });
        setStep((current) => (current === 0 ? 1 : current));
      }),
    [form, onBookingRequest],
  );

  // Follow the site language until the visitor picks a consultation language themselves.
  useEffect(() => {
    if (!form.getFieldState('language').isDirty) form.setValue('language', language);
  }, [form, language]);

  async function next() {
    const fields = STEP_FIELDS[step] ?? [];
    if (await form.trigger(fields, { shouldFocus: true })) goTo(step + 1);
  }

  function handleApiError(error: unknown) {
    if (!(error instanceof ApiError)) {
      form.setError('root', { message: 'generic' });
      return;
    }
    if (error.code === 'slot_unavailable') {
      form.setValue('time', '');
      form.setError('time', { message: 'slotTaken' });
      void queryClient.invalidateQueries({ queryKey: availabilityKey });
      goTo(1);
    } else if (
      error.code === 'validation' &&
      error.fields &&
      Object.keys(error.fields).length > 0
    ) {
      const entries = Object.entries(error.fields);
      for (const [field, code] of entries) {
        form.setError(field as BookingField, { message: code ?? 'generic' });
      }
      goTo(Math.min(...entries.map(([field]) => stepOfField(field))));
    } else {
      form.setError('root', { message: error.code === 'rate_limited' ? 'rateLimited' : 'generic' });
    }
  }

  async function submitBooking(request: BookingRequest) {
    if (!availability.data?.live) {
      const confirmation = { ...request, reference: localReference(), status: 'new' as const };
      setOutcome({ live: false, confirmation, request });
      moveFocus.current = true;
      return;
    }
    try {
      const confirmation = await createBooking.mutateAsync({
        ...request,
        cdx_hp: honeypotRef.current?.value || undefined,
      });
      setOutcome({ live: true, confirmation, request });
      moveFocus.current = true;
      void queryClient.invalidateQueries({ queryKey: availabilityKey });
    } catch (error) {
      handleApiError(error);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    // Pressing Enter in a field moves forward instead of skipping the review.
    if (step < LAST_STEP) void next();
    else void form.handleSubmit(submitBooking)(event);
  }

  function reset() {
    form.reset(emptyBooking(form.getValues('language')));
    setOutcome(null);
    goTo(0);
  }

  const stepTitles = [
    t('booking.service.title'),
    t('booking.schedule.title'),
    t('booking.details.title'),
    t('booking.review.title'),
  ];
  const submitting = form.formState.isSubmitting;
  const live = availability.data?.live ?? true;

  return (
    <section id="booking" className={styles.section} aria-labelledby="booking-title">
      <div className="container">
        <SectionHeader
          id="booking-title"
          number="04"
          kicker={t('booking.kicker')}
          title={t('booking.title')}
          lead={t('booking.lead', { minutes: OFFICE_SCHEDULE.slotMinutes })}
        />

        <FormProvider {...form}>
          <div className={styles.layout}>
            <div className={styles.wizard} ref={wizardRef}>
              {outcome ? (
                <Success outcome={outcome} onReset={reset} titleRef={headingRef} />
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <ol className={styles.stepper}>
                    {dict.booking.steps.map((label, index) => (
                      <li
                        key={label}
                        data-state={index < step ? 'done' : index === step ? 'current' : 'todo'}
                      >
                        <button
                          type="button"
                          disabled={index >= step}
                          aria-current={index === step ? 'step' : undefined}
                          onClick={() => goTo(index)}
                        >
                          <span className={styles.stepNumber}>
                            {index < step ? <Icon name="check" size={14} /> : index + 1}
                          </span>
                          <span className={styles.stepLabel}>{label}</span>
                        </button>
                      </li>
                    ))}
                  </ol>

                  <div className={styles.body}>
                    <p className={styles.stepOf}>
                      {t('booking.stepOf', { current: step + 1, total: LAST_STEP + 1 })}
                    </p>
                    <h3 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
                      {stepTitles[step]}
                    </h3>

                    <div key={step} className={styles.stepContent}>
                      {step === 0 && <ServiceStep />}
                      {step === 1 && <ScheduleStep availability={availability} />}
                      {step === 2 && <DetailsStep />}
                      {step === 3 && <ReviewStep onEdit={goTo} />}
                    </div>

                    <FieldError error={form.formState.errors.root} />
                  </div>

                  {/* Honeypot: invisible to people, irresistible to bots. */}
                  <input
                    ref={honeypotRef}
                    type="text"
                    name="cdx_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className={styles.honeypot}
                  />

                  <div className={styles.actions}>
                    {step > 0 ? (
                      <Button variant="ghost" icon="arrowBack" onClick={() => goTo(step - 1)}>
                        {t('booking.back')}
                      </Button>
                    ) : (
                      <span />
                    )}
                    {step < LAST_STEP ? (
                      <Button type="submit" arrow>
                        {t('booking.next')}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="lg"
                        icon={live ? 'check' : 'chat'}
                        disabled={submitting}
                      >
                        {submitting
                          ? t('booking.review.submitting')
                          : live
                            ? t('booking.review.submit')
                            : t('booking.review.submitWhatsapp')}
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>

            <aside className={styles.aside}>
              <Ticket outcome={outcome} />
              <div className={styles.bring}>
                <h3>{t('booking.bring.title')}</h3>
                <ul>
                  {dict.booking.bring.items.map((item) => (
                    <li key={item}>
                      <Icon name="check" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </FormProvider>
      </div>
    </section>
  );
}
