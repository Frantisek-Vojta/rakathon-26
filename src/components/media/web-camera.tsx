// V mobilní aplikaci fotí a natáčí fotoaparát systému (expo-image-picker).
// Kamera v okně aplikace je jen pro web na počítači (web-camera.web.tsx).

export type WebCameraProps = {
  mode: 'foto' | 'video';
  onCaptured: (uri: string, mime: string, durationMs: number | null) => void;
  onCancel: () => void;
  /** Kamera nejde zapnout: místo ní se otevře výběr souboru. */
  onUnavailable: () => void;
};

export function webCameraSupported(_mode: 'foto' | 'video' = 'foto') {
  return false;
}

export function WebCamera(_props: WebCameraProps) {
  return null;
}
