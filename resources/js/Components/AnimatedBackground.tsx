export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-emerald-600 to-amber-600"></div>

            {/* Static Decorative Bubbles - No Animation */}
            <div className="absolute inset-0">
                <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"></div>
                <div className="absolute right-[15%] top-[40%] h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"></div>
                <div className="absolute bottom-[20%] left-[30%] h-80 w-80 rounded-full bg-violet-400/10 blur-3xl"></div>
                <div className="absolute bottom-[30%] right-[25%] h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl"></div>
            </div>

            {/* Overlay Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC04Yy0xLjEgMC0yIC45LTIgMnY4YzAgMS4xLjkgMiAyIDJoOGMxLjEgMCAyLS45IDItMnYtOHptMCAzMmMwLTEuMS0uOS0yLTItMmgtOGMtMS4xIDAtMiAuOS0yIDJ2OGMwIDEuMS45IDIgMiAyaDhjMS4xIDAgMi0uOSAyLTJ2LTh6TTQgMTRjMC0xLjEtLjktMi0yLTJoLThjLTEuMSAwLTIgLjktMiAydjhjMCAxLjEuOSAyIDIgMmg4YzEuMSAwIDItLjkgMi0ydi04em0wIDMyYzAtMS4xLS45LTItMi0yaC04Yy0xLjEgMC0yIC45LTIgMnY4YzAgMS4xLjkgMiAyIDJoOGMxLjEgMCAyLS45IDItMnYtOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        </div>
    );
}
