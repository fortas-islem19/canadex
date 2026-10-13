import type { SVGProps } from 'react';

/** Official maple leaf geometry (Flag of Canada), centred on 0,0. */
export const MAPLE_LEAF_PATH =
  'm-90 2030 45-863a95 95 0 0 0-111-98l-859 151 116-320a65 65 0 0 0-20-73l-941-762 212-99a65 65 0 0 0 34-79l-186-572 542 115a65 65 0 0 0 73-38l105-247 423 454a65 65 0 0 0 111-57l-204-1052 327 189a65 65 0 0 0 91-27l332-652 332 652a65 65 0 0 0 91 27l327-189-204 1052a65 65 0 0 0 111 57l423-454 105 247a65 65 0 0 0 73 38l542-115-186 572a65 65 0 0 0 34 79l212 99-941 762a65 65 0 0 0-20 73l116 320-859-151a95 95 0 0 0-111 98l45 863z';

type FlagProps = SVGProps<SVGSVGElement> & { title?: string };

export function MapleLeaf(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-2100 -2150 4200 4200" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d={MAPLE_LEAF_PATH} />
    </svg>
  );
}

export function CanadaFlag({ title = 'Canada', ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 40 20" role="img" {...props}>
      <title>{title}</title>
      <rect width="40" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#d52b1e" />
      <rect x="30" width="10" height="20" fill="#d52b1e" />
      <path fill="#d52b1e" d={MAPLE_LEAF_PATH} transform="translate(20 10) scale(0.0036)" />
    </svg>
  );
}

export function AlgeriaFlag({ title = 'Algérie', ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 30 20" role="img" {...props}>
      <title>{title}</title>
      <rect width="15" height="20" fill="#006233" />
      <rect x="15" width="15" height="20" fill="#fff" />
      <path fill="#d21034" d="M18.61 7.15A5 5 0 1 0 18.61 12.85A4 4 0 1 1 18.61 7.15Z" />
      <polygon
        fill="#d21034"
        transform="translate(18.6 10) scale(2.1) rotate(-18)"
        points="0,-1 0.225,-0.309 0.951,-0.309 0.363,0.118 0.588,0.809 0,0.382 -0.588,0.809 -0.363,0.118 -0.951,-0.309 -0.225,-0.309"
      />
    </svg>
  );
}
