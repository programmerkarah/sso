export default function AnimatedBackground() {
    return (
        <div className="app-background fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,174,239,0.12),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(140,198,63,0.08),transparent_28%),radial-gradient(circle_at_70%_88%,rgba(247,148,29,0.05),transparent_24%)]" />
        </div>
    );
}
