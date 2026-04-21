'use client';

// 独特设计的水獭吉祥物 - 不侵权版本
export default function OtterMascot({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体 */}
      <ellipse cx="50" cy="58" rx="32" ry="28" fill="#8B6914"/>
      <ellipse cx="50" cy="58" rx="28" ry="24" fill="#A67C00"/>

      {/* 肚子 */}
      <ellipse cx="50" cy="62" rx="18" ry="16" fill="#D4A84B"/>

      {/* 头部 */}
      <circle cx="50" cy="35" r="26" fill="#8B6914"/>
      <circle cx="50" cy="35" r="22" fill="#A67C00"/>

      {/* 脸部 */}
      <ellipse cx="50" cy="40" rx="14" ry="12" fill="#D4A84B"/>

      {/* 眼睛 */}
      <circle cx="40" cy="32" r="5" fill="#1a1a1a"/>
      <circle cx="60" cy="32" r="5" fill="#1a1a1a"/>
      <circle cx="41" cy="31" r="2" fill="#ffffff"/>
      <circle cx="61" cy="31" r="2" fill="#ffffff"/>

      {/* 鼻子 */}
      <ellipse cx="50" cy="42" rx="4" ry="3" fill="#5D4E37"/>

      {/* 嘴巴 */}
      <path d="M46 46 Q50 50 54 46" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* 耳朵 */}
      <circle cx="28" cy="22" r="8" fill="#8B6914"/>
      <circle cx="72" cy="22" r="8" fill="#8B6914"/>
      <circle cx="28" cy="22" r="5" fill="#D4A84B"/>
      <circle cx="72" cy="22" r="5" fill="#D4A84B"/>

      {/* 前爪 */}
      <ellipse cx="32" cy="75" rx="8" ry="6" fill="#8B6914"/>
      <ellipse cx="68" cy="75" rx="8" ry="6" fill="#8B6914"/>
      <ellipse cx="32" cy="75" rx="5" ry="4" fill="#D4A84B"/>
      <ellipse cx="68" cy="75" rx="5" ry="4" fill="#D4A84B"/>

      {/* 胡须 */}
      <line x1="30" y1="40" x2="18" y2="38" stroke="#5D4E37" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="43" x2="16" y2="44" stroke="#5D4E37" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="70" y1="40" x2="82" y2="38" stroke="#5D4E37" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="70" y1="43" x2="84" y2="44" stroke="#5D4E37" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// 简化的内联版本
export function InlineOtter({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <svg width="1em" height="1em" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="35" r="26" fill="#A67C00"/>
        <circle cx="50" cy="35" r="22" fill="#D4A84B"/>
        <circle cx="40" cy="32" r="5" fill="#1a1a1a"/>
        <circle cx="60" cy="32" r="5" fill="#1a1a1a"/>
        <circle cx="41" cy="31" r="2" fill="#ffffff"/>
        <circle cx="61" cy="31" r="2" fill="#ffffff"/>
        <ellipse cx="50" cy="42" rx="4" ry="3" fill="#5D4E37"/>
        <path d="M46 46 Q50 50 54 46" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    </span>
  );
}
