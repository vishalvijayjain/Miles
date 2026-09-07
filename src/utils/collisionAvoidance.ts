export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ProtectedZone {
  id: string;
  name: string;
  priority: number; // 1: system safe areas, 2: active overlays/dialogs/menus, 3: navigation/header/bottom-nav/workspace, 4: primary actions, 5: content
  rect: Rect;
}

/**
 * Accurately measures iOS safe-area insets using a lightweight DOM probe with env() styles.
 */
export function getSafeAreaInsets(): SafeAreaInsets {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  let probe = document.getElementById('safe-area-probe');
  if (!probe) {
    probe = document.createElement('div');
    probe.id = 'safe-area-probe';
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding-top:env(safe-area-inset-top,0px);' +
      'padding-right:env(safe-area-inset-right,0px);' +
      'padding-bottom:env(safe-area-inset-bottom,0px);' +
      'padding-left:env(safe-area-inset-left,0px);' +
      'z-index:-9999;';
    document.body.appendChild(probe);
  }

  const computed = window.getComputedStyle(probe);
  const top = parseFloat(computed.paddingTop) || 0;
  const right = parseFloat(computed.paddingRight) || 0;
  const bottom = parseFloat(computed.paddingBottom) || 0;
  const left = parseFloat(computed.paddingLeft) || 0;

  return {
    top: Math.max(top, 0),
    right: Math.max(right, 0),
    bottom: Math.max(bottom, 0),
    left: Math.max(left, 0),
  };
}

/**
 * Returns usable viewport bounds respecting iOS safe-area margins and a buffer.
 */
export function getUsableViewport(
  widgetWidth: number,
  widgetHeight: number,
  insets: SafeAreaInsets,
  margin = 12
): { minX: number; maxX: number; minY: number; maxY: number } {
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;

  const minX = insets.left + margin;
  const maxX = Math.max(minX, vpWidth - insets.right - margin - widgetWidth);

  const minY = insets.top + margin;
  const maxY = Math.max(minY, vpHeight - insets.bottom - margin - widgetHeight);

  return { minX, maxX, minY, maxY };
}

/**
 * Checks if two bounding boxes overlap, accounting for an optional boundary buffer.
 */
export function rectsOverlap(
  r1: { left: number; top: number; right: number; bottom: number },
  r2: Rect,
  buffer = 8
): boolean {
  return !(
    r1.right < r2.left - buffer ||
    r1.left > r2.right + buffer ||
    r1.bottom < r2.top - buffer ||
    r1.top > r2.bottom + buffer
  );
}

/**
 * Inspects the current document state and returns all active protected zones.
 */
export function getProtectedZones(): ProtectedZone[] {
  if (typeof document === 'undefined' || typeof window === 'undefined') return [];

  const zones: ProtectedZone[] = [];
  const insets = getSafeAreaInsets();

  // 1. Safe Area Insets (Priority 1)
  if (insets.top > 0) {
    zones.push({
      id: 'safe-area-top',
      name: 'Top Safe Area',
      priority: 1,
      rect: {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: insets.top,
        width: window.innerWidth,
        height: insets.top,
      },
    });
  }

  if (insets.bottom > 0) {
    zones.push({
      id: 'safe-area-bottom',
      name: 'Bottom Safe Area',
      priority: 1,
      rect: {
        left: 0,
        top: window.innerHeight - insets.bottom,
        right: window.innerWidth,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: insets.bottom,
      },
    });
  }

  // 2. Active Overlays, Dialogs, Modals, Dropdowns (Priority 2)
  const dialogs = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], [data-protected-zone="dialog"], [data-protected-zone="workspace-dropdown"], [data-protected-zone="menu"]'
  );
  dialogs.forEach((el, idx) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      zones.push({
        id: `dialog-${idx}`,
        name: 'Active Dialog or Dropdown',
        priority: 2,
        rect: {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
        },
      });
    }
  });

  // 3. Top Header Navigation (Priority 3)
  const header = document.querySelector<HTMLElement>('header, [data-protected-zone="header"]');
  if (header) {
    const r = header.getBoundingClientRect();
    if (r.height > 0) {
      zones.push({
        id: 'header-bar',
        name: 'Top Header Bar',
        priority: 3,
        rect: {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: r.bottom + 6,
          width: window.innerWidth,
          height: r.bottom + 6,
        },
      });
    }
  }

  // 4. Mobile Bottom Navigation (Priority 3)
  const bottomNav = document.querySelector<HTMLElement>(
    'nav[aria-label="Mobile Navigation"], [data-protected-zone="bottom-nav"]'
  );
  if (bottomNav) {
    const r = bottomNav.getBoundingClientRect();
    if (r.height > 0 && r.top < window.innerHeight) {
      zones.push({
        id: 'mobile-bottom-nav',
        name: 'Mobile Navigation Bar',
        priority: 3,
        rect: {
          left: 0,
          top: r.top - 6,
          right: window.innerWidth,
          bottom: window.innerHeight,
          width: window.innerWidth,
          height: window.innerHeight - r.top + 6,
        },
      });
    }
  }

  // 5. Critical Controls: Workspace Selector & Cloud Sync Button (Priority 3)
  const headerSync = document.getElementById('header-cloud-sync-btn');
  if (headerSync) {
    const r = headerSync.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      zones.push({
        id: 'header-sync-btn',
        name: 'Cloud Synced Button',
        priority: 3,
        rect: {
          left: r.left - 4,
          top: r.top - 4,
          right: r.right + 4,
          bottom: r.bottom + 4,
          width: r.width + 8,
          height: r.height + 8,
        },
      });
    }
  }

  const headerWorkspace = document.getElementById('header-workspace-selector');
  if (headerWorkspace) {
    const r = headerWorkspace.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      zones.push({
        id: 'header-workspace-selector-zone',
        name: 'Workspace Selector',
        priority: 3,
        rect: {
          left: r.left - 4,
          top: r.top - 4,
          right: r.right + 4,
          bottom: r.bottom + 4,
          width: r.width + 8,
          height: r.height + 8,
        },
      });
    }
  }

  // 6. Additional protected controls marked with [data-protected-zone]
  const otherProtected = document.querySelectorAll<HTMLElement>('[data-protected-zone]');
  otherProtected.forEach((el) => {
    const zType = el.getAttribute('data-protected-zone');
    if (
      zType === 'header' ||
      zType === 'bottom-nav' ||
      zType === 'dialog' ||
      zType === 'workspace-dropdown' ||
      zType === 'header-sync' ||
      zType === 'header-workspace'
    ) {
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      zones.push({
        id: el.id || `protected-zone-${Math.random().toString(36).substring(2, 7)}`,
        name: zType || 'Protected Control',
        priority: 4,
        rect: {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
        },
      });
    }
  });

  return zones;
}

/**
 * Calculates the nearest valid position requiring the smallest possible displacement
 * from the release position, adhering strictly to collision priorities.
 */
export function findNearestValidPosition(
  releasePos: Position,
  widgetWidth: number,
  widgetHeight: number,
  protectedZones: ProtectedZone[],
  insets: SafeAreaInsets
): { position: Position; hadCollision: boolean } {
  const { minX, maxX, minY, maxY } = getUsableViewport(widgetWidth, widgetHeight, insets);

  // Strictly clamp release point to usable viewport boundaries
  const clampedX = Math.max(minX, Math.min(maxX, releasePos.x));
  const clampedY = Math.max(minY, Math.min(maxY, releasePos.y));

  const widgetRect = {
    left: clampedX,
    top: clampedY,
    right: clampedX + widgetWidth,
    bottom: clampedY + widgetHeight,
  };

  // Find all zones currently overlapped
  const collidedZones = protectedZones.filter((zone) =>
    rectsOverlap(widgetRect, zone.rect, 8)
  );

  // If no collision with any protected zone, widget rests exactly where released
  if (collidedZones.length === 0) {
    return {
      position: { x: clampedX, y: clampedY },
      hadCollision: clampedX !== releasePos.x || clampedY !== releasePos.y,
    };
  }

  // Generate escape candidates requiring the smallest possible displacement
  const candidates: Position[] = [];
  const buffer = 10;

  // 1. Cardinal and corner escapes around collided zones
  for (const zone of collidedZones) {
    const z = zone.rect;
    // Above & below
    candidates.push({ x: clampedX, y: z.top - widgetHeight - buffer });
    candidates.push({ x: clampedX, y: z.bottom + buffer });
    // Left & right
    candidates.push({ x: z.left - widgetWidth - buffer, y: clampedY });
    candidates.push({ x: z.right + buffer, y: clampedY });

    // Corners
    candidates.push({ x: z.left - widgetWidth - buffer, y: z.top - widgetHeight - buffer });
    candidates.push({ x: z.right + buffer, y: z.top - widgetHeight - buffer });
    candidates.push({ x: z.left - widgetWidth - buffer, y: z.bottom + buffer });
    candidates.push({ x: z.right + buffer, y: z.bottom + buffer });
  }

  // 2. Dense radial scan outward from the release point to find minimal deviation
  const radialAngles = [
    0,
    Math.PI / 6,
    Math.PI / 4,
    Math.PI / 3,
    Math.PI / 2,
    (2 * Math.PI) / 3,
    (3 * Math.PI) / 4,
    (5 * Math.PI) / 6,
    Math.PI,
    (7 * Math.PI) / 6,
    (5 * Math.PI) / 4,
    (4 * Math.PI) / 3,
    (3 * Math.PI) / 2,
    (5 * Math.PI) / 3,
    (7 * Math.PI) / 4,
    (11 * Math.PI) / 6,
  ];

  for (let radius = 12; radius <= 280; radius += 14) {
    for (const angle of radialAngles) {
      candidates.push({
        x: clampedX + Math.cos(angle) * radius,
        y: clampedY + Math.sin(angle) * radius,
      });
    }
  }

  interface Evaluated {
    pos: Position;
    distance: number;
    penalty: number;
  }

  const evaluated: Evaluated[] = [];

  for (const cand of candidates) {
    const cx = Math.max(minX, Math.min(maxX, cand.x));
    const cy = Math.max(minY, Math.min(maxY, cand.y));

    const candRect = {
      left: cx,
      top: cy,
      right: cx + widgetWidth,
      bottom: cy + widgetHeight,
    };

    let penalty = 0;
    for (const zone of protectedZones) {
      if (rectsOverlap(candRect, zone.rect, 8)) {
        // Strict priority ranking:
        // Priority 1 (Safe Areas): 100,000
        // Priority 2 (Active Overlays/Menus): 20,000
        // Priority 3 (Navigation / Header / Bottom Nav / Sync / Workspace): 5,000
        // Priority 4 (Action buttons): 1,000
        // Priority 5 (Other): 200
        const weight =
          zone.priority === 1
            ? 100000
            : zone.priority === 2
            ? 20000
            : zone.priority === 3
            ? 5000
            : zone.priority === 4
            ? 1000
            : 200;
        penalty += weight;
      }
    }

    const dist = Math.hypot(cx - clampedX, cy - clampedY);

    evaluated.push({
      pos: { x: cx, y: cy },
      distance: dist,
      penalty,
    });
  }

  // 1. Select zero-collision candidates with smallest displacement
  const cleanCandidates = evaluated.filter((e) => e.penalty === 0);
  if (cleanCandidates.length > 0) {
    cleanCandidates.sort((a, b) => a.distance - b.distance);
    return {
      position: cleanCandidates[0].pos,
      hadCollision: true,
    };
  }

  // 2. If completely constrained, pick the lowest penalty zone, then smallest displacement
  evaluated.sort((a, b) => {
    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty;
    }
    return a.distance - b.distance;
  });

  return {
    position: evaluated[0].pos,
    hadCollision: true,
  };
}

/**
 * Calculates optimal popover bounds for the frosted focus view, ensuring it
 * is 100% visible and never clipped outside the usable viewport.
 */
export function getOptimalPopoverPlacement(
  widgetPos: Position,
  widgetWidth: number,
  widgetHeight: number,
  popoverWidth: number,
  popoverHeight: number,
  insets: SafeAreaInsets
): { left: number; top: number; placement: 'below' | 'above' | 'centered' } {
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;

  const minLeft = insets.left + 12;
  const maxLeft = Math.max(minLeft, vpWidth - insets.right - 12 - popoverWidth);

  const minTop = insets.top + 12;
  const maxTop = Math.max(minTop, vpHeight - insets.bottom - 12 - popoverHeight);

  // Try placing below widget first
  if (widgetPos.y + widgetHeight + 10 + popoverHeight <= vpHeight - insets.bottom - 12) {
    // Horizontally align with widget, clamped to screen
    const idealLeft = widgetPos.x + widgetWidth / 2 - popoverWidth / 2;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft));
    return {
      left: clampedLeft,
      top: widgetPos.y + widgetHeight + 10,
      placement: 'below',
    };
  }

  // Try placing above widget
  if (widgetPos.y - 10 - popoverHeight >= insets.top + 12) {
    const idealLeft = widgetPos.x + widgetWidth / 2 - popoverWidth / 2;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft));
    return {
      left: clampedLeft,
      top: widgetPos.y - 10 - popoverHeight,
      placement: 'above',
    };
  }

  // Center horizontally and vertically within usable viewport
  const centerLeft = Math.max(minLeft, Math.min(maxLeft, (vpWidth - popoverWidth) / 2));
  const centerTop = Math.max(minTop, Math.min(maxTop, (vpHeight - popoverHeight) / 2));

  return {
    left: centerLeft,
    top: centerTop,
    placement: 'centered',
  };
}
