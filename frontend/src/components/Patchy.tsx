// src/components/Patchy.tsx
// Mini Patchy mascot — reusable SVG with chat-step-driven animations.
// Design adapted from the errAgent PatchyEmptyState component.
import React from 'react';

// Chat lifecycle steps for the embedded assistant:
//   idle      → standing by, no question in flight
//   thinking  → question sent, agent graph is working
//   streaming → answer tokens are arriving
//   done      → answer complete (brief celebration)
//   error     → request failed
export type PatchyStatus =
  | 'idle'
  | 'thinking'
  | 'streaming'
  | 'done'
  | 'error';

interface PatchyProps {
  status?: PatchyStatus;
  className?: string;
}

const ACCENT: Record<PatchyStatus, string> = {
  done: '#22C55E',
  streaming: '#A855F7',
  thinking: '#EAB308',
  error: '#EF4444',
  idle: '#38C2DE',
};

const GLOW: Record<PatchyStatus, string> = {
  done: 'rgba(34, 197, 94, 0.3)',
  streaming: 'rgba(168, 85, 247, 0.25)',
  thinking: 'rgba(234, 179, 8, 0.25)',
  error: 'rgba(239, 68, 68, 0.25)',
  idle: 'rgba(56, 194, 222, 0.12)',
};

const VISOR_BG: Record<PatchyStatus, string> = {
  done: '#0d1f12',
  streaming: '#160d21',
  thinking: '#1a160a',
  error: '#1c0d11',
  idle: '#0C1016',
};

const VISOR_BORDER: Record<PatchyStatus, string> = {
  done: '#174722',
  streaming: '#421a63',
  thinking: '#4a3b10',
  error: '#4a151b',
  idle: '#1F242D',
};

const Patchy: React.FC<PatchyProps> = ({ status = 'idle', className }) => {
  const accentColor = ACCENT[status];
  const glowColor = GLOW[status];
  const visorBg = VISOR_BG[status];
  const visorBorder = VISOR_BORDER[status];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      className={className}
      aria-hidden="true"
    >
      <style>{`
        @keyframes patchyFloat {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          50% { transform: translateY(-10px) scale(0.97, 1.03); }
          75% { transform: translateY(-2px) scale(1.02, 0.98); }
        }
        @keyframes patchyAlertPulse {
          0%, 100% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.4));
          }
          50% {
            transform: translateY(-6px) scale(1.04);
            filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.85));
          }
        }
        @keyframes patchyHappyHop {
          0%, 100% { transform: translateY(0px); }
          30% { transform: translateY(-7px); }
          50% { transform: translateY(0px); }
          65% { transform: translateY(-3px); }
          80% { transform: translateY(0px); }
        }
        @keyframes patchyGlowPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes patchyHeadTilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-7deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes patchyBlink {
          0%, 45%, 52%, 100% { transform: scaleY(1); }
          48% { transform: scaleY(0.08); }
        }
        @keyframes patchyRadarPulse {
          0% { r: 4px; opacity: 0.9; stroke-width: 1.5px; }
          100% { r: 18px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes patchyGlint {
          0%, 60% { transform: translateX(-50px); opacity: 0; }
          70% { opacity: 0.4; }
          85%, 100% { transform: translateX(60px); opacity: 0; }
        }
        @keyframes patchyFootDangle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(1.5px); }
        }
        @keyframes patchyMagnifierScan {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(-2px, -1px) rotate(-3deg); }
          66% { transform: translate(1px, 1px) rotate(2deg); }
        }
        @keyframes patchyPressDip {
          0%, 12% { transform: translateY(0px); }
          22% { transform: translateY(3px); }
          38% { transform: translateY(-2px); }
          55%, 100% { transform: translateY(0px); }
        }

        .patchy-bot-float {
          animation: ${
            status === 'done'
              ? 'patchyHappyHop 1.2s ease-in-out infinite'
              : status === 'error'
              ? 'patchyAlertPulse 1.4s ease-in-out infinite'
              : status === 'thinking'
              ? 'patchyPressDip 1.6s ease-in-out infinite'
              : 'patchyFloat 4s cubic-bezier(0.45, 0, 0.55, 1) infinite'
          };
        }
        .patchy-bot-head { transform-origin: 50px 45px; animation: patchyHeadTilt 7s ease-in-out infinite; }
        .patchy-bot-eyes { transform-origin: center; transform-box: fill-box; animation: patchyBlink 4.2s infinite; }
        .patchy-bot-radar-1 { animation: patchyRadarPulse 2.2s ease-out infinite; }
        .patchy-bot-radar-2 { animation: patchyRadarPulse 2.2s ease-out 1.1s infinite; }
        .patchy-bot-glint { animation: patchyGlint 4s ease-in-out infinite; }
        .patchy-bot-left-foot { animation: patchyFootDangle 4s ease-in-out infinite; }
        .patchy-bot-right-foot { animation: patchyFootDangle 4s ease-in-out 0.3s infinite; }
        .patchy-bot-magnifier-group { transform-origin: 66px 45px; animation: patchyMagnifierScan 3s ease-in-out infinite; }
        .patchy-bot-glow { animation: patchyGlowPulse 1.2s ease-in-out infinite; }
      `}</style>

      <defs>
        <clipPath id="patchy-visor-screen-clip">
          <rect x="33" y="25" width="34" height="24" rx="6" />
        </clipPath>
      </defs>

      {/* Main Floating Body Group */}
      <g className="patchy-bot-float">
        {/* Backdrop Glow */}
        <circle cx="50" cy="50" r="38" fill={glowColor} className={status === 'done' ? 'patchy-bot-glow' : undefined} />

        {/* Radar Wave Emission */}
        <circle cx="50" cy="10" r="4" stroke={accentColor} fill="none" className="patchy-bot-radar-1" />
        <circle cx="50" cy="10" r="4" stroke={accentColor} fill="none" className="patchy-bot-radar-2" />

        {/* Feet */}
        <rect className="patchy-bot-left-foot" x="35" y="85" width="12" height="6" rx="2" fill="#8E95A2" />
        <rect className="patchy-bot-right-foot" x="53" y="85" width="12" height="6" rx="2" fill="#8E95A2" />

        {/* Torso */}
        <rect x="34" y="56" width="32" height="30" rx="7" fill="#121316" stroke="#2A2A32" strokeWidth="2" />

        {/* BTY Chest Brandmark */}
        <rect x="41" y="63" width="18" height="14" rx="3" fill="#0C1016" stroke="#1F242D" />
        <text
          x="50"
          y="73.5"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="800"
          fontFamily="inherit"
          fill={accentColor}
          opacity="0.85"
        >
          BTY
        </text>

        {/* Left Arm — raised in celebration when done, pressing when thinking */}
        <path
          d={
            status === 'done'
              ? 'M 24 62 C 16 50, 14 36, 18 24'
              : status === 'thinking'
              ? 'M 24 62 C 20 56, 20 52, 22 46'
              : 'M24 62 C16 66, 16 76, 22 82'
          }
          stroke="#8E95A2"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        >
          {status === 'thinking' && (
            <animate
              attributeName="d"
              dur="1.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
              keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
              values="
                M 24 62 C 20 56, 20 52, 22 46;
                M 24 62 C 20 56, 20 52, 22 46;
                M 24 62 C 18 48, 18 30, 20 18;
                M 24 62 C 18 48, 18 30, 20 18;
                M 24 62 C 20 56, 20 52, 22 46;
                M 24 62 C 20 56, 20 52, 22 46
              "
            />
          )}
        </path>
        <circle
          cx={status === 'done' ? 18 : status === 'thinking' ? 22 : 22}
          cy={status === 'done' ? 24 : status === 'thinking' ? 46 : 82}
          r="3.5"
          fill={status === 'done' ? accentColor : '#8E95A2'}
        >
          {status === 'thinking' && (
            <>
              <animate
                attributeName="cx"
                dur="1.6s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
                keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                values="22; 22; 20; 20; 22; 22"
              />
              <animate
                attributeName="cy"
                dur="1.6s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
                keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                values="46; 46; 18; 18; 46; 46"
              />
            </>
          )}
        </circle>

        {/* Head Group */}
        <g className="patchy-bot-head">
          {/* Antenna */}
          <line x1="50" y1="20" x2="50" y2="12" stroke="#8E95A2" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="10" r="4" fill={accentColor} />

          {/* Head Shell */}
          <rect x="28" y="20" width="44" height="34" rx="10" fill="#121316" stroke="#2A2A32" strokeWidth="2" />

          {/* Ears */}
          <rect x="23" y="32" width="5" height="10" rx="2" fill="#8E95A2" />
          <rect x="72" y="32" width="5" height="10" rx="2" fill="#8E95A2" />

          {/* Visor Screen */}
          <g>
            <rect x="33" y="25" width="34" height="24" rx="6" fill={visorBg} stroke={visorBorder} />
            <g clipPath="url(#patchy-visor-screen-clip)">
              <path d="M30 20 L34 20 L28 52 L24 52 Z" fill="#FFFFFF" className="patchy-bot-glint" />
            </g>
          </g>

          {/* Blinking Eyes */}
          <g className="patchy-bot-eyes">
            <circle cx="42" cy="35" r="3.5" fill={accentColor} />
            <circle cx="58" cy="35" r="3.5" fill={accentColor} />
          </g>

          {/* Mouth Expression — determined grimace while pressing */}
          {status === 'done' ? (
            <path d="M41 40 Q50 48 59 40" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : status === 'streaming' ? (
            <path d="M44 42 H56" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
          ) : status === 'thinking' ? (
            <path d="M42 42 L47 41 L53 43 L58 42" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : status === 'error' ? (
            <path d="M43 43 Q50 38 57 43" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M43 41 Q50 46 57 41" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* Right Arm & Hand Group — pressing arm when thinking */}
        <g className={status === 'streaming' ? 'patchy-bot-magnifier-group' : undefined}>
          <path
            d={
              status === 'done'
                ? 'M 76 62 C 84 50, 86 36, 82 24'
                : status === 'thinking'
                ? 'M 76 62 C 80 56, 80 52, 78 46'
                : status === 'streaming'
                ? 'M 76 62 C 82 60, 74 52, 66 45'
                : 'M 76 62 C 84 68, 84 76, 78 82'
            }
            stroke="#8E95A2"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          >
            {status === 'idle' && (
              <animate
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0; 0.1; 0.2; 0.3; 0.4; 0.5; 0.6; 1"
                keySplines="0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1"
                values="
                  M 76 62 C 84 68, 84 76, 78 82;
                  M 76 62 C 88 56, 94 42, 92 30;
                  M 76 62 C 82 50, 86 36, 84 26;
                  M 76 62 C 88 56, 94 42, 92 30;
                  M 76 62 C 82 50, 86 36, 84 26;
                  M 76 62 C 88 56, 94 42, 92 30;
                  M 76 62 C 84 68, 84 76, 78 82;
                  M 76 62 C 84 68, 84 76, 78 82
                "
              />
            )}
            {status === 'thinking' && (
              <animate
                attributeName="d"
                dur="1.6s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
                keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                values="
                  M 76 62 C 80 56, 80 52, 78 46;
                  M 76 62 C 80 56, 80 52, 78 46;
                  M 76 62 C 82 48, 82 30, 80 18;
                  M 76 62 C 82 48, 82 30, 80 18;
                  M 76 62 C 80 56, 80 52, 78 46;
                  M 76 62 C 80 56, 80 52, 78 46
                "
              />
            )}
          </path>

          <circle
            cx={
              status === 'done'
                ? 82
                : status === 'thinking'
                ? 78
                : status === 'streaming'
                ? 66
                : status !== 'idle'
                ? 78
                : undefined
            }
            cy={
              status === 'done'
                ? 24
                : status === 'thinking'
                ? 46
                : status === 'streaming'
                ? 45
                : status !== 'idle'
                ? 82
                : undefined
            }
            r="3.5"
            fill={accentColor}
          >
            {status === 'idle' && (
              <>
                <animate
                  attributeName="cx"
                  dur="8s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; 0.1; 0.2; 0.3; 0.4; 0.5; 0.6; 1"
                  keySplines="0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1"
                  values="78; 92; 84; 92; 84; 92; 78; 78"
                />
                <animate
                  attributeName="cy"
                  dur="8s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; 0.1; 0.2; 0.3; 0.4; 0.5; 0.6; 1"
                  keySplines="0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1; 0.25 1 0.5 1"
                  values="82; 30; 26; 30; 26; 30; 82; 82"
                />
              </>
            )}
            {status === 'thinking' && (
              <>
                <animate
                  attributeName="cx"
                  dur="1.6s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
                  keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                  values="78; 78; 80; 80; 78; 78"
                />
                <animate
                  attributeName="cy"
                  dur="1.6s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
                  keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                  values="46; 46; 18; 18; 46; 46"
                />
              </>
            )}
          </circle>

          {/* Barbell — hands grip outside the plates (between plates and end
              caps); plates are loaded on the sleeves with a subtle 2px gap
              before each end cap, like a real barbell */}
          {status === 'thinking' && (
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                dur="1.6s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0; 0.22; 0.38; 0.62; 0.88; 1"
                keySplines="0.4 0 0.6 1; 0.3 0 0.3 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                values="0 0; 0 0; 0 -28; 0 -28; 0 0; 0 0"
              />
              {/* Bar */}
              <line x1="2" y1="46" x2="98" y2="46" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              {/* Left side: plate stack just outboard of the grip → bare sleeve → cap */}
              <rect x="17.5" y="36" width="3.5" height="20" rx="1.5" fill={accentColor} />
              <rect x="14.5" y="40" width="2.5" height="12" rx="1" fill={accentColor} opacity="0.75" />
              {/* Right side: grip → plate stack just outboard → bare sleeve → cap */}
              <rect x="79" y="36" width="3.5" height="20" rx="1.5" fill={accentColor} />
              <rect x="83" y="40" width="2.5" height="12" rx="1" fill={accentColor} opacity="0.75" />
              {/* End caps at the bar ends */}
              <rect x="1" y="43" width="2" height="6" rx="1" fill="#64748b" />
              <rect x="98" y="43" width="2" height="6" rx="1" fill="#64748b" />
            </g>
          )}

          {/* Magnifying Glass Element centered over Right Eye (58, 35) while streaming */}
          {status === 'streaming' && (
            <g>
              {/* Handle */}
              <line x1="66" y1="45" x2="61" y2="39" stroke="#8E95A2" strokeWidth="3" strokeLinecap="round" />
              {/* Lens Rim framing right eye */}
              <circle cx="58" cy="35" r="6.5" stroke={accentColor} strokeWidth="2" fill="rgba(168, 85, 247, 0.35)" />
              {/* Glint on Lens */}
              <path d="M55 33 Q57 31 59 32" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" fill="none" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

export default Patchy;
