# Name corpus

## Surnames

Common Chinese surnames drawn from the public-domain classic **《百家姓》 (Bǎijiāxìng)**.
This work is centuries old and in the public domain. We include a curated subset with
tone-marked pinyin suitable for learner-facing product copy. Source note: traditional
Chinese surname list (Baijiaxing), public domain; curated for MVP.

## Given names

Self-built allow-lists of single characters and two-character given-name compounds,
tagged by name-style preference (`feminine` / `masculine` / `neutral`) and feeling
hints. Built for CallMeMing MVP — not scraped from commercial naming sites.

## Reject list

Self-built blocklist of crude / embarrassing near-homophones and known bad pairings.
Never crawl commercial 起名 sites or unclear-license datasets.

## Paid selection metadata

Given names also have feeling tags (`friendly` / `calm` / `bright` / `elegant` / `modern` / `scholarly`) and short English glosses in `given-name-traits.ts`. Character meanings and a table of well-known English-name etymologies live in `meanings.ts`. Paid sampling uses these to weight Feeling and to prefer lexicon names with a justifiable pronunciation or meaning link to the English name. It does not invent transliterations or hanzi outside this allow-list.
