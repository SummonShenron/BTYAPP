// src/components/Patchy.tsx
// Mini Patchy mascot — reusable SVG with chat-step-driven animations.
// Design adapted from the errAgent PatchyEmptyState component.
import React from 'react';

// Chat lifecycle steps for the embedded assistant:
//   idle      → standing by, no question in flight
//   thinking  → question sent, agent graph is working (clean barbell lift)
//   streaming → answer tokens are arriving (struggling overhead press / end of set)
//   done      → answer complete (head tilt, wink, bicep flex, antenna ping & visor sheen)
//   error     → request failed
export type PatchyStatus =
  | 'idle'
  | 'thinking'
  | 'streaming'
  | 'done'
  | 'error';

const ACCENT: Record<PatchyStatus, string> = {
  done: '#22C55E',
  streaming: '#A855F7',
  thinking: '#EAB308',
  error: '#EF4444',
  idle: '#38C2DE',
};

const GLOW: Record<PatchyStatus, string> = {
  done: 'rgba(34, 197, 94, 0.25)',
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

interface PatchyProps {
  status?: PatchyStatus;
  className?: string;
}

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
        @keyframes patchyHeadTiltDone {
          0% { transform: rotate(0deg); }
          40% { transform: rotate(-8deg); }
          70% { transform: rotate(-5deg); }
          100% { transform: rotate(-6deg); }
        }
        @keyframes patchyBlink {
          0%, 45%, 52%, 100% { transform: scaleY(1); }
          48% { transform: scaleY(0.08); }
        }
        @keyframes patchyWinkOnce {
          0% { transform: scaleY(1); }
          25%, 55% { transform: scaleY(0.12); }
          75%, 100% { transform: scaleY(1); }
        }
        @keyframes patchyRadarPulse {
          0% { r: 4px; opacity: 0.9; stroke-width: 1.5px; }
          100% { r: 18px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes patchyAntennaPing {
          0% { r: 4px; opacity: 1; stroke-width: 2px; }
          100% { r: 16px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes patchySuccessSheen {
          0% { transform: translateX(-40px); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: translateX(50px); opacity: 0; }
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
        @keyframes patchyPressDip {
          0%, 12% { transform: translateY(0px); }
          22% { transform: translateY(3px); }
          38% { transform: translateY(-2px); }
          55%, 100% { transform: translateY(0px); }
        }
        @keyframes patchyStruggleTremble {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          15% { transform: translateY(3px) rotate(-1deg); }
          30% { transform: translateY(-1px) rotate(1deg); }
          35% { transform: translateY(-2px) rotate(-1.5deg); }
          40% { transform: translateY(-1px) rotate(1deg); }
          45% { transform: translateY(-3px) rotate(-1deg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
          55% { transform: translateY(-3.5px) rotate(-0.5deg); }
          70% { transform: translateY(-2px) rotate(1deg); }
          85% { transform: translateY(1px) rotate(-0.5deg); }
        }
        @keyframes patchyBicepPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes patchyFlexSparkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .patchy-bot-float {
          animation: ${
            status === 'error'
              ? 'patchyAlertPulse 1.4s ease-in-out infinite'
              : status === 'thinking'
              ? 'patchyPressDip 1.6s ease-in-out infinite'
              : status === 'streaming'
              ? 'patchyStruggleTremble 2.6s ease-in-out infinite'
              : 'patchyFloat 4s cubic-bezier(0.45, 0, 0.55, 1) infinite'
          };
        }
        .patchy-bot-head { transform-origin: 50px 45px; animation: patchyHeadTilt 7s ease-in-out infinite; }
        .patchy-bot-head-done { transform-origin: 50px 45px; animation: patchyHeadTiltDone 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .patchy-bot-eyes { transform-origin: center; transform-box: fill-box; animation: patchyBlink 4.2s infinite; }
        .patchy-bot-left-eye-wink {
          transform-origin: 42px 35px;
          animation: patchyWinkOnce 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.15s 1 forwards, patchyBlink 4.2s infinite 1.5s;
        }
        .patchy-bot-right-eye-done {
          transform-origin: 58px 35px;
          animation: patchyBlink 4.2s infinite 1.5s;
        }
        .patchy-bot-radar-1 { animation: patchyRadarPulse 2.2s ease-out infinite; }
        .patchy-bot-radar-2 { animation: patchyRadarPulse 2.2s ease-out 1.1s infinite; }
        .patchy-bot-ping { animation: patchyAntennaPing 1.2s cubic-bezier(0, 0.2, 0.8, 1) 1 forwards; }
        .patchy-bot-sheen { animation: patchySuccessSheen 1.8s ease-in-out infinite; }
        .patchy-bot-glint { animation: patchyGlint 4s ease-in-out infinite; }
        .patchy-bot-left-foot { animation: patchyFootDangle 4s ease-in-out infinite; }
        .patchy-bot-right-foot { animation: patchyFootDangle 4s ease-in-out 0.3s infinite; }
        .patchy-bot-glow { animation: patchyGlowPulse 1.2s ease-in-out infinite; }
        .patchy-bot-bicep-left {
          transform-origin: 13px 53px;
          animation: patchyBicepPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
        }
        .patchy-bot-bicep-right {
          transform-origin: 87px 53px;
          animation: patchyBicepPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
        }
        .patchy-bot-flex-sparkle {
          transform-origin: center;
          animation: patchyFlexSparkle 1.8s ease-in-out infinite;
        }
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

        {/* Radar / Ping Emissions */}
        {status === 'done' ? (
          <circle cx="50" cy="10" r="4" stroke={accentColor} fill="none" className="patchy-bot-ping" />
        ) : (
          <>
            <circle cx="50" cy="10" r="4" stroke={accentColor} fill="none" className="patchy-bot-radar-1" />
            <circle cx="50" cy="10" r="4" stroke={accentColor} fill="none" className="patchy-bot-radar-2" />
          </>
        )}

        {/* Feet */}
        <rect className="patchy-bot-left-foot" x="35" y="85" width="12" height="6" rx="2" fill="#8E95A2" />
        <rect className="patchy-bot-right-foot" x="53" y="85" width="12" height="6" rx="2" fill="#8E95A2" />

        {/* Torso */}
        <rect x="34" y="56" width="32" height="30" rx="7" fill="#121316" stroke="#2A2A32" strokeWidth="2" />

        {/* BTY Chest Brandmark */}
        <rect x="41" y="63" width="18" height="14" rx="3" fill="#0C1016" stroke={status === 'done' ? '#174722' : '#1F242D'} />
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

        {/* Left Arm — flexed when done, overhead pressing when thinking/streaming, resting otherwise */}
        <path
          d={
            status === 'done'
              ? 'M 24 62 C 10 66, 10 48, 20 42'
              : status === 'thinking' || status === 'streaming'
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
          {status === 'streaming' && (
            <animate
              attributeName="d"
              dur="2.6s"
              repeatCount="indefinite"
              values="
                M 24 62 C 20 56, 20 52, 22 46;
                M 24 62 C 20 56, 20 52, 22 46;
                M 24 62 C 19 52, 19 40, 21 32;
                M 24 62 C 20 54, 20 42, 22 34;
                M 24 62 C 19 50, 19 38, 21 30;
                M 24 62 C 18 48, 18 30, 20 18;
                M 24 62 C 18 48, 18 30, 20 18;
                M 24 62 C 20 56, 20 52, 22 46;
                M 24 62 C 20 56, 20 52, 22 46
              "
            />
          )}
        </path>

        {/* Left Bicep Peak & Flex Lines when Done */}
        {status === 'done' && (
          <g>
            
            <g className="patchy-bot-flex-sparkle">
              <line x1="5" y1="46" x2="9" y2="44" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="4" y1="53" x2="8" y2="53" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        <circle
          cx={
            status === 'done'
              ? 20
              : status === 'thinking' || status === 'streaming'
              ? 22
              : 22
          }
          cy={
            status === 'done'
              ? 42
              : status === 'thinking' || status === 'streaming'
              ? 46
              : 82
          }
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
          {status === 'streaming' && (
            <>
              <animate
                attributeName="cx"
                dur="2.6s"
                repeatCount="indefinite"
                values="22; 22; 21; 22; 21; 20; 20; 22; 22"
              />
              <animate
                attributeName="cy"
                dur="2.6s"
                repeatCount="indefinite"
                values="46; 46; 32; 34; 30; 18; 18; 46; 46"
              />
            </>
          )}
        </circle>

        {/* Head Group */}
        <g className={status === 'done' ? 'patchy-bot-head-done' : 'patchy-bot-head'}>
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
              {status === 'done' ? (
                <path d="M 25 15 L 35 15 L 20 55 L 10 55 Z" fill="#FFFFFF" className="patchy-bot-sheen" />
              ) : (
                <path d="M30 20 L34 20 L28 52 L24 52 Z" fill="#FFFFFF" className="patchy-bot-glint" />
              )}
            </g>
          </g>

          {/* Eyes (Left Eye winks when status === 'done') */}
          <g className={status === 'done' ? undefined : 'patchy-bot-eyes'}>
            <circle
              cx="42"
              cy="35"
              r="3.5"
              fill={accentColor}
              className={status === 'done' ? 'patchy-bot-left-eye-wink' : undefined}
            />
            <circle
              cx="58"
              cy="35"
              r="3.5"
              fill={accentColor}
              className={status === 'done' ? 'patchy-bot-right-eye-done' : undefined}
            />
          </g>

          {/* Mouth Expression */}
          {status === 'done' ? (
            <path d="M41 40 Q50 48 59 40" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : status === 'streaming' ? (
            <path d="M42 43 L46 41 L50 43 L54 41 L58 43" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : status === 'thinking' ? (
            <path d="M42 42 L47 41 L53 43 L58 42" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : status === 'error' ? (
            <path d="M43 43 Q50 38 57 43" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M43 41 Q50 46 57 41" stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* Right Arm & Hand Group */}
        <g>
          <path
            d={
              status === 'done'
                ? 'M 76 62 C 90 66, 90 48, 80 42'
                : status === 'thinking' || status === 'streaming'
                ? 'M 76 62 C 80 56, 80 52, 78 46'
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
            {status === 'streaming' && (
              <animate
                attributeName="d"
                dur="2.6s"
                repeatCount="indefinite"
                values="
                  M 76 62 C 80 56, 80 52, 78 46;
                  M 76 62 C 80 56, 80 52, 78 46;
                  M 76 62 C 81 52, 81 40, 79 32;
                  M 76 62 C 80 54, 80 42, 78 34;
                  M 76 62 C 81 50, 81 38, 79 30;
                  M 76 62 C 82 48, 82 30, 80 18;
                  M 76 62 C 82 48, 82 30, 80 18;
                  M 76 62 C 80 56, 80 52, 78 46;
                  M 76 62 C 80 56, 80 52, 78 46
                "
              />
            )}
          </path>

          {/* Right Bicep Peak & Flex Lines when Done */}
          {status === 'done' && (
            <g>
              
              <g className="patchy-bot-flex-sparkle">
                <line x1="95" y1="46" x2="91" y2="44" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
                <line x1="96" y1="53" x2="92" y2="53" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>
          )}

          <circle
            cx={
              status === 'done'
                ? 80
                : status === 'thinking' || status === 'streaming'
                ? 78
                : 78
            }
            cy={
              status === 'done'
                ? 42
                : status === 'thinking' || status === 'streaming'
                ? 46
                : 82
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
            {status === 'streaming' && (
              <>
                <animate
                  attributeName="cx"
                  dur="2.6s"
                  repeatCount="indefinite"
                  values="78; 78; 79; 78; 79; 80; 80; 78; 78"
                />
                <animate
                  attributeName="cy"
                  dur="2.6s"
                  repeatCount="indefinite"
                  values="46; 46; 32; 34; 30; 18; 18; 46; 46"
                />
              </>
            )}
          </circle>

          {/* Barbell — overhead lifting when thinking or streaming */}
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
              <line x1="2" y1="46" x2="98" y2="46" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="17.5" y="36" width="3.5" height="20" rx="1.5" fill={accentColor} />
              <rect x="14.5" y="40" width="2.5" height="12" rx="1" fill={accentColor} opacity="0.75" />
              <rect x="79" y="36" width="3.5" height="20" rx="1.5" fill={accentColor} />
              <rect x="83" y="40" width="2.5" height="12" rx="1" fill={accentColor} opacity="0.75" />
              <rect x="1" y="43" width="2" height="6" rx="1" fill="#64748b" />
              <rect x="98" y="43" width="2" height="6" rx="1" fill="#64748b" />
            </g>
          )}

          {status === 'streaming' && (
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                dur="2.6s"
                repeatCount="indefinite"
                values="
                  0 0;
                  0 0;
                  0 -14;
                  0 -12;
                  0 -16;
                  0 -28;
                  0 -28;
                  0 0;
                  0 0
                "
              />
              <line x1="2" y1="46" x2="98" y2="46" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="17.5" y="36" width="3.5" height="20" rx="1.5" fill={accentColor} />
              <rect x="14.5" y="40" width="2.5" height="12" rx="1" fill={accentColor} opacity="0.75" />
              <rect x="79" y="36" width="3.5" height="20" rx="1.5" fill={accentColor} />
              <rect x="83" y="40" width="2.5" height="12" rx="1" fill={accentColor} opacity="0.75" />
              <rect x="1" y="43" width="2" height="6" rx="1" fill="#64748b" />
              <rect x="98" y="43" width="2" height="6" rx="1" fill="#64748b" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

export default Patchy;