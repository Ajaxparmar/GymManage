export function applyGymTheme(primaryColor: string, accentColor: string, darkMode: boolean) {
    if (typeof window === "undefined") return;
  
    const root = document.documentElement;
  
    // ── Dark / light mode ──────────────────────────────────────────────────
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  
    // ── Hex → OKLCH converter ──────────────────────────────────────────────
    function hexToOklch(hex: string): string {
      // Expand shorthand
      const full = hex.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i,
        (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);
  
      // Hex → linear RGB
      let r = parseInt(full.slice(1, 3), 16) / 255;
      let g = parseInt(full.slice(3, 5), 16) / 255;
      let b = parseInt(full.slice(5, 7), 16) / 255;
  
      // sRGB → linear
      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
      // Linear RGB → XYZ (D65)
      const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
      const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
      const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;
  
      // XYZ → OKLab
      const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
      const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
      const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  
      const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
      const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
      const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  
      // OKLab → OKLCH
      const C = Math.sqrt(a * a + bLab * bLab);
      const H = (Math.atan2(bLab, a) * 180) / Math.PI;
      const hue = H < 0 ? H + 360 : H;
  
      return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${hue.toFixed(3)})`;
    }
  
    // ── Apply CSS variables ────────────────────────────────────────────────
    const primaryOklch = hexToOklch(primaryColor);
    const accentOklch = hexToOklch(accentColor);
  
    root.style.setProperty("--primary", primaryOklch);
    root.style.setProperty("--ring", primaryOklch);
    root.style.setProperty("--sidebar-primary", primaryOklch);
    root.style.setProperty("--accent", accentOklch);
  
    // Auto foreground: use dark text on light colors, light on dark
    const primaryL = parseFloat(primaryOklch.split("(")[1]);
    const primaryFg = primaryL > 0.5 ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)";
    root.style.setProperty("--primary-foreground", primaryFg);
    root.style.setProperty("--sidebar-primary-foreground", primaryFg);
  }