import { useLocale } from '../../i18n/useLocale';

type ErrorKey = keyof ReturnType<typeof useLocale>['dict']['booking']['errors'];

/** Translates a validation/API error code (see `ValidationCode`) into the active language. */
export function useErrorMessage() {
  const { dict } = useLocale();
  return (code: string | undefined) => {
    if (!code) return undefined;
    const errors = dict.booking.errors;
    return code in errors ? errors[code as ErrorKey] : errors.generic;
  };
}
