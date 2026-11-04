export function TrendingPanel() {
    const trends = [
        { category: 'Tendencias en Tecnología', title: '#NextJS', posts: '12,4 mil posts' },
        { category: 'Tendencias en Deportes', title: '#LaLiga', posts: '8,1 mil posts' },
        { category: 'Tendencias en Música', title: '#SpotifyWrapped', posts: '22,9 mil posts' },
    ]

    return (
        <section className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-black">
            <h2 className="px-5 py-4 text-xl font-bold 2xl:text-[28px]">Tendencias para ti</h2>
            <ul>
                {trends.map((t) => (
                    <li
                        key={t.title}
                        className="card-hover cursor-pointer border-t border-[var(--color-border)] px-5 py-4 text-sm 2xl:text-lg"
                    >
                        <p className="text-xs text-[var(--color-muted)] 2xl:text-base">{t.category}</p>
                        <p className="font-bold">{t.title}</p>
                        <p className="text-xs text-[var(--color-muted)] 2xl:text-base">{t.posts}</p>
                    </li>
                ))}
            </ul>
        </section>
    )
}
