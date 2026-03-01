// Utils
import { PokemonSetType } from '@/types/pokemon-grid'

let pokemonSetsInit: Promise<void> | null = null

const groups: Record<string, PokemonSetType[]> = {
    sv: [],
    swsh: [],
    sm: [],
    xy: [],
    bw: [],
    dp: [],
    me: [],
    base: [],
    other: [],
    ex: [],
    neo: [],
    pl: [],
    hgss: [],
    pop: [],
    ecard: []
}

const pokemonSetNameMap: Record<string, string> = {}

const fetchPokemonSets = async (): Promise<void> => {
    // If already initialized, just return the existing promise
    if (pokemonSetsInit) return pokemonSetsInit

    pokemonSetsInit = (async () => {
        try {
            fetch('/api/pokemon-set')
                .then((res) => res.json())
                .then((data) => {
                    const sets = Array.isArray(data) ? data : [data]
                    sets.forEach((set) => {
                        const id = set.id?.toLowerCase() ?? ''
                        pokemonSetNameMap[id] = set.name ?? ''
                        if (id.includes('sv')) groups.sv.push(set)
                        else if (id.includes('swsh')) groups.swsh.push(set)
                        else if (id.includes('sm')) groups.sm.push(set)
                        else if (id.includes('xy')) groups.xy.push(set)
                        else if (id.includes('bw')) groups.bw.push(set)
                        else if (id.includes('hgss') || id.includes('tk-hs'))
                            groups.hgss.push(set)
                        else if (id.includes('pl')) groups.pl.push(set)
                        else if (id.includes('dp')) groups.dp.push(set)
                        else if (id.includes('me')) groups.me.push(set)
                        else if (id.includes('ex')) groups.ex.push(set)
                        else if (id.includes('ecard')) groups.ecard.push(set)
                        else if (id.includes('pop')) groups.pop.push(set)
                        else if (id.includes('neo') || id.includes('si'))
                            groups.neo.push(set)
                        else if (id.includes('base')) groups.base.push(set)
                        else groups.other.push(set)
                    })
                })
        } catch (err) {
            console.error('Fetch error for pokemon sets:', err)
        }
    })()

    return pokemonSetsInit
}

export const getSetName = async (id: string): Promise<string | undefined> => {
    if (Object.keys(pokemonSetNameMap).length === 0) await fetchPokemonSets()
    return pokemonSetNameMap[id] || 'INVALID SET'
}

export const getSetGroups = async (): Promise<
    Record<string, PokemonSetType[]>
> => {
    if (pokemonSetsInit === null) await fetchPokemonSets()
    return groups
}
