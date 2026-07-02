export default function BackgroundLayer() {
  return (
    <div 
      className="absolute inset-0 z-0" 
      style={{ backgroundColor: "#f7f5f0" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #1a3557 0px,
            #1a3557 1px,
            transparent 1px,
            transparent 12px
          )`,
        }}
      />
    </div>
  );
}
