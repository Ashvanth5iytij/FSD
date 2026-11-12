import React from 'react'

export default function LiveWallpaper() {
  return (
    <div className="site-wallpaper" aria-hidden="true">
      <div className="site-wallpaper-lights"><i /><i /><i /><i /><i /><i /></div>
      <div className="site-wallpaper-particles" />
      <svg className="site-wallpaper-waves" viewBox="0 0 1600 260" preserveAspectRatio="none">
        <defs>
          <linearGradient id="page-wave-purple" x1="0" x2="1">
            <stop offset="0" stopColor="#5121ff" stopOpacity=".1" />
            <stop offset=".48" stopColor="#df36ff" stopOpacity=".75" />
            <stop offset="1" stopColor="#532eff" stopOpacity=".18" />
          </linearGradient>
          <linearGradient id="page-wave-blue" x1="0" x2="1">
            <stop offset="0" stopColor="#4a2dff" stopOpacity=".12" />
            <stop offset=".5" stopColor="#13aaff" stopOpacity=".62" />
            <stop offset="1" stopColor="#aa38ff" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <path className="site-wave site-wave-purple" d="M-50 178 C120 68 200 232 378 181 S647 88 817 169 1056 228 1240 151 1482 72 1650 142" />
        <path className="site-wave site-wave-blue" d="M-50 203 C110 153 212 90 366 151 S621 223 812 170 1040 98 1222 161 1470 221 1650 116" />
        <path className="site-wave site-wave-violet" d="M-50 140 C145 227 244 112 414 160 S651 215 833 125 1052 83 1221 175 1488 192 1650 154" />
      </svg>
    </div>
  )
}
