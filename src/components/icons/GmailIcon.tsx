/** Official multicolor Gmail logo as an inline SVG. Decorative by default. */
export default function GmailIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#4285f4" d="M6 38V14l6 4.5V38z" />
      <path fill="#34a853" d="M6 14v-2.7C6 9.5 8 8.4 9.4 9.4L12 11.3V18.5z" />
      <path fill="#fbbc04" d="M36 18.5V38h6V14l-6 4.5z" />
      <path fill="#ea4335" d="M12 18.5V11.3L24 20l12-8.7v7.2L24 27z" />
      <path fill="#c5221f" d="M36 11.3V18.5L42 14v-2.7c0-1.8-2-2.9-3.4-1.9z" />
      <path fill="#e8eaed" d="M12 38h24V18.5L24 27 12 18.5z" />
    </svg>
  )
}
