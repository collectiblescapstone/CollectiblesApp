const starterPokemons = [
    '000_bulbasaur.png',
    '001_charmander.png',
    '002_squirtle.png',
    '003_chikorita.png',
    '004_cyndaquil.png',
    '005_totodile.png',
    '006_treecko.png',
    '007_torchic.png',
    '008_mudkip.png',
    '009_turtwig.png',
    '010_chimchar.png',
    '011_piplup.png',
    '012_snivy.png',
    '013_tepig.png',
    '014_oshawott.png',
    '015_chespin.png',
    '016_fennekin.png',
    '017_froakie.png',
    '018_rowlet.png',
    '019_litten.png',
    '020_popplio.png',
    '021_pikachu.png',
    '022_pichu.png',
    '023_magikarp.png'
]
export const profilePictures = starterPokemons.map((file) => {
    const [id, name_] = file.split('_')
    const name = name_.split('.')[0]
    const displayedName = name[0].toUpperCase() + name.slice(1)
    return {
        id: Number.parseInt(id),
        name: displayedName,
        path: `/user-profile/pfps/${file}`
    }
})

export const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'friends_only', label: 'Friends Only' }
]
