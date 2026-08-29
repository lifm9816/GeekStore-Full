"use client";

import "./ConfusedRobot.css";

type ConfusedRobotProps = {
  className?: string;
};

export function ConfusedRobot({ className = "" }: ConfusedRobotProps) {
  return (
    <svg
      viewBox="0 0 680 360"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={["h-auto w-full max-w-[680px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <defs>
        <clipPath id="gs-confused-robot-hatch">
          <rect x="0" y="0" width="680" height="300" />
        </clipPath>
      </defs>
      <ellipse cx="340" cy="303" rx="72" ry="14" fill="#0B0F14" />
      <ellipse
        cx="340"
        cy="300"
        rx="64"
        ry="10"
        fill="#232E3B"
        stroke="#3A4657"
        strokeWidth="2"
      />
      <g clipPath="url(#gs-confused-robot-hatch)">
        <g className="gs-robot-rise">
          <g className="gs-robot-look">
            <ellipse cx="340" cy="245" rx="66" ry="52" fill="#E9ECE3" />
            <circle cx="340" cy="238" r="20" fill="#84CC16" />
            <circle cx="340" cy="238" r="9" fill="#0E141A" />
            <ellipse cx="270" cy="240" rx="18" ry="26" fill="#CBD1C0" />
            <ellipse cx="410" cy="240" rx="18" ry="26" fill="#CBD1C0" />
            <rect x="270" y="90" width="140" height="120" rx="46" fill="#F5F7F0" />
            <rect x="292" y="118" width="96" height="66" rx="22" fill="#0E141A" />
            <ellipse cx="322" cy="151" rx="14" ry="17" fill="#84CC16" />
            <ellipse cx="358" cy="151" rx="14" ry="17" fill="#84CC16" />
            <circle cx="278" cy="128" r="13" fill="#CBD1C0" />
            <circle cx="402" cy="128" r="13" fill="#CBD1C0" />
            <rect x="332" y="66" width="16" height="26" rx="8" fill="#CBD1C0" />
            <circle cx="340" cy="60" r="9" fill="#84CC16" />
          </g>
        </g>
      </g>
      <text
        className="gs-robot-question"
        x="430"
        y="80"
        fontSize="46"
        fontWeight="700"
        fill="#84CC16"
      >
        ?
      </text>
    </svg>
  );
}
