export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(5,150,105,0.10),transparent_32%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950" />
        </div>
    );
}
