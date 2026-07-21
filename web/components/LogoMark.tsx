import Image from "next/image";

/** The Shokhi logo mark, sized to fill its round container (used as a small avatar). */
export default function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <Image
      src="/shokhi-mark.png"
      alt="Shokhi"
      width={size}
      height={size}
      className="h-full w-full object-cover"
    />
  );
}
