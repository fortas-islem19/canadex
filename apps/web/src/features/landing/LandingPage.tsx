import { BookingIntentProvider } from '../booking/BookingIntent';
import { BookingSection } from '../booking/BookingSection';
import { Glossary } from '../glossary/Glossary';
import { Pathfinder } from '../pathfinder/Pathfinder';
import { BrandStrip } from './BrandStrip';
import { Contact } from './Contact';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { Header } from './Header';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { IntroSplash } from './IntroSplash';
import { MobileBookBar } from './MobileBookBar';
import { Services } from './Services';
import { useLocale } from '../../i18n/useLocale';

export default function LandingPage() {
  const { t } = useLocale();
  return (
    <BookingIntentProvider>
      <IntroSplash />
      <a href="#main" className="skip-link">
        {t('common.skip')}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <BrandStrip />
        <Services />
        <Pathfinder />
        <HowItWorks />
        <BookingSection />
        <Glossary />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileBookBar />
    </BookingIntentProvider>
  );
}
