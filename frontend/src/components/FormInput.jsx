export default function FormInput({ label, icon, type = "text", value, onChange, placeholder, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface-variant px-1">{label}</label>
            <div className="relative group">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          {icon}
        </span>
                <input
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-outline/60"
                    type={type} value={value} onChange={onChange} placeholder={placeholder} required
                />
                {children}
            </div>
        </div>
    );
}