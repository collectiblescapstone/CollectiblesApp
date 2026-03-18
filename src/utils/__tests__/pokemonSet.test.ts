describe('pokemonSet utils', () => {
    const originalFetch = global.fetch

    afterAll(() => {
        global.fetch = originalFetch
    })

    it('loads set names/info and groups sets by id pattern', async () => {
        jest.resetModules()

        const sets = [
            { id: 'sv1', name: 'Scarlet Violet' },
            { id: 'swsh1', name: 'Sword Shield' },
            { id: 'sm1', name: 'Sun Moon' },
            { id: 'xy1', name: 'XY' },
            { id: 'bw1', name: 'Black White' },
            { id: 'hgss1', name: 'HGSS' },
            { id: 'pl1', name: 'Platinum' },
            { id: 'dp1', name: 'Diamond Pearl' },
            { id: 'me1', name: 'McDonalds' },
            { id: 'ex1', name: 'EX' },
            { id: 'ecard1', name: 'E-Card' },
            { id: 'pop1', name: 'POP' },
            { id: 'neo1', name: 'Neo' },
            { id: 'base1', name: 'Base Set' },
            { id: 'misc1', name: 'Other' }
        ]

        global.fetch = jest.fn().mockResolvedValue({
            json: async () => sets
        } as Response)

        const { getSetGroups, getSetInfo, getSetName } =
            await import('../pokemonSet')

        // First call triggers fetch; second call reads populated cache
        await getSetGroups()
        const groups = await getSetGroups()

        expect(groups.sv).toHaveLength(1)
        expect(groups.swsh).toHaveLength(1)
        expect(groups.sm).toHaveLength(1)
        expect(groups.xy).toHaveLength(1)
        expect(groups.bw).toHaveLength(1)
        expect(groups.hgss).toHaveLength(1)
        expect(groups.pl).toHaveLength(1)
        expect(groups.dp).toHaveLength(1)
        expect(groups.me).toHaveLength(1)
        expect(groups.ex).toHaveLength(1)
        expect(groups.ecard).toHaveLength(1)
        expect(groups.pop).toHaveLength(1)
        expect(groups.neo).toHaveLength(1)
        expect(groups.base).toHaveLength(1)
        expect(groups.other).toHaveLength(1)

        await getSetName('sv1')
        expect(await getSetName('sv1')).toBe('Scarlet Violet')
        expect(await getSetInfo('base1')).toEqual(
            expect.objectContaining({ id: 'base1', name: 'Base Set' })
        )
    })

    it('handles a single non-array API response', async () => {
        jest.resetModules()

        global.fetch = jest.fn().mockResolvedValue({
            json: async () => ({ id: 'tk-hs1', name: 'Trainer Kit HGSS' })
        } as Response)

        const { getSetGroups, getSetInfo, getSetName } =
            await import('../pokemonSet')

        await getSetGroups()
        const groups = await getSetGroups()

        expect(groups.hgss.length).toBeGreaterThan(0)

        await getSetName('tk-hs1')
        expect(await getSetName('tk-hs1')).toBe('Trainer Kit HGSS')
        expect(await getSetInfo('tk-hs1')).toEqual(
            expect.objectContaining({ id: 'tk-hs1' })
        )
    })
})
