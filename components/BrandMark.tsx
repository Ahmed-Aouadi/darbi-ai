/** رمز المنصة (سهم الاتجاه + ثلاثة أسطر برمجية). نفس تصميم app/icon.svg بدون الخلفية. */
export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="96 96 320 320" aria-hidden="true" focusable="false">
      <path d="M214 150l-98 106 98 106" fill="none" stroke="#fff" strokeWidth="46" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="268" y="150" width="132" height="46" rx="23" fill="#fff" />
      <rect x="268" y="233" width="96" height="46" rx="23" fill="#fff" opacity=".92" />
      <rect x="268" y="316" width="132" height="46" rx="23" fill="#ff6b4a" />
    </svg>
  );
}
