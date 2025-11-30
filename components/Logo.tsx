import Image from "next/image";

type LogoProps = {
  size?: number;
  src?: string; // allow overriding the image (e.g. favicon)
};

export default function Logo({ size = 36, src = "/favicon.png" }: LogoProps) {
  const imgSize = Math.max(24, size);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className="logo-img" style={{ width: imgSize, height: imgSize }}>
        <Image src={src} alt="FeelUp logo" width={imgSize} height={imgSize} />
      </div>
      <span className="logo-text">FeelUp</span>
    </div>
  );
}
    