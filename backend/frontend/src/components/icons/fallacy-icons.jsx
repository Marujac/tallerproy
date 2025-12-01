import { AlertTriangle, UserMinus, Bot, FastForward, Shield, TrendingDown, Scale, Megaphone, Repeat, Brain, HelpingHand } from 'lucide-react';

const iconMap = {
  'ad hominem': UserMinus,
  'hombre de paja': Bot,
  'generalización apresurada': FastForward,
  'apelación a la autoridad': Shield,
  'pendiente resbaladiza': TrendingDown,
  'falsa dicotomía': Scale,
  'apelación a la emoción': Megaphone,
  'razonamiento circular': Repeat,
  'sesgo cognitivo': Brain,
  'tu quoque': HelpingHand,
  'default': AlertTriangle,
};

export function FallacyIcon({ type, ...props }) {
  const normalizedType = type.toLowerCase().replace(/falacia|sesgo/gi, '').trim();
  const Icon = iconMap[normalizedType] || iconMap.default;
  return <Icon {...props} />;
}
