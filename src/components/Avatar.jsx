export default function Avatar({ size = 46 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 46 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-full shrink-0"
      aria-label="ליאן"
    >
      {/* Background circle */}
      <circle cx="23" cy="23" r="23" fill="#E6E6E6" />
      <g clipPath="url(#avatarClip)">
        {/* Shoulders / body */}
        <path d="M8 46c0-7.5 6.7-12 15-12s15 4.5 15 12v4H8v-4Z" fill="#E3F500" />
        {/* Neck */}
        <rect x="20" y="26" width="6" height="8" rx="3" fill="#F2C9A8" />
        {/* Hair back */}
        <path d="M11 22c0-7.7 5.4-13 12-13s12 5.3 12 13c0 5-1.5 9-3 12V24a9 9 0 0 0-18 0v10c-1.5-3-3-7-3-12Z" fill="#5C4433" />
        {/* Face */}
        <circle cx="23" cy="21" r="9" fill="#F7D3B3" />
        {/* Hair front / bangs */}
        <path d="M14 21c0-5.5 4-9.5 9-9.5s9 4 9 9.5c-2-3-5-4.5-9-4.5s-7 1.5-9 4.5Z" fill="#5C4433" />
        {/* Eyes */}
        <circle cx="19.6" cy="21" r="1.1" fill="#3B2A1C" />
        <circle cx="26.4" cy="21" r="1.1" fill="#3B2A1C" />
        {/* Smile */}
        <path d="M20.5 24.5c.8.9 4.2.9 5 0" stroke="#C77F5C" strokeWidth="1.1" strokeLinecap="round" />
      </g>
      <defs>
        <clipPath id="avatarClip">
          <circle cx="23" cy="23" r="23" />
        </clipPath>
      </defs>
    </svg>
  );
}
