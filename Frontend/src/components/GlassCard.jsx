const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;