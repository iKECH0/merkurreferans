export const triggerSuccessConfetti = async () => {
  const confetti = (await import('canvas-confetti')).default;
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#a78bfa', '#34d399', '#fbbf24']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#a78bfa', '#34d399', '#fbbf24']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export const triggerLevelUpConfetti = async () => {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#ffffff']
  });
};
