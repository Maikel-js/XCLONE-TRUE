export function TrendingPanel() {
    const trends = [
        { category: 'Tendencias en Tecnología', title: '#NextJS', posts: '12,4 mil posts' },
        { category: 'Tendencias en Deportes', title: '#LaLiga', posts: '8,1 mil posts' },
        { category: 'Tendencias en Música', title: '#SpotifyWrapped', posts: '22,9 mil posts' },
    ]

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <h2 className="px-4 py-3 text-xl font-bold">Tendencias para ti</h2>
            <ul>
                {trends.map((t) => (
                    <li
                        key={t.title}
                        className="card-hover cursor-pointer border-t border-[var(--color-border)] px-4 py-3 text-sm"
                    >
                        <p className="text-xs text-[var(--color-muted)]">{t.category}</p>
                        <p className="font-bold">{t.title}</p>
                        <p className="text-xs text-[var(--color-muted)]">{t.posts}</p>
                    </li>
                ))}
            </ul>
        </section>
    )
}
