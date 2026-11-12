import {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Gamepad2,
  ReceiptText,
  HeartPulse,
  Ellipsis,
  Wallet,
  GraduationCap,
  Gift,
  Tag,
} from 'lucide-react'

const MAP = {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Gamepad2,
  ReceiptText,
  HeartPulse,
  Ellipsis,
  Wallet,
  GraduationCap,
  Gift,
  Tag,
}

export default function CategoryIcon({ name, ...props }) {
  const Icon = MAP[name] || Ellipsis
  return <Icon {...props} />
}
