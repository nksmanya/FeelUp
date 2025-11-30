import Image from "next/image";

export default function Logo({ size = 36 }: { size?: number }) {
  const imgSize = Math.max(24, size);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className="logo-img" style={{ width: imgSize, height: imgSize }}>
        <Image src="/log.png" alt="FeelUp logo" width={imgSize} height={imgSize} />
      </div>
      <span className="logo-text">FeelUp</span>
    </div>
  );
}
